"""
Flight Delay Insurance Backend
INNOBLOCK 2.0

Backend responsibilities:
- Connect to FlightInsurance smart contract on Sepolia
- Store application data in SQLite/PostgreSQL
- Provide mock flight-delay oracle
- Update flight delays on-chain
- Check policy eligibility
- Process eligible payouts
- Provide AI decision/explanation endpoint
- Store customer feedback
- Return transaction/explorer information

Run locally:
    python app.py

Render:
    gunicorn app:app --timeout 120
"""

import json
import os
import sqlite3
import requests

from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from psycopg import connect
from psycopg.rows import dict_row
from web3 import Web3
from werkzeug.exceptions import HTTPException


# ============================================================
# ENVIRONMENT
# ============================================================

HERE = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(HERE, ".env"))


REQUIRED = [
    "RPC_URL",
    "PRIVATE_KEY",
    "CONTRACT_ADDRESS",
]

missing = [
    name for name in REQUIRED
    if not os.getenv(name)
]

if missing:
    raise SystemExit(
        "Missing in backend/.env: "
        + ", ".join(missing)
        + ". Please check your .env file."
    )


RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

EXPLORER_URL = os.getenv(
    "EXPLORER_URL",
    "https://sepolia.etherscan.io"
).rstrip("/")

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "*"
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    ""
)

# AI configuration
AI_API_KEY = os.getenv(
    "API_KEY",
    ""
)

AI_BASE_URL = os.getenv(
    "AI_BASE_URL",
    "https://api.openai.com/v1"
).rstrip("/")

AI_MODEL = os.getenv(
    "AI_MODEL",
    ""
)


# ============================================================
# APPLICATION
# ============================================================

app = Flask(__name__)

CORS(
    app,
    origins=[FRONTEND_ORIGIN]
)


# ============================================================
# BLOCKCHAIN
# ============================================================

w3 = Web3(
    Web3.HTTPProvider(RPC_URL)
)

if not w3.is_connected():
    raise SystemExit(
        "Could not connect to Sepolia RPC. "
        "Check RPC_URL in backend/.env."
    )


account = w3.eth.account.from_key(
    PRIVATE_KEY
)

CONTRACT_ADDRESS = Web3.to_checksum_address(
    CONTRACT_ADDRESS
)


# Load ABI
ABI_PATH = os.path.join(
    HERE,
    "abi.json"
)

with open(ABI_PATH, "r", encoding="utf-8") as f:
    CONTRACT_ABI = json.load(f)


contract = w3.eth.contract(
    address=CONTRACT_ADDRESS,
    abi=CONTRACT_ABI
)


# ============================================================
# DATABASE
# ============================================================

SQLITE_PATH = os.path.join(
    HERE,
    "flight_insurance.db"
)


def get_connection():
    """
    Returns either PostgreSQL or SQLite connection.
    """

    if DATABASE_URL:

        return connect(
            DATABASE_URL,
            row_factory=dict_row
        )

    conn = sqlite3.connect(
        SQLITE_PATH
    )

    conn.row_factory = sqlite3.Row

    return conn


def execute(sql, params=()):
    """
    Execute INSERT/UPDATE/DELETE.
    """

    if DATABASE_URL:

        with get_connection() as conn:

            conn.execute(
                sql.replace("?", "%s"),
                params
            )

            conn.commit()

        return


    conn = get_connection()

    try:

        with conn:

            conn.execute(
                sql,
                params
            )

    finally:

        conn.close()


def fetch_one(sql, params=()):
    """
    Return one database row.
    """

    if DATABASE_URL:

        with get_connection() as conn:

            row = conn.execute(
                sql.replace("?", "%s"),
                params
            ).fetchone()

            return dict(row) if row else None


    conn = get_connection()

    try:

        row = conn.execute(
            sql,
            params
        ).fetchone()

        return dict(row) if row else None

    finally:

        conn.close()


def fetch_all(sql, params=()):
    """
    Return multiple database rows.
    """

    if DATABASE_URL:

        with get_connection() as conn:

            rows = conn.execute(
                sql.replace("?", "%s"),
                params
            ).fetchall()

            return [dict(row) for row in rows]


    conn = get_connection()

    try:

        rows = conn.execute(
            sql,
            params
        ).fetchall()

        return [dict(row) for row in rows]

    finally:

        conn.close()


# ============================================================
# DATABASE TABLES
# ============================================================

def initialize_database():

    execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY,
            wallet_address TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    execute("""
        CREATE TABLE IF NOT EXISTS flights (
            id INTEGER PRIMARY KEY,
            flight_number TEXT UNIQUE NOT NULL,
            airline TEXT,
            origin TEXT,
            destination TEXT,
            scheduled_departure TEXT,
            actual_departure TEXT,
            delay_minutes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'SCHEDULED',
            updated_at TEXT
        )
    """)

    execute("""
        CREATE TABLE IF NOT EXISTS policies (
            id INTEGER PRIMARY KEY,
            blockchain_policy_id INTEGER UNIQUE NOT NULL,
            customer_wallet TEXT NOT NULL,
            flight_number TEXT NOT NULL,
            plan TEXT NOT NULL,
            premium TEXT NOT NULL,
            coverage TEXT NOT NULL,
            delay_threshold INTEGER NOT NULL,
            actual_delay INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            eligible INTEGER DEFAULT 0,
            paid INTEGER DEFAULT 0,
            purchase_tx_hash TEXT,
            delay_tx_hash TEXT,
            payout_tx_hash TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            policy_id INTEGER,
            transaction_type TEXT NOT NULL,
            tx_hash TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            explorer_url TEXT,
            created_at TEXT NOT NULL
        )
    """)

    execute("""
        CREATE TABLE IF NOT EXISTS ai_decisions (
            id INTEGER PRIMARY KEY,
            policy_id INTEGER,
            decision_type TEXT NOT NULL,
            input_data TEXT,
            decision TEXT,
            created_at TEXT NOT NULL
        )
    """)

    execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY,
            wallet_address TEXT,
            rating INTEGER,
            message TEXT,
            ai_sentiment TEXT,
            created_at TEXT NOT NULL
        )
    """)


initialize_database()


# ============================================================
# HELPERS
# ============================================================

def now_iso():
    return datetime.now(
        timezone.utc
    ).isoformat()


def explorer_tx(tx_hash):
    return f"{EXPLORER_URL}/tx/{tx_hash}"


def explorer_address(address):
    return f"{EXPLORER_URL}/address/{address}"


def send_blockchain_transaction(function):

    """
    Build, sign, send and wait for a blockchain transaction.
    """

    nonce = w3.eth.get_transaction_count(
        account.address,
        "pending"
    )

    tx = function.build_transaction({
        "from": account.address,
        "nonce": nonce,
        "chainId": w3.eth.chain_id,
        "gas": 250000,
        "gasPrice": w3.eth.gas_price
    })

    signed = account.sign_transaction(
        tx
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed.raw_transaction
    )

    tx_hex = w3.to_hex(
        tx_hash
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash,
        timeout=180
    )

    if receipt.status != 1:

        raise RuntimeError(
            f"Blockchain transaction failed: {tx_hex}"
        )

    return tx_hex, receipt


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "ok": True,
        "service": "Flight Insurance Backend",
        "network": "Sepolia",
        "chainId": w3.eth.chain_id,
        "block": w3.eth.block_number,
        "backendWallet": account.address,
        "contract": CONTRACT_ADDRESS,
        "contractExplorer": explorer_address(
            CONTRACT_ADDRESS
        )
    }


# ============================================================
# CONFIG
# ============================================================

@app.get("/api/config")
def config():

    return {
        "network": "Sepolia",
        "chainId": w3.eth.chain_id,
        "contractAddress": CONTRACT_ADDRESS,
        "explorer": EXPLORER_URL
    }


# ============================================================
# FLIGHT ORACLE
# ============================================================

@app.get("/api/flights/<flight_number>")
def get_flight(flight_number):

    flight_number = flight_number.upper()

    flight = fetch_one(
        """
        SELECT *
        FROM flights
        WHERE flight_number = ?
        """,
        (flight_number,)
    )

    if not flight:

        return jsonify(
            error="Flight not found"
        ), 404

    return flight


@app.post("/api/flights")
def create_or_update_flight():

    data = request.get_json(
        silent=True
    ) or {}

    flight_number = str(
        data.get("flightNumber", "")
    ).strip().upper()

    if not flight_number:

        return jsonify(
            error="flightNumber is required"
        ), 400

    airline = data.get(
        "airline",
        "Demo Air"
    )

    origin = data.get(
        "origin",
        "HYD"
    )

    destination = data.get(
        "destination",
        "DEL"
    )

    scheduled_departure = data.get(
        "scheduledDeparture",
        ""
    )

    actual_departure = data.get(
        "actualDeparture",
        ""
    )

    delay_minutes = int(
        data.get(
            "delayMinutes",
            0
        )
    )

    status = (
        "DELAYED"
        if delay_minutes > 0
        else "ON_TIME"
    )

    timestamp = now_iso()

    existing = fetch_one(
        """
        SELECT id
        FROM flights
        WHERE flight_number = ?
        """,
        (flight_number,)
    )

    if existing:

        execute(
            """
            UPDATE flights
            SET airline = ?,
                origin = ?,
                destination = ?,
                scheduled_departure = ?,
                actual_departure = ?,
                delay_minutes = ?,
                status = ?,
                updated_at = ?
            WHERE flight_number = ?
            """,
            (
                airline,
                origin,
                destination,
                scheduled_departure,
                actual_departure,
                delay_minutes,
                status,
                timestamp,
                flight_number
            )
        )

    else:

        execute(
            """
            INSERT INTO flights (
                flight_number,
                airline,
                origin,
                destination,
                scheduled_departure,
                actual_departure,
                delay_minutes,
                status,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                flight_number,
                airline,
                origin,
                destination,
                scheduled_departure,
                actual_departure,
                delay_minutes,
                status,
                timestamp
            )
        )

    return {
        "success": True,
        "flightNumber": flight_number,
        "delayMinutes": delay_minutes,
        "status": status
    }


# ============================================================
# MOCK ORACLE → BLOCKCHAIN
# ============================================================

@app.post("/api/oracle/update-delay")
def oracle_update_delay():

    data = request.get_json(
        silent=True
    ) or {}

    policy_id = int(
        data.get("policyId", 0)
    )

    actual_delay = int(
        data.get("actualDelay", 0)
    )

    if policy_id <= 0:

        return jsonify(
            error="Valid policyId is required"
        ), 400

    if actual_delay < 0:

        return jsonify(
            error="Delay cannot be negative"
        ), 400

    # Verify policy exists on-chain first
    policy = contract.functions.getPolicy(
        policy_id
    ).call()

    threshold = policy[6]
    eligible = actual_delay >= threshold

    tx_hash, receipt = send_blockchain_transaction(
        contract.functions.updateFlightDelay(
            policy_id,
            actual_delay
        )
    )

    execute(
        """
        UPDATE policies
        SET actual_delay = ?,
            eligible = ?,
            delay_tx_hash = ?,
            updated_at = ?
        WHERE blockchain_policy_id = ?
        """,
        (
            actual_delay,
            1 if eligible else 0,
            tx_hash,
            now_iso(),
            policy_id
        )
    )

    execute(
        """
        INSERT INTO transactions (
            policy_id,
            transaction_type,
            tx_hash,
            status,
            explorer_url,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            policy_id,
            "FLIGHT_DELAY_UPDATE",
            tx_hash,
            "CONFIRMED",
            explorer_tx(tx_hash),
            now_iso()
        )
    )

    return {
        "success": True,
        "policyId": policy_id,
        "actualDelay": actual_delay,
        "threshold": threshold,
        "eligible": eligible,
        "txHash": tx_hash,
        "explorerUrl": explorer_tx(tx_hash)
    }


# ============================================================
# POLICY
# ============================================================

@app.get("/api/policies/<int:policy_id>")
def get_policy(policy_id):

    policy = contract.functions.getPolicy(
        policy_id
    ).call()

    return {
        "policyId": policy[0],
        "customer": policy[1],
        "flightNumber": policy[2],
        "plan": policy[3],
        "premiumWei": str(policy[4]),
        "coverageWei": str(policy[5]),
        "delayThreshold": policy[6],
        "actualDelay": policy[7],
        "active": policy[8],
        "eligible": policy[9],
        "paid": policy[10]
    }


@app.get("/api/policies")
def list_policies():

    count = contract.functions.policyCount().call()

    policies = []

    for policy_id in range(
        1,
        count + 1
    ):

        policy = contract.functions.getPolicy(
            policy_id
        ).call()

        policies.append({
            "policyId": policy[0],
            "customer": policy[1],
            "flightNumber": policy[2],
            "plan": policy[3],
            "premiumWei": str(policy[4]),
            "coverageWei": str(policy[5]),
            "delayThreshold": policy[6],
            "actualDelay": policy[7],
            "active": policy[8],
            "eligible": policy[9],
            "paid": policy[10]
        })

    return {
        "count": count,
        "policies": policies
    }


# ============================================================
# CLAIM / PAYOUT
# ============================================================

@app.post("/api/claims/<int:policy_id>/payout")
def process_payout(policy_id):

    policy = contract.functions.getPolicy(
        policy_id
    ).call()

    if not policy[9]:

        return jsonify(
            error="Policy is not eligible for payout"
        ), 400

    if policy[10]:

        return jsonify(
            error="Payout has already been processed"
        ), 400

    tx_hash, receipt = send_blockchain_transaction(
        contract.functions.processPayout(
            policy_id
        )
    )

    execute(
        """
        UPDATE policies
        SET active = 0,
            paid = 1,
            payout_tx_hash = ?,
            updated_at = ?
        WHERE blockchain_policy_id = ?
        """,
        (
            tx_hash,
            now_iso(),
            policy_id
        )
    )

    execute(
        """
        INSERT INTO transactions (
            policy_id,
            transaction_type,
            tx_hash,
            status,
            explorer_url,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            policy_id,
            "PAYOUT",
            tx_hash,
            "CONFIRMED",
            explorer_tx(tx_hash),
            now_iso()
        )
    )

    return {
        "success": True,
        "policyId": policy_id,
        "amountWei": str(policy[5]),
        "txHash": tx_hash,
        "explorerUrl": explorer_tx(tx_hash)
    }


# ============================================================
# AI
# ============================================================

@app.post("/api/ai/risk")
def ai_risk():

    data = request.get_json(
        silent=True
    ) or {}

    flight_number = data.get(
        "flightNumber",
        "Unknown"
    )

    delay_minutes = int(
        data.get(
            "delayMinutes",
            0
        )
    )

    threshold = int(
        data.get(
            "threshold",
            60
        )
    )

    if delay_minutes >= threshold:

        default_decision = (
            "HIGH CLAIM RISK: "
            "The recorded delay meets or exceeds "
            "the policy threshold."
        )

    elif delay_minutes >= threshold * 0.5:

        default_decision = (
            "MEDIUM CLAIM RISK: "
            "The flight is significantly delayed, "
            "but has not yet reached the policy threshold."
        )

    else:

        default_decision = (
            "LOW CLAIM RISK: "
            "The current delay is below the policy threshold."
        )

    if not AI_API_KEY:

        return {
            "flightNumber": flight_number,
            "decision": default_decision,
            "demo": True
        }

    prompt = f"""
Analyze this flight insurance situation.

Flight: {flight_number}
Current delay: {delay_minutes} minutes
Policy threshold: {threshold} minutes

Explain:
1. Risk level
2. Whether the policy appears eligible
3. A short reason for the customer
"""

    response = requests.post(
        f"{AI_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": AI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant for a "
                        "flight-delay insurance platform."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        },
        timeout=60
    )

    if not response.ok:

        return jsonify(
            error="AI provider request failed"
        ), 502

    result = response.json()

    decision = result[
        "choices"
    ][0][
        "message"
    ][
        "content"
    ].strip()

    return {
        "flightNumber": flight_number,
        "decision": decision,
        "demo": False
    }


# ============================================================
# CUSTOMER FEEDBACK
# ============================================================

@app.post("/api/feedback")
def submit_feedback():

    data = request.get_json(
        silent=True
    ) or {}

    wallet = data.get(
        "walletAddress",
        ""
    )

    rating = int(
        data.get(
            "rating",
            0
        )
    )

    message = str(
        data.get(
            "message",
            ""
        )
    ).strip()

    if rating < 1 or rating > 5:

        return jsonify(
            error="Rating must be between 1 and 5"
        ), 400

    if not message:

        return jsonify(
            error="Feedback message is required"
        ), 400

    execute(
        """
        INSERT INTO feedback (
            wallet_address,
            rating,
            message,
            ai_sentiment,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            wallet,
            rating,
            message,
            "PENDING",
            now_iso()
        )
    )

    return {
        "success": True,
        "message": "Feedback submitted successfully"
    }, 201


@app.get("/api/feedback")
def get_feedback():

    rows = fetch_all(
        """
        SELECT *
        FROM feedback
        ORDER BY id DESC
        """
    )

    return {
        "feedback": rows
    }


# ============================================================
# TRANSACTION
# ============================================================

@app.get("/api/transactions/<tx_hash>")
def transaction_status(tx_hash):

    try:

        receipt = w3.eth.get_transaction_receipt(
            tx_hash
        )

        status = (
            "CONFIRMED"
            if receipt.status == 1
            else "FAILED"
        )

        return {
            "txHash": tx_hash,
            "status": status,
            "blockNumber": receipt.blockNumber,
            "explorerUrl": explorer_tx(tx_hash)
        }

    except Exception:

        return {
            "txHash": tx_hash,
            "status": "PENDING",
            "explorerUrl": explorer_tx(tx_hash)
        }


# ============================================================
# ERROR HANDLING
# ============================================================

@app.errorhandler(Exception)
def handle_error(error):

    if isinstance(
        error,
        HTTPException
    ):

        return jsonify(
            error=error.description
        ), error.code

    message = str(error)

    if "insufficient funds" in message.lower():

        message = (
            f"Backend wallet {account.address} "
            "does not have enough Sepolia ETH."
        )

    app.logger.exception(error)

    return jsonify(
        error=message
    ), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    port = int(
        os.getenv(
            "PORT",
            "5000"
        )
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
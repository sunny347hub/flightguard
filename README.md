# ✈️ FlightGuard — Blockchain-Based Flight Delay Insurance

> A decentralized parametric flight-delay insurance platform that uses smart contracts, blockchain, a mock oracle, AI-assisted risk assessment, and automated claim processing.

## 🏆 Hackathon Project

**INNOBLOCK 2.0 — Blockchain Hackathon**

---

## 🚀 Live Demo

🌐 **FlightGuard Application:**  
https://flightguard-1.onrender.com

💻 **GitHub Repository:**  
https://github.com/sunny347hub/flightguard

🔗 **Blockchain Network:** Ethereum Sepolia Testnet

---

## 🎯 Problem Statement

Traditional flight-delay insurance can require passengers to submit claims manually, provide supporting information, wait for verification, and wait for compensation.

This creates:

- Manual claim processing
- Long waiting times
- Additional paperwork
- Lack of transparency
- Difficult claim verification
- Delayed compensation

FlightGuard addresses this problem using programmable, condition-based insurance rules implemented through blockchain smart contracts.

---

## 💡 Our Solution

FlightGuard is a blockchain-based flight-delay insurance platform where compensation eligibility is determined using predefined flight-delay conditions.

Instead of requiring a passenger to manually submit a claim after a qualifying delay, the system follows a parametric insurance model:

```text
Customer buys policy
        ↓
Policy recorded on blockchain
        ↓
Flight delay information received
        ↓
Oracle updates delay on blockchain
        ↓
Smart contract checks policy threshold
        ↓
Eligible?
   ┌────┴────┐
  YES        NO
   ↓          ↓
Payout     No payout
   ↓
Policy settled
```

---

# 🔗 How Blockchain Is Used

FlightGuard uses the **Ethereum Sepolia public testnet** for its blockchain layer.

The deployed `FlightInsurance` smart contract is responsible for:

- Creating insurance policies
- Recording policy details
- Storing premium and coverage values
- Storing delay thresholds
- Receiving flight-delay information
- Determining policy eligibility
- Processing eligible payouts
- Tracking whether a policy has been paid
- Closing a policy after settlement

### Why Blockchain?

Blockchain provides:

- Transparent policy rules
- Publicly verifiable transactions
- Tamper-resistant records
- Programmable insurance conditions
- Traceable payouts
- Reduced dependence on manual claim verification

---

# ⛓️ Blockchain Deployment

### Network

**Ethereum Sepolia Testnet**

### Chain ID

`11155111`

### Smart Contract

`0x5F5FCd92381888357cfD85Ed7Ad4FAE06Dc6c7e3`

### Contract Explorer

https://sepolia.etherscan.io/address/0x5F5FCd92381888357cfD85Ed7Ad4FAE06Dc6c7e3

> ⚠️ This project uses Ethereum Sepolia testnet tokens only. No real-money transactions are used.

---

# 📡 Oracle Architecture

A blockchain smart contract cannot directly access real-world flight information from an airline website or external API.

FlightGuard therefore uses an **oracle layer** to bring flight-delay information from the off-chain environment into the blockchain.

For the hackathon implementation, we use a **Mock Oracle**.

### Mock Oracle Flow

```text
Flight / Mock Flight Data
          ↓
      Backend
          ↓
    Oracle API
          ↓
updateFlightDelay()
          ↓
Ethereum Sepolia
          ↓
FlightInsurance Contract
```

The mock oracle provides information such as:

- Flight number
- Flight status
- Delay duration
- Flight-related information

The most important value for the smart contract is the **actual delay in minutes**.

### Example

```text
Policy threshold = 60 minutes
Actual flight delay = 90 minutes

90 >= 60
      ↓
Eligible = TRUE
      ↓
Payout can be processed
```

> The mock oracle is used for the hackathon demonstration. In a production system, it can be replaced with a trusted real-time flight data API or decentralized oracle infrastructure.

---

# 📜 Smart Contract

The project uses a Solidity smart contract called:

`FlightInsurance`

The contract stores policies using a `Policy` structure.

### Policy Information

Each policy contains:

- Policy ID
- Customer wallet address
- Flight number
- Insurance plan
- Premium
- Coverage amount
- Delay threshold
- Actual delay
- Active status
- Eligibility status
- Payment status

### Main Smart Contract Functions

#### `buyPolicy()`

Creates a new insurance policy and receives the policy premium.

```text
buyPolicy(
    flightNumber,
    plan,
    premium,
    coverage,
    delayThreshold
)
```

#### `getPolicy()`

Retrieves the complete details of a policy.

#### `updateFlightDelay()`

Updates the actual flight delay received from the oracle.

```text
updateFlightDelay(
    policyId,
    actualDelay
)
```

The smart contract compares the actual delay against the policy threshold.

#### `processPayout()`

Processes the coverage payout when the policy is eligible.

```text
processPayout(policyId)
```

#### `policyCount()`

Returns the number of policies created.

---

# 💰 Premium and Payout Model

The customer pays a premium when purchasing an insurance policy.

For example, one of our Standard policies used:

```text
Premium   = 0.001 ETH
Coverage  = 0.005 ETH
Threshold = 60 minutes
```

The smart contract balance acts as the payout pool for eligible claims.

### Example Policy

```text
Flight: AI303
Plan: Standard
Premium: 0.001 ETH
Coverage: 0.005 ETH
Delay Threshold: 60 minutes
Actual Delay: 90 minutes
```

Since:

```text
90 >= 60
```

the policy becomes eligible.

After payout:

```text
eligible = true
paid = true
active = false
```

---

# 🏦 Policy Contract & Premium Pool

Conceptually, the system has two core responsibilities:

### 1. Insurance Policy Management

The smart contract:

- Stores policy information
- Stores the delay threshold
- Receives oracle delay information
- Checks eligibility
- Processes payouts
- Tracks policy status

### 2. Payout Fund Management

The smart contract balance:

- Receives policy premiums
- Holds testnet ETH
- Provides funds for eligible payouts
- Supports the premium-to-claim demonstration

For the hackathon implementation, these responsibilities are **consolidated into one `FlightInsurance` smart contract** instead of deploying separate policy and premium-pool contracts.

This keeps the architecture simpler while preserving the complete insurance workflow.

---

# 🧠 AI-Assisted Risk Assessment

FlightGuard includes an AI-assisted risk assessment feature.

The AI layer analyzes policy and delay information and provides a risk assessment that can help explain the likelihood of a claim.

Example:

```text
HIGH CLAIM RISK:
The recorded delay meets or exceeds the policy threshold.
```

The AI component is an **assessment layer**.

It does not directly transfer funds or override the smart contract.

The blockchain smart contract remains responsible for the actual policy eligibility and payout logic.

### Demo AI Mode

The project supports a demo/fallback AI mode when an external AI API key is not configured.

This allows the hackathon prototype to demonstrate the AI functionality without exposing API credentials in the frontend.

---

# 🗄️ Database

FlightGuard uses **PostgreSQL through Neon** for application-level data.

The database is used alongside the blockchain rather than replacing it.

### Database Responsibilities

The database can store application information such as:

- Customer records
- Flight information
- Policy application records
- Blockchain transactions
- AI decisions
- Customer feedback

### Blockchain vs Database

| Blockchain | Database |
|---|---|
| Policy state | Application data |
| Smart contract rules | Flight information |
| Blockchain transactions | AI decisions |
| Eligibility state | Customer feedback |
| Payout transactions | Supporting records |
| Public verification | Fast application queries |

The blockchain provides the trust and verification layer, while the database provides efficient application-level storage.

---

# 🏗️ System Architecture

```text
                         FLIGHTGUARD
                              │
                              ↓
                     React Web Application
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 MetaMask            Backend
                    │                   │
                    │            Flask + Web3.py
                    │                   │
                    │          ┌────────┴─────────┐
                    │          │                  │
                    │       PostgreSQL         Mock Oracle
                    │          │                  │
                    │          │          Flight Delay Data
                    │          │                  │
                    └──────────┴──────────┬───────┘
                                         ↓
                              Ethereum Sepolia
                                         │
                                         ↓
                              FlightInsurance
                                Smart Contract
                                         │
                               ┌─────────┴─────────┐
                               │                   │
                         Policy Logic          Payout Logic
                               │                   │
                               └─────────┬─────────┘
                                         ↓
                                  Customer Wallet
```

---

# 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- MetaMask

### Blockchain

- Ethereum Sepolia
- Solidity
- Smart Contracts
- Web3
- Etherscan

### Backend

- Python
- Flask
- Web3.py
- Flask-CORS
- Gunicorn

### Database

- PostgreSQL
- Neon

### AI

- AI-assisted risk assessment
- Configurable external AI API
- Demo fallback mode

### Deployment

- Render
- GitHub
- Neon PostgreSQL

---

# 🌐 Deployment Architecture

The project is deployed as separate frontend and backend services.

```text
                    GitHub Repository
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
        Render Frontend            Render Backend
              │                         │
              ↓                         ↓
      React/Vite Website          Flask API
                                        │
                              ┌─────────┴─────────┐
                              ↓                   ↓
                         Neon PostgreSQL    Ethereum Sepolia
```

### Frontend

https://flightguard-1.onrender.com

### Backend

https://flightguard-pznf.onrender.com

---

# 🔄 Complete User Flow

### Step 1 — Connect Wallet

The customer connects MetaMask to the FlightGuard application.

### Step 2 — Enter Flight Details

The customer provides information such as:

- Flight number
- Airline
- Departure airport
- Arrival airport
- Travel date

### Step 3 — Select Insurance Plan

The customer selects a protection plan.

Example:

```text
Standard
Premium: 0.001 ETH
Coverage: 0.005 ETH
Delay Trigger: 60 minutes
```

### Step 4 — AI Assessment

The application can run an AI-assisted risk assessment.

### Step 5 — Purchase Policy

The customer confirms the transaction through MetaMask.

The policy is created on the Ethereum Sepolia blockchain.

### Step 6 — Flight Delay Update

The mock oracle/backend provides the actual delay.

Example:

```text
Actual delay = 90 minutes
```

### Step 7 — Smart Contract Evaluation

The smart contract checks:

```text
Actual Delay >= Delay Threshold
```

Example:

```text
90 >= 60
```

Result:

```text
Eligible = TRUE
```

### Step 8 — Payout

The eligible policy's coverage amount can be processed through the smart contract.

### Step 9 — Verification

The blockchain transaction can be verified through the Sepolia block explorer.

---

# 🧪 Demonstrated Blockchain Example

One demonstrated policy used the following values:

```text
Policy ID: 4
Flight: AI303
Plan: Standard
Premium: 0.001 ETH
Coverage: 0.005 ETH
Delay Threshold: 60 minutes
Actual Delay: 90 minutes
Eligible: Yes
Paid: Yes
Active: No
```

This demonstrates the complete policy lifecycle:

```text
Purchase
   ↓
Policy Created
   ↓
Oracle Delay Update
   ↓
Eligibility Check
   ↓
Payout
   ↓
Policy Settled
```

---

# 🔐 Security

Sensitive information is kept outside the public repository.

The project uses environment variables for:

- Private blockchain key
- Database connection string
- AI API key
- RPC configuration

Sensitive `.env` files are excluded using `.gitignore`.

### Never commit:

```text
.env
Private keys
Seed phrases
Wallet passwords
Database passwords
API keys
```

> The deployed project uses a dedicated testnet wallet and Ethereum Sepolia testnet funds.

---

# 🧑‍💻 Local Development

## Prerequisites

Install:

- Git
- Node.js
- Python 3.10+
- MetaMask
- A Sepolia testnet wallet

Clone the repository:

```bash
git clone https://github.com/sunny347hub/flightguard.git
cd flightguard
```

---

## Frontend Setup

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

### Windows PowerShell

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a reference.

The backend requires configuration for:

```text
RPC_URL
PRIVATE_KEY
CONTRACT_ADDRESS
EXPLORER_URL
DATABASE_URL
FRONTEND_ORIGIN
API_KEY
AI_BASE_URL
AI_MODEL
```

Start the backend:

```bash
python app.py
```

The backend runs locally on:

```text
http://127.0.0.1:5000
```

---

# 📡 Backend API

Important API endpoints include:

### Health

```text
GET /health
```

### Flight Information

```text
GET /api/flights/<flight_number>
POST /api/flights
```

### Oracle

```text
POST /api/oracle/update-delay
```

### Policies

```text
GET /api/policies
GET /api/policies/<policy_id>
```

### Payout

```text
POST /api/claims/<policy_id>/payout
```

### AI Risk Assessment

```text
POST /api/ai/risk
```

### Feedback

```text
POST /api/feedback
GET /api/feedback
```

### Transaction

```text
GET /api/transactions/<tx_hash>
```

---

# 🔮 Future Improvements

The current hackathon implementation can be extended with:

- Real-time airline flight APIs
- Production-grade decentralized oracles
- Multiple independent oracle providers
- AI-based dynamic premium pricing
- Tiered payout models
- More insurance plans
- Mobile application
- Flight status notifications
- Policy history and analytics
- Production-grade security audits
- Multi-chain deployment

---

# ⚠️ Current Limitations

The hackathon prototype has several limitations:

- Flight-delay data currently uses a mock oracle.
- Ethereum Sepolia is a testnet and not suitable for real-money insurance.
- Blockchain transactions require network fees.
- Flight data accuracy depends on the external data source.
- The current implementation is a prototype and has not undergone a production security audit.
- Production deployment would require regulatory, legal, financial, and security considerations.

---

# 🎥 Demo Scenario

### Delayed Flight

```text
Customer purchases Standard policy
            ↓
Premium = 0.001 ETH
            ↓
Coverage = 0.005 ETH
            ↓
Threshold = 60 minutes
            ↓
Oracle reports 90-minute delay
            ↓
90 >= 60
            ↓
Policy becomes eligible
            ↓
Payout processed
```

### On-Time / Below Threshold Flight

```text
Customer purchases policy
            ↓
Threshold = 60 minutes
            ↓
Actual delay = 30 minutes
            ↓
30 < 60
            ↓
Policy is not eligible
            ↓
No delay-based payout
```

---

# 🌟 Why FlightGuard?

FlightGuard demonstrates how multiple technologies can work together to create programmable insurance:

**Blockchain**  
→ Transparent and verifiable policy logic

**Smart Contracts**  
→ Programmable insurance conditions and payout processing

**Oracle**  
→ Connects real-world flight information to blockchain

**AI**  
→ Provides additional risk assessment

**Database**  
→ Stores application-level information

**Web Application**  
→ Provides a simple interface for customers

Together, these components create a transparent and condition-based flight-delay insurance workflow.

---

# 🏁 Conclusion

FlightGuard demonstrates a blockchain-based approach to flight-delay insurance where predefined conditions can determine claim eligibility.

Instead of relying entirely on manual claims processing, the platform combines:

```text
Customer
   ↓
Web Application
   ↓
MetaMask
   ↓
Smart Contract
   ↓
Oracle Flight Data
   ↓
Eligibility Check
   ↓
Payout
```

The project demonstrates how **blockchain, smart contracts, oracle data, AI, databases, and modern web technologies** can be combined to build a programmable insurance platform.

---

## 📚 Project Links

- 🌐 **Live Application:** https://flightguard-1.onrender.com
- 💻 **GitHub:** https://github.com/sunny347hub/flightguard
- ⛓️ **Smart Contract:** https://sepolia.etherscan.io/address/0x5F5FCd92381888357cfD85Ed7Ad4FAE06Dc6c7e3
- 🔧 **Backend:** https://flightguard-pznf.onrender.com

---


### ⭐ Built for INNOBLOCK 2.0

**FlightGuard — Fly with confidence. Get paid when delays happen.**

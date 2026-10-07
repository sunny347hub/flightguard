// ============================================================
// FlightSure Frontend
// UI / wallet / API integration layer
// Smart-contract purchase logic will be connected later.
// ============================================================

const NETWORK = NETWORKS[ACTIVE_NETWORK] || NETWORKS.sepolia;
const CHAIN_ID_HEX = "0x" + NETWORK.chainId.toString(16);

let signer = null;
let selectedPlan = null;

// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function txUrl(hash) {
  return `${NETWORK.explorer}/tx/${hash}`;
}

function setStatus(el, state, message, txHash) {
  if (!el) return;

  el.className = `status ${state}`;
  el.textContent = message;

  if (txHash) {
    const link = document.createElement("a");
    link.href = txUrl(txHash);
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View transaction ↗";
    el.append(" ", link);
  }
}

function friendlyError(err) {
  if (err?.code === "ACTION_REJECTED") {
    return "You rejected the request in your wallet.";
  }

  if (err?.code === "INSUFFICIENT_FUNDS") {
    return `Your wallet does not have enough test ${NETWORK.currency}.`;
  }

  if (err?.code === "NETWORK_ERROR") {
    return "Network problem. Check your connection and try again.";
  }

  return err?.shortMessage || err?.message || String(err);
}


// ------------------------------------------------------------
// Backend API helper
// ------------------------------------------------------------

async function api(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
  } catch {
    throw new Error(
      `Can't reach the backend at ${BACKEND_URL}.`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Backend error ${response.status}`
    );
  }

  return data;
}


// ------------------------------------------------------------
// Network
// ------------------------------------------------------------

async function switchNetwork() {
  if (!window.ethereum) {
    throw new Error("MetaMask was not found.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }]
    });
  } catch (err) {
    const code = err.code ?? err.data?.originalError?.code;

    // Network doesn't exist in MetaMask
    if (code !== 4902) {
      throw err;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: CHAIN_ID_HEX,
        chainName: NETWORK.name,
        rpcUrls: [NETWORK.rpcUrl],
        blockExplorerUrls: [NETWORK.explorer],
        nativeCurrency: {
          name: NETWORK.currency,
          symbol: NETWORK.currency,
          decimals: 18
        }
      }]
    });
  }
}


// ------------------------------------------------------------
// Wallet
// ------------------------------------------------------------

async function connectWallet() {
  const status = $("connect-status");

  try {
    if (!window.ethereum) {
      setStatus(
        status,
        "failed",
        "MetaMask is not installed."
      );
      return;
    }

    setStatus(
      status,
      "pending",
      "Connecting MetaMask..."
    );

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Ask MetaMask to connect
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Check network
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== NETWORK.chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0xaa36a7"
            }
          ]
        });
      } catch (switchError) {
        console.error(switchError);

        setStatus(
          status,
          "failed",
          "Please switch MetaMask to Ethereum Sepolia."
        );

        return;
      }
    }

    // Get balance
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);

    $("wallet-address").textContent = address;

    $("wallet-balance").textContent =
      `${Number(formattedBalance).toFixed(4)} ${NETWORK.currency}`;

    $("connect-btn").textContent =
      "Wallet Connected";

    const secondaryButton =
      $("wallet-connect-secondary");

    if (secondaryButton) {
      secondaryButton.textContent =
        "Wallet Connected";
    }

    setStatus(
      status,
      "confirmed",
      "MetaMask connected successfully."
    );

  } catch (error) {
    console.error("Wallet connection error:", error);

    setStatus(
      status,
      "failed",
      error.shortMessage ||
      "Unable to connect MetaMask."
    );
  }
}
// ------------------------------------------------------------
// Insurance plans
// ------------------------------------------------------------

function selectPlan(button) {
  selectedPlan = {
    name: button.dataset.plan,
    premium: Number(button.dataset.premium),
    payout: Number(button.dataset.payout),
    delay: Number(button.dataset.delay)
  };

  $("selected-plan").textContent =
    selectedPlan.name;

  $("selected-premium").textContent =
    `₹${selectedPlan.premium}`;

  $("selected-delay").textContent =
    `${selectedPlan.delay} minutes`;

  $("selected-payout").textContent =
    `₹${selectedPlan.payout}`;

  const buyStatus = $("purchase-status");

  setStatus(
    buyStatus,
    "confirmed",
    `${selectedPlan.name} plan selected.`
  );

  // Scroll user to purchase section
  document
    .getElementById("buy")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}


// ------------------------------------------------------------
// Flight details
// ------------------------------------------------------------

function getFlightDetails() {
  return {
    flightNumber:
      $("flight-number")?.value.trim(),

    date:
      $("flight-date")?.value,

    departure:
      $("departure")?.value.trim(),

    destination:
      $("destination")?.value.trim()
  };
}


function checkFlightDetails() {
  const details = getFlightDetails();

  const status = $("flight-input-status");

  if (!details.flightNumber) {
    setStatus(
      status,
      "failed",
      "Enter your flight number."
    );
    return;
  }

  if (!details.date) {
    setStatus(
      status,
      "failed",
      "Select your travel date."
    );
    return;
  }

  if (!details.departure || !details.destination) {
    setStatus(
      status,
      "failed",
      "Enter your departure and destination."
    );
    return;
  }

  // Temporary frontend demonstration.
  // Later this will call your mock Oracle/backend.

  $("status-flight-number").textContent =
    details.flightNumber;

  $("status-departure").textContent =
    details.date;

  $("status-delay").textContent =
    "Awaiting Oracle data";

  $("status-trigger").textContent =
    selectedPlan
      ? `${selectedPlan.delay} minutes`
      : "Select a plan";

  $("live-flight-status").textContent =
    "Flight monitoring ready";

  setStatus(
    status,
    "confirmed",
    `Flight ${details.flightNumber} has been added for monitoring.`
  );
}


// ------------------------------------------------------------
// Buy insurance
// ------------------------------------------------------------

async function buyInsurance() {
  const status = $("purchase-status");

  try {
    // -------------------------------
    // CHECK PLAN
    // -------------------------------
    if (!selectedPlan) {
      setStatus(
        status,
        "failed",
        "Please select an insurance plan first."
      );
      return;
    }

    // -------------------------------
    // READ FLIGHT INFORMATION
    // -------------------------------
    const flightNumber = $("flight-number").value.trim();
    const flightDate = $("flight-date").value;
    const departure = $("departure").value.trim();
    const destination = $("destination").value.trim();

    if (!flightNumber || !flightDate || !departure || !destination) {
      setStatus(
        status,
        "failed",
        "Please enter and check your flight details first."
      );
      return;
    }

    // -------------------------------
    // CHECK METAMASK
    // -------------------------------
    if (!window.ethereum) {
      setStatus(
        status,
        "failed",
        "MetaMask is not installed."
      );
      return;
    }

    setStatus(
      status,
      "pending",
      "Preparing your insurance purchase..."
    );

    $("transaction-title").textContent =
      "Transaction Pending";

    $("transaction-description").textContent =
      "Waiting for MetaMask confirmation...";

    $("transaction-status").textContent =
      "Pending";

    // -------------------------------
    // CONNECT TO METAMASK
    // -------------------------------
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const address = await signer.getAddress();

    // -------------------------------
    // CHECK SEPOLIA
    // -------------------------------
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== NETWORK.chainId) {
      setStatus(
        status,
        "failed",
        "Please switch MetaMask to Ethereum Sepolia."
      );

      $("transaction-status").textContent =
        "Failed";

      return;
    }

    // -------------------------------
    // CREATE CONTRACT INSTANCE
    // -------------------------------
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      FLIGHT_INSURANCE_ABI,
      signer
    );

    // -------------------------------
    // ON-CHAIN PLAN VALUES
    // -------------------------------
    const premiumWei = 1000000000000000n;
    const coverageWei = 5000000000000000n;

    let delayThreshold;

    if (selectedPlan.name === "Basic") {
      delayThreshold = 120;
    } else if (selectedPlan.name === "Standard") {
      delayThreshold = 60;
    } else if (selectedPlan.name === "Premium") {
      delayThreshold = 30;
    } else {
      setStatus(
        status,
        "failed",
        "Invalid insurance plan selected."
      );
      return;
    }

    // -------------------------------
    // SEND REAL BLOCKCHAIN TRANSACTION
    // -------------------------------
    setStatus(
      status,
      "pending",
      "Please confirm the insurance purchase in MetaMask..."
    );

    $("transaction-description").textContent =
      "Please confirm the transaction in MetaMask.";

    const tx = await contract.buyPolicy(
      flightNumber,
      selectedPlan.name,
      premiumWei,
      coverageWei,
      delayThreshold,
      {
        value: premiumWei
      }
    );

    $("transaction-description").textContent =
      "Transaction submitted. Waiting for Sepolia confirmation...";

    $("transaction-status").textContent =
      "Confirming";

    // -------------------------------
    // WAIT FOR CONFIRMATION
    // -------------------------------
    const receipt = await tx.wait();

    // -------------------------------
    // FIND POLICY ID
    // -------------------------------
    let policyId = null;

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);

        if (parsed && parsed.name === "PolicyCreated") {
          policyId = parsed.args.policyId.toString();
          break;
        }
      } catch (error) {
        // Ignore logs that don't belong to our contract
      }
    }

    // Fallback: read latest policy count
    if (policyId === null) {
      const count = await contract.policyCount();

      if (count > 0n) {
        policyId = (count - 1n).toString();
      }
    }

    if (policyId === null) {
      throw new Error(
        "Transaction succeeded, but the policy ID could not be determined."
      );
    }

    // -------------------------------
    // READ POLICY FROM BLOCKCHAIN
    // -------------------------------
    const policy = await contract.getPolicy(policyId);

    // -------------------------------
    // TRANSACTION CONFIRMED
    // -------------------------------
    setStatus(
      status,
      "confirmed",
      "Insurance purchase confirmed on Sepolia."
    );

    $("transaction-title").textContent =
      "Transaction Confirmed";

    $("transaction-description").textContent =
      "Your insurance policy has been created on the Sepolia blockchain.";

    $("transaction-status").textContent =
      "Confirmed";

    // -------------------------------
    // MY POLICY
    // -------------------------------
    $("policy-id").textContent =
      policyId;

    $("policy-flight").textContent =
      policy.flightNumber;

    $("policy-plan").textContent =
      policy.plan;

    $("policy-status").textContent =
      policy.active ? "Active" : "Inactive";

    // -------------------------------
    // FLIGHT STATUS
    // -------------------------------
    $("status-flight-number").textContent =
      policy.flightNumber;

    $("status-departure").textContent =
      departure;

    $("status-delay").textContent =
      `${policy.actualDelay.toString()} min`;

    $("status-trigger").textContent =
      `${policy.delayThreshold.toString()} min delay trigger`;

    // -------------------------------
    // AUTOMATIC PAYOUT
    // -------------------------------
    $("payout-state").textContent =
      policy.paid
        ? "Paid"
        : policy.eligible
        ? "Eligible"
        : "Monitoring";

    $("payout-amount").textContent =
      selectedPlan.payout;

    if (policy.paid) {
      $("payout-message").textContent =
        "Your payout has been processed.";
    } else if (policy.eligible) {
      $("payout-message").textContent =
        "Your policy is eligible for a payout.";
    } else {
      $("payout-message").textContent =
        "Automatic payout will be evaluated when verified flight delay data is available.";
    }

    // -------------------------------
    // TRANSACTION RECEIPT
    // -------------------------------
    $("receipt-policy-id").textContent =
      policyId;

    $("receipt-flight").textContent =
      policy.flightNumber;

    $("receipt-plan").textContent =
      policy.plan;

    $("receipt-premium").textContent =
      selectedPlan.premium;

    $("receipt-tx").textContent =
      tx.hash;

    console.log("Insurance purchase successful:", {
      wallet: address,
      policyId,
      transactionHash: tx.hash,
      flightNumber,
      plan: policy.plan,
      premiumWei: premiumWei.toString(),
      coverageWei: coverageWei.toString(),
      delayThreshold,
    });

  } catch (error) {
    console.error("Insurance purchase error:", error);

    $("transaction-title").textContent =
      "Transaction Failed";

    $("transaction-status").textContent =
      "Failed";

    $("transaction-description").textContent =
      "The insurance purchase could not be completed.";

    setStatus(
      status,
      "failed",
      error.reason ||
      error.shortMessage ||
      "Transaction failed. Check MetaMask and the browser console."
    );
  }
}
// ------------------------------------------------------------
// AI Assistant
// ------------------------------------------------------------

async function askAI() {
  const prompt = $("ai-prompt")?.value.trim();

  const status = $("ai-status");
  const answer = $("ai-answer");

  if (!prompt) {
    setStatus(
      status,
      "failed",
      "Write a question for the AI first."
    );
    return;
  }

  setStatus(
    status,
    "pending",
    "Asking FlightSure AI..."
  );

  try {

    /*
     * This connects to the backend endpoint that you will
     * implement later.
     */

    const data = await api(
      "/ai/decide",
      {
        method: "POST",
        body: JSON.stringify({
          prompt
        })
      }
    );

    answer.textContent =
      data.decision ||
      data.answer ||
      "The AI returned an empty response.";

    setStatus(
      status,
      "confirmed",
      data.demo
        ? "Demo AI response."
        : "AI response received."
    );

  } catch (err) {

    setStatus(
      status,
      "failed",
      err.message
    );

    answer.textContent =
      "The AI backend is not connected yet.";
  }
}


// ------------------------------------------------------------
// Feedback
// ------------------------------------------------------------

function submitFeedback() {
  const message =
    $("feedback-message")?.value.trim();

  const status =
    $("feedback-status");

  if (!message) {
    setStatus(
      status,
      "failed",
      "Please enter your feedback."
    );
    return;
  }

  /*
   * Temporary frontend confirmation.
   *
   * Later this can call your backend/database:
   *
   * POST /feedback
   */

  setStatus(
    status,
    "confirmed",
    "Thank you for your feedback!"
  );

  $("feedback-message").value = "";
}


// ------------------------------------------------------------
// Initialize UI
// ------------------------------------------------------------

function init() {

  // Network badge
  if ($("network-badge")) {
    $("network-badge").textContent =
      NETWORK.name;
  }

  // Warn if contract hasn't been configured
  const problems = [];

  if (!NETWORKS[ACTIVE_NETWORK]) {
    problems.push(
      `Unknown network "${ACTIVE_NETWORK}".`
    );
  }

  if (/^0x0{40}$/.test(CONTRACT_ADDRESS)) {
    problems.push(
      "FlightInsurance contract address has not been connected yet."
    );
  }

  if (problems.length && $("setup-warning")) {
    $("setup-warning").textContent =
      problems.join(" ");

    $("setup-warning")
      .classList
      .remove("hidden");
  }


  // Wallet buttons
  $("connect-btn")?.addEventListener(
    "click",
    connectWallet
  );

  $("wallet-connect-secondary")?.addEventListener(
    "click",
    connectWallet
  );


  // Plan buttons
  document
    .querySelectorAll(".plan-select")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => selectPlan(button)
      );

    });


  // Flight
  $("check-flight-btn")?.addEventListener(
    "click",
    checkFlightDetails
  );


  // Purchase
  $("buy-insurance-btn")?.addEventListener(
    "click",
    buyInsurance
  );


  // AI
  $("ai-ask-btn")?.addEventListener(
    "click",
    askAI
  );


  // Feedback
  $("feedback-btn")?.addEventListener(
    "click",
    submitFeedback
  );


  // Wallet account/network changes
  window.ethereum?.on?.(
    "chainChanged",
    () => location.reload()
  );

  window.ethereum?.on?.(
    "accountsChanged",
    () => location.reload()
  );
}


// Start application
init();
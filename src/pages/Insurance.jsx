import { useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CONTRACT_ADDRESS =
  "0x5f5fcd92381888357cfd85ed7ad4fae06dc6c7e3";

const BACKEND_URL = "http://localhost:5000";

const SEPOLIA_CHAIN_ID = 11155111;

const CONTRACT_ABI = [
  "function buyPolicy(string _flightNumber, string _plan, uint256 _premium, uint256 _coverage, uint256 _delayThreshold) payable returns (uint256)",
  "function policyCount() view returns (uint256)",
  "function getPolicy(uint256 _policyId) view returns (uint256 policyId, address customer, string flightNumber, string plan, uint256 premium, uint256 coverage, uint256 delayThreshold, uint256 actualDelay, bool active, bool eligible, bool paid)",
  "event PolicyCreated(uint256 indexed policyId, address indexed customer, string flightNumber, string plan, uint256 premium, uint256 coverage, uint256 delayThreshold)",
];

const PLANS = {
  Basic: {
    premiumEth: "0.0005",
    coverageEth: "0.0025",
    premiumDisplay: "₹500",
    coverageDisplay: "₹2,500",
    threshold: 60,
    description: "Essential protection for short delays.",
  },

  Standard: {
    premiumEth: "0.001",
    coverageEth: "0.005",
    premiumDisplay: "₹1,000",
    coverageDisplay: "₹5,000",
    threshold: 60,
    description: "Balanced protection for most journeys.",
  },

  Premium: {
    premiumEth: "0.002",
    coverageEth: "0.010",
    premiumDisplay: "₹2,000",
    coverageDisplay: "₹10,000",
    threshold: 60,
    description: "Higher coverage for maximum protection.",
  },
};

function Insurance() {
  const [account, setAccount] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("Air India");
  const [departure, setDeparture] = useState("HYD");
  const [arrival, setArrival] = useState("DEL");
  const [travelDate, setTravelDate] = useState("");
  const [plan, setPlan] = useState("Standard");

  const [riskResult, setRiskResult] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [policyId, setPolicyId] = useState("");

  const selectedPlan = PLANS[plan];

  async function connectWallet() {
    try {
      setError("");

      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask and try again."
        );
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error(
          "Please switch MetaMask to the Ethereum Sepolia test network."
        );
      }

      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        throw new Error("No MetaMask account was connected.");
      }

      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to connect wallet.");
    }
  }

  async function checkRisk() {
    try {
      setError("");
      setRiskResult(null);

      if (!flightNumber.trim()) {
        setError("Please enter your flight number first.");
        return;
      }

      setRiskLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/ai/risk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightNumber: flightNumber.trim().toUpperCase(),
          delayMinutes: 60,
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI risk assessment failed.");
      }

      setRiskResult(data);
    } catch (err) {
      console.error(err);

      // The backend already has a demo fallback.
      setRiskResult({
        decision: "LOW TO MODERATE CLAIM RISK",
        demo: true,
        message:
          "AI assessment is available in demo mode. Your policy will be evaluated using the recorded flight delay.",
      });
    } finally {
      setRiskLoading(false);
    }
  }

  async function buyInsurance() {
    try {
      setError("");
      setTxHash("");
      setPolicyId("");
      setStatus("");

      if (!flightNumber.trim()) {
        setError("Please enter your flight number.");
        return;
      }

      if (!travelDate) {
        setError("Please select your travel date.");
        return;
      }

      if (!window.ethereum) {
        setError("Please install MetaMask.");
        return;
      }

      setStatus("CONNECTING");

      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error(
          "Wrong network. Please switch MetaMask to Ethereum Sepolia."
        );
      }

      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your MetaMask wallet.");
      }

      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();

      setAccount(connectedAddress);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const premiumWei = ethers.parseEther(selectedPlan.premiumEth);
      const coverageWei = ethers.parseEther(selectedPlan.coverageEth);

      setStatus("WAITING_FOR_WALLET");

      const transaction = await contract.buyPolicy(
        flightNumber.trim().toUpperCase(),
        plan,
        premiumWei,
        coverageWei,
        selectedPlan.threshold,
        {
          value: premiumWei,
        }
      );

      setTxHash(transaction.hash);
      setStatus("PENDING");

      const receipt = await transaction.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("The blockchain transaction failed.");
      }

      let discoveredPolicyId = "";

      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsed && parsed.name === "PolicyCreated") {
            discoveredPolicyId = parsed.args.policyId.toString();
            break;
          }
        } catch {
          // Ignore logs that are not PolicyCreated.
        }
      }

      // Fallback: use the current policy counter if the event
      // could not be parsed.
      if (!discoveredPolicyId) {
        const count = await contract.policyCount();
        discoveredPolicyId = count.toString();
      }

      setPolicyId(discoveredPolicyId);
      setStatus("CONFIRMED");

      // Save flight information in the backend database.
      try {
        await fetch(`${BACKEND_URL}/api/flights`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flightNumber: flightNumber.trim().toUpperCase(),
            airline,
            departure,
            arrival,
            travelDate,
          }),
        });
      } catch (dbError) {
        console.warn("Flight database sync failed:", dbError);
      }
    } catch (err) {
      console.error(err);

      setStatus("FAILED");

      if (err?.code === "ACTION_REJECTED") {
        setError("Transaction rejected in MetaMask.");
      } else if (err?.reason) {
        setError(err.reason);
      } else {
        setError(err?.message || "Unable to purchase insurance.");
      }
    }
  }

  const explorerUrl = txHash
    ? `https://sepolia.etherscan.io/tx/${txHash}`
    : "";

  return (
    <>
      <Navbar />

      <main className="min-h-[75vh] bg-[#fffaf2] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9b15c] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a611c]">
              <span className="h-2 w-2 rounded-full bg-[#c99b3b]" />
              Ethereum Sepolia Testnet
            </div>

            <h1 className="font-serif text-5xl font-bold leading-tight text-[#57111d] md:text-6xl">
              Protect your journey.
              <br />
              <span className="text-[#b07a22]">Get paid when delays happen.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6f625b]">
              Purchase blockchain-powered flight delay protection with
              transparent coverage and automated claim eligibility.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

            {/* Main form */}
            <section className="rounded-3xl border border-[#ead9bb] bg-white p-6 shadow-[0_20px_60px_rgba(87,17,29,0.08)] md:p-8">

              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b07a22]">
                    Step 1
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-bold text-[#57111d]">
                    Flight details
                  </h2>
                </div>

                {!account ? (
                  <button
                    onClick={connectWallet}
                    className="rounded-full bg-[#8d172c] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#721224]"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <div className="rounded-full border border-[#d9b15c] bg-[#fffaf2] px-4 py-2 text-xs font-semibold text-[#57111d]">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#57111d]">
                    Flight number
                  </label>
                  <input
                    value={flightNumber}
                    onChange={(e) =>
                      setFlightNumber(e.target.value.toUpperCase())
                    }
                    placeholder="AI303"
                    className="w-full rounded-xl border border-[#decfb7] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#a97825] focus:ring-2 focus:ring-[#d9b15c]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#57111d]">
                    Airline
                  </label>
                  <input
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="Air India"
                    className="w-full rounded-xl border border-[#decfb7] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#a97825] focus:ring-2 focus:ring-[#d9b15c]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#57111d]">
                    Departure
                  </label>
                  <input
                    value={departure}
                    onChange={(e) =>
                      setDeparture(e.target.value.toUpperCase())
                    }
                    placeholder="HYD"
                    className="w-full rounded-xl border border-[#decfb7] bg-[#fffdf9] px-4 py-3 uppercase outline-none focus:border-[#a97825] focus:ring-2 focus:ring-[#d9b15c]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#57111d]">
                    Arrival
                  </label>
                  <input
                    value={arrival}
                    onChange={(e) =>
                      setArrival(e.target.value.toUpperCase())
                    }
                    placeholder="DEL"
                    className="w-full rounded-xl border border-[#decfb7] bg-[#fffdf9] px-4 py-3 uppercase outline-none focus:border-[#a97825] focus:ring-2 focus:ring-[#d9b15c]/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#57111d]">
                    Travel date
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full rounded-xl border border-[#decfb7] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#a97825] focus:ring-2 focus:ring-[#d9b15c]/30"
                  />
                </div>
              </div>

              {/* Plans */}
              <div className="mt-10">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b07a22]">
                    Step 2
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-bold text-[#57111d]">
                    Choose your protection
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(PLANS).map(([name, details]) => {
                    const selected = plan === name;

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setPlan(name)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-[#8d172c] bg-[#fff7ea] shadow-md ring-2 ring-[#8d172c]/10"
                            : "border-[#ead9bb] bg-white hover:border-[#d2ad69]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-xl font-bold text-[#57111d]">
                            {name}
                          </h3>

                          {selected && (
                            <span className="rounded-full bg-[#8d172c] px-2 py-1 text-[10px] font-bold uppercase text-white">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-sm leading-5 text-[#766960]">
                          {details.description}
                        </p>

                        <div className="mt-5 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#806f65]">Premium</span>
                            <strong className="text-[#57111d]">
                              {details.premiumDisplay}
                            </strong>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[#806f65]">Coverage</span>
                            <strong className="text-[#57111d]">
                              {details.coverageDisplay}
                            </strong>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[#806f65]">Delay trigger</span>
                            <strong className="text-[#57111d]">
                              {details.threshold}+ min
                            </strong>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI */}
              <div className="mt-10 rounded-2xl border border-[#ead9bb] bg-[#fffaf2] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b07a22]">
                      AI-assisted assessment
                    </p>

                    <h3 className="mt-1 font-serif text-2xl font-bold text-[#57111d]">
                      Check claim risk
                    </h3>

                    <p className="mt-1 text-sm text-[#766960]">
                      Uses the backend AI service to assess delay-related claim risk.
                    </p>
                  </div>

                  <button
                    onClick={checkRisk}
                    disabled={riskLoading}
                    className="rounded-full border border-[#8d172c] px-5 py-3 text-sm font-semibold text-[#8d172c] transition hover:bg-[#8d172c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {riskLoading ? "Assessing..." : "Run AI Check"}
                  </button>
                </div>

                {riskResult && (
                  <div className="mt-5 rounded-xl border border-[#d9b15c] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#a97825]">
                      AI decision
                    </p>

                    <p className="mt-2 font-semibold text-[#57111d]">
                      {riskResult.decision ||
                        riskResult.message ||
                        "Assessment completed"}
                    </p>

                    {riskResult.demo && (
                      <p className="mt-2 text-xs text-[#806f65]">
                        Demo AI mode is active.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase */}
              <div className="mt-10 border-t border-[#ead9bb] pt-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b07a22]">
                      Step 3
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-bold text-[#57111d]">
                      Buy your policy
                    </h2>

                    <p className="mt-2 text-sm text-[#766960]">
                      Blockchain payment:{" "}
                      <strong>{selectedPlan.premiumEth} SepoliaETH</strong>
                    </p>
                  </div>

                  <button
                    onClick={buyInsurance}
                    className="rounded-full bg-[#8d172c] px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#721224] hover:shadow-xl"
                  >
                    Buy {plan} Insurance →
                  </button>
                </div>
              </div>

              {/* Status */}
              {(status || error) && (
                <div className="mt-6">
                  {status && (
                    <div className="rounded-2xl border border-[#d9b15c] bg-[#fffaf2] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a97825]">
                        Blockchain status
                      </p>

                      <p className="mt-2 font-semibold text-[#57111d]">
                        {status === "CONNECTING" &&
                          "Connecting to MetaMask..."}

                        {status === "WAITING_FOR_WALLET" &&
                          "Waiting for you to confirm the transaction in MetaMask..."}

                        {status === "PENDING" &&
                          "Transaction submitted. Waiting for Sepolia confirmation..."}

                        {status === "CONFIRMED" &&
                          "✓ Policy confirmed on the blockchain."}

                        {status === "FAILED" &&
                          "Transaction failed."}
                      </p>

                      {policyId && (
                        <p className="mt-3 text-sm text-[#6f625b]">
                          Policy ID:{" "}
                          <strong className="text-[#57111d]">
                            #{policyId}
                          </strong>
                        </p>
                      )}

                      {txHash && (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-block text-sm font-semibold text-[#8d172c] underline"
                        >
                          View transaction on Etherscan →
                        </a>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Summary */}
            <aside className="h-fit rounded-3xl bg-[#711527] p-7 text-white shadow-[0_20px_60px_rgba(87,17,29,0.2)] lg:sticky lg:top-8">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e3bd68]">
                Protected journey
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold">
                {flightNumber || "Your flight"}
              </h2>

              <div className="mt-7 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {departure || "---"}
                  </p>
                  <p className="text-sm text-[#e8cfd1]">Departure</p>
                </div>

                <div className="h-px flex-1 bg-[#c68d42] mx-4" />

                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {arrival || "---"}
                  </p>
                  <p className="text-sm text-[#e8cfd1]">Arrival</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-[#e8cfd1]">Plan</p>
                  <p className="mt-1 font-bold">{plan}</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-[#e8cfd1]">Trigger</p>
                  <p className="mt-1 font-bold">
                    {selectedPlan.threshold} min
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-[#e8cfd1]">Premium</p>
                  <p className="mt-1 font-bold">
                    {selectedPlan.premiumEth} ETH
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-[#e8cfd1]">Coverage</p>
                  <p className="mt-1 font-bold">
                    {selectedPlan.coverageEth} ETH
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#d09d45]/40 bg-[#5d1020] p-5">
                <p className="text-sm font-semibold text-[#e3bd68]">
                  Blockchain verified
                </p>

                <p className="mt-2 text-xs leading-5 text-[#e8cfd1]">
                  Your policy is recorded on Ethereum Sepolia and can be
                  independently verified through the block explorer.
                </p>
              </div>

              <a
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block text-center text-sm font-semibold text-[#e3bd68] underline"
              >
                View smart contract on Etherscan →
              </a>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Insurance;
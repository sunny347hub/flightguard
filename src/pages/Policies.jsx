import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPolicies } from "../services/api";

function formatEth(wei) {
  try {
    return `${Number(wei) / 1e18} ETH`;
  } catch {
    return "—";
  }
}

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPolicies() {
      try {
        setLoading(true);
        setError("");

        const data = await getPolicies();

        const accounts = window.ethereum
          ? await window.ethereum.request({
              method: "eth_accounts",
            })
          : [];

        const wallet = accounts[0]?.toLowerCase();

        const userPolicies = wallet
          ? (data.policies || []).filter(
              (policy) =>
                policy.customer?.toLowerCase() === wallet
            )
          : data.policies || [];

        setPolicies(userPolicies);
      } catch (err) {
        console.error("Failed to load policies:", err);
        setError(err.message || "Unable to load policies.");
      } finally {
        setLoading(false);
      }
    }

    loadPolicies();
  }, []);

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a66b16]">
            Blockchain verified
          </p>

          <h1 className="font-serif text-5xl font-bold text-[#57111d]">
            My Policies
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            View your active and completed flight-delay insurance policies
            recorded through FlightGuard.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[#ead8b8] bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-slate-600">
              Loading your policies...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h2 className="font-serif text-2xl font-bold text-[#57111d]">
              Unable to load policies
            </h2>

            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && policies.length === 0 && (
          <div className="rounded-2xl border border-[#ead8b8] bg-white p-12 text-center shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-[#57111d]">
              No policies yet
            </h2>

            <p className="mt-3 text-slate-600">
              Purchase a flight-delay policy and it will appear here.
            </p>
          </div>
        )}

        {!loading && !error && policies.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {policies.map((policy) => (
              <div
                key={policy.policyId}
                className="overflow-hidden rounded-3xl border border-[#ead8b8] bg-white shadow-sm"
              >
                <div className="bg-[#79152a] p-7 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7b84d]">
                        Policy #{policy.policyId}
                      </p>

                      <h2 className="mt-2 font-serif text-3xl font-bold">
                        {policy.flightNumber}
                      </h2>

                      <p className="mt-1 text-white/80">
                        {policy.plan} protection
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        policy.active
                          ? "bg-green-100 text-green-800"
                          : policy.paid
                            ? "bg-[#f4d47c] text-[#57111d]"
                            : "bg-white/15 text-white"
                      }`}
                    >
                      {policy.active
                        ? "Active"
                        : policy.paid
                          ? "Paid"
                          : "Completed"}
                    </span>
                  </div>
                </div>

                <div className="p-7">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#fbf5ea] p-5">
                      <p className="text-sm text-slate-500">Premium</p>
                      <p className="mt-1 text-xl font-bold text-[#57111d]">
                        {formatEth(policy.premiumWei)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf5ea] p-5">
                      <p className="text-sm text-slate-500">Coverage</p>
                      <p className="mt-1 text-xl font-bold text-[#57111d]">
                        {formatEth(policy.coverageWei)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf5ea] p-5">
                      <p className="text-sm text-slate-500">
                        Delay trigger
                      </p>
                      <p className="mt-1 text-xl font-bold text-[#57111d]">
                        {policy.delayThreshold} min
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fbf5ea] p-5">
                      <p className="text-sm text-slate-500">
                        Actual delay
                      </p>
                      <p className="mt-1 text-xl font-bold text-[#57111d]">
                        {policy.actualDelay} min
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#ead8b8] pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">
                        Claim eligibility
                      </span>

                      <span
                        className={`font-semibold ${
                          policy.eligible
                            ? "text-green-700"
                            : "text-slate-500"
                        }`}
                      >
                        {policy.eligible
                          ? "Eligible"
                          : "Not eligible"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-slate-600">
                        Payout status
                      </span>

                      <span className="font-semibold text-[#57111d]">
                        {policy.paid ? "Paid" : "Not paid"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Policies;
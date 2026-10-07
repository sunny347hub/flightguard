import { useEffect, useState } from "react";
import { Wallet, LoaderCircle } from "lucide-react";
import {
  connectWallet,
  formatAddress,
} from "../services/blockchain";

function WalletButton() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts?.[0] || "");
    };

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        setAddress(accounts?.[0] || "");
      })
      .catch(() => {});

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  async function handleConnect() {
    setLoading(true);
    setError("");

    try {
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
    } catch (err) {
      setError(err.message || "Unable to connect wallet.");
    } finally {
      setLoading(false);
    }
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#d8c39d] bg-[#fffdf8] px-4 py-2 text-sm font-semibold text-[#57111d]">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {formatAddress(address)}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-[#7f1728] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#68121f] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Wallet size={17} />
        )}

        {loading ? "Connecting..." : "Connect Wallet"}
      </button>

      {error && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-red-200 bg-white p-3 text-xs leading-5 text-red-700 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default WalletButton;
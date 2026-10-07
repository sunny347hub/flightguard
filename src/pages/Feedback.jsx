import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

function Feedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setError("");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect wallet.");
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    setSubmitting(true);

    try {
      let wallet = walletAddress;

      if (!wallet && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        wallet = accounts[0] || "";
        setWalletAddress(wallet);
      }

      const response = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: wallet || null,
          rating,
          message: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setMessage("Thank you! Your feedback has been submitted successfully.");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError(
        err.message ||
          "Unable to submit feedback. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-16 lg:px-8">
        {/* Header */}
        <section className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a66b24]">
            FlightGuard Feedback
          </p>

          <h1 className="font-serif text-5xl font-bold text-[#57111d]">
            We value your experience
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Tell us about your FlightGuard experience. Your feedback helps us
            improve flight-delay protection for travelers.
          </p>
        </section>

        {/* Feedback Card */}
        <section className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-[#eadcc8] bg-white p-7 shadow-lg md:p-10">
            {/* Wallet */}
            <div className="mb-8 rounded-2xl bg-[#faf5ec] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#a66b24]">
                    Wallet
                  </p>

                  {walletAddress ? (
                    <p className="mt-1 break-all font-mono text-sm text-[#57111d]">
                      {walletAddress}
                    </p>
                  ) : (
                    <p className="mt-1 text-gray-600">
                      Connect your wallet to associate your feedback.
                    </p>
                  )}
                </div>

                {!walletAddress && (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="rounded-xl bg-[#57111d] px-5 py-3 font-semibold text-white transition hover:bg-[#741827]"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={submitFeedback}>
              {/* Rating */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-[#57111d]">
                  How would you rate FlightGuard?
                </label>

                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`Rate ${value} out of 5`}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition ${
                        value <= rating
                          ? "border-[#c9962e] bg-[#f5d98b] text-[#57111d]"
                          : "border-[#eadcc8] bg-[#fffaf2] text-gray-400 hover:border-[#c9962e]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {rating === 0
                    ? "Select a rating from 1 to 5."
                    : `${rating} out of 5 stars selected`}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-8">
                <label
                  htmlFor="feedback"
                  className="block text-lg font-semibold text-[#57111d]"
                >
                  Your feedback
                </label>

                <textarea
                  id="feedback"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Tell us what you liked or what we can improve..."
                  rows={6}
                  className="mt-4 w-full resize-none rounded-2xl border border-[#eadcc8] bg-[#fffdf9] p-4 text-gray-700 outline-none transition focus:border-[#a66b24] focus:ring-2 focus:ring-[#f5d98b]"
                />
              </div>

              {/* Status */}
              {message && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#57111d] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#741827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting Feedback..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </section>

        {/* Trust Section */}
        <section className="mx-auto mt-12 max-w-3xl rounded-2xl bg-[#57111d] px-7 py-9 text-center text-white">
          <h2 className="font-serif text-2xl font-bold">
            Your voice helps us improve
          </h2>

          <p className="mt-3 leading-7 text-[#f8e9d2]">
            FlightGuard is built to make flight-delay protection simpler,
            transparent and trustworthy for every traveler.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Feedback;
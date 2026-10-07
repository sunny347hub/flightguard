import {
  ArrowRight,
  Plane,
  ShieldCheck,
  Clock3,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#302923]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#eadfcf]">
          <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-[#e7b75b]/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#7f1728]/8 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ddc99e] bg-[#fffdf8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7f1728]">
                <span className="h-2 w-2 rounded-full bg-[#d9a94f]" />
                Powered by Ethereum Sepolia
              </div>

              <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#9a6b2f]">
                Blockchain Hackathon Prototype
              </p>

              <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-[#57111d] sm:text-6xl lg:text-7xl">
                Fly with confidence.
                <span className="block text-[#a06b27]">
                  Get paid when delays happen.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#665a51]">
                Blockchain-powered flight delay protection with transparent
                policies and automated claims.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/insurance"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7f1728] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7f1728]/15 transition hover:bg-[#68121f]"
                >
                  Get Insured
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/policies"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8c39d] bg-white px-7 py-3.5 text-sm font-bold text-[#57111d] transition hover:border-[#b99859] hover:bg-[#fffdf8]"
                >
                  Check My Policy
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#665a51]">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#a06b27]" />
                  Transparent policies
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={17} className="text-[#a06b27]" />
                  Delay-based protection
                </span>

                <span className="flex items-center gap-2">
                  <Sparkles size={17} className="text-[#a06b27]" />
                  AI-assisted risk
                </span>
              </div>
            </div>

            {/* Flight visual */}
            <div className="relative z-10">
              <div className="relative mx-auto max-w-xl">
                <div className="absolute inset-8 rounded-[3rem] bg-[#7f1728]/10 blur-3xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-[#dbcaa9] bg-gradient-to-br from-[#691321] via-[#7f1728] to-[#4b101a] p-7 shadow-2xl shadow-[#57111d]/20 sm:p-9">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#e7b75b]/20" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#e7b75b]/15" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7b75b]">
                          Protected Journey
                        </p>
                        <p className="mt-1 text-sm text-[#f0ddd1]">
                          AI202 · Air India
                        </p>
                      </div>

                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#fff8ed]">
                        TESTNET
                      </div>
                    </div>

                    <div className="my-12 flex items-center gap-5">
                      <div>
                        <p className="text-3xl font-serif font-bold text-white">
                          HYD
                        </p>
                        <p className="mt-1 text-xs text-[#d9c0b4]">
                          Hyderabad
                        </p>
                      </div>

                      <div className="relative flex-1">
                        <div className="border-t border-dashed border-[#d9a94f]/60" />
                        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] items-center justify-center rounded-full bg-[#d9a94f] text-[#57111d] shadow-lg">
                          <Plane size={22} fill="currentColor" />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-serif font-bold text-white">
                          DEL
                        </p>
                        <p className="mt-1 text-xs text-[#d9c0b4]">
                          New Delhi
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white/8 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#d9c0b4]">
                          Delay
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          90 min
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/8 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#d9c0b4]">
                          Coverage
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          ₹1,000
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/8 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#d9c0b4]">
                          Status
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#e7b75b]">
                          <CheckCircle2 size={15} />
                          Protected
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-[#dbcaa9] bg-white p-4 shadow-xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8edd7] text-[#8c6227]">
                      <ShieldCheck size={21} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#8a7a6c]">
                        Protection
                      </p>
                      <p className="text-sm font-bold text-[#57111d]">
                        Blockchain verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="flightguard-section bg-[#fffdf8]">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a6b2f]">
                How it works
              </p>

              <div className="gold-line mt-4" />

              <h2 className="mt-5 font-serif text-4xl font-bold text-[#57111d] sm:text-5xl">
                Simple protection for an unpredictable journey.
              </h2>

              <p className="mt-5 text-base leading-7 text-[#6d6259]">
                Choose your coverage, pay with SepoliaETH, and keep a
                transparent on-chain record of your policy.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  number: "01",
                  title: "Enter Flight",
                  text: "Add your passenger and journey details.",
                  icon: Plane,
                },
                {
                  number: "02",
                  title: "Choose Insurance",
                  text: "Select protection that fits your trip.",
                  icon: ShieldCheck,
                },
                {
                  number: "03",
                  title: "Pay with SepoliaETH",
                  text: "Approve the testnet transaction in MetaMask.",
                  icon: CheckCircle2,
                },
                {
                  number: "04",
                  title: "Automatic Verification",
                  text: "Delay information drives eligibility and claims.",
                  icon: Clock3,
                },
              ].map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="glass-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#d9a94f]">
                        {step.number}
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8edd7] text-[#7f1728]">
                        <Icon size={20} />
                      </div>
                    </div>

                    <h3 className="mt-7 font-serif text-xl font-bold text-[#57111d]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#6d6259]">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-[#eadfcf] bg-[#f8f0e4]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6b2f]">
                Built for the hackathon
              </p>
              <p className="mt-1 text-sm text-[#5e5148]">
                Ethereum Sepolia testnet · Transparent policy records ·
                AI-assisted risk assessment
              </p>
            </div>

            <Link
              to="/insurance"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7f1728] hover:text-[#57111d]"
            >
              Explore coverage
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Services() {
  const services = [
    {
      icon: "✈️",
      title: "Flight Delay Protection",
      description:
        "Get financial protection when your flight is delayed beyond your selected policy threshold.",
    },
    {
      icon: "🔗",
      title: "Blockchain Verification",
      description:
        "Your insurance policy is recorded on Ethereum Sepolia for transparent and verifiable transactions.",
    },
    {
      icon: "🤖",
      title: "AI Risk Assessment",
      description:
        "AI-assisted analysis helps evaluate flight delay conditions and provides an additional risk assessment.",
    },
    {
      icon: "📡",
      title: "Flight Delay Monitoring",
      description:
        "Flight delay information can be recorded and verified before a claim is processed.",
    },
    {
      icon: "💰",
      title: "Automated Payouts",
      description:
        "When a policy becomes eligible, the smart contract can process the covered payout.",
    },
    {
      icon: "📋",
      title: "Policy Management",
      description:
        "View your active policies, coverage, delay thresholds, premiums and claim status in one place.",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-16 lg:px-8">
        <section className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a66b24]">
            FlightGuard Services
          </p>

          <h1 className="font-serif text-5xl font-bold text-[#57111d]">
            Protection built for modern travelers
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            FlightGuard combines blockchain, smart contracts and AI-assisted
            analysis to create transparent flight-delay protection.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-[#eadcc8] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5d98b] text-2xl">
                {service.icon}
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#57111d]">
                {service.title}
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-2xl bg-[#57111d] px-7 py-10 text-center text-white">
          <h2 className="font-serif text-3xl font-bold">
            Travel with greater confidence
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#f8e9d2]">
            Choose your protection plan, connect your wallet and keep your
            flight journey protected through transparent blockchain-based
            insurance.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Services;
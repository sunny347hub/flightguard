import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PolicyDetails() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-20 lg:px-8">
        <h1 className="font-serif text-5xl font-bold text-[#57111d]">
          Policy Details
        </h1>
      </main>
      <Footer />
    </>
  );
}

export default PolicyDetails;
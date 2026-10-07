import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-[#eadfcf] bg-[#4b101a] text-[#fff8ed]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a94f] text-[#57111d]">
                <ShieldCheck size={21} />
              </div>
              <span className="font-serif text-xl font-bold tracking-wide">
                FLIGHTGUARD
              </span>
            </div>

            <p className="max-w-sm text-sm leading-6 text-[#ead9ca]">
              Blockchain-powered flight delay protection with transparent
              policies and automated claims.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#e7b75b]">
              Explore
            </h3>

            <div className="flex flex-col gap-3 text-sm text-[#ead9ca]">
              <Link to="/insurance" className="hover:text-white">
                Insurance
              </Link>
              <Link to="/policies" className="hover:text-white">
                My Policies
              </Link>
              <Link to="/services" className="hover:text-white">
                Services
              </Link>
              <Link to="/feedback" className="hover:text-white">
                Feedback
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#e7b75b]">
              Trust
            </h3>

            <div className="space-y-3 text-sm text-[#ead9ca]">
              <p>Built on Ethereum Sepolia</p>
              <p>Smart Contract Verified</p>
              <p>Transparent Policy Records</p>

              <a
                href="https://sepolia.etherscan.io/address/0x5F5FCd92381888357cfd85Ed7Ad4FAe06Dc6c7e3"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#e7b75b] hover:text-white"
              >
                View Contract
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#702532] pt-6 text-xs leading-5 text-[#d6c0b2]">
          This is a blockchain hackathon prototype running on Ethereum Sepolia
          testnet. It is not real insurance and uses testnet assets only.
        </div>

        <div className="mt-4 text-xs text-[#bda79a]">
          © {new Date().getFullYear()} FLIGHTGUARD. Hackathon Prototype.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
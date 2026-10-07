import { Link, NavLink } from "react-router-dom";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import WalletButton from "./WalletButton";

const links = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Insurance", to: "/insurance" },
  { label: "My Policies", to: "/policies" },
  { label: "Services", to: "/services" },
  { label: "Feedback", to: "/feedback" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfcf] bg-[#fffaf2]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7f1728] text-[#e7b75b] shadow-sm">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </div>

          <div>
            <div className="font-serif text-xl font-bold tracking-wide text-[#57111d]">
              FLIGHTGUARD
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b2f]">
              Flight Delay Protection
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) =>
            link.to.includes("#") ? (
              <a
                key={link.label}
                href={link.to}
                className="text-sm font-medium text-[#51463d] transition hover:text-[#7f1728]"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-[#7f1728]"
                      : "text-[#51463d] hover:text-[#7f1728]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <WalletButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-[#57111d] lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#eadfcf] bg-[#fffaf2] px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-[#51463d]"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-[#51463d]"
                >
                  {link.label}
                </NavLink>
              )
            )}

            <div className="pt-2">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
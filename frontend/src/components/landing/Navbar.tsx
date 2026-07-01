import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card rounded-none border-x-0 border-t-0 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">RUBIX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("features")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollTo("integrations")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              Integrations
            </button>
            <Link to="/sign-in" className="btn-ghost text-sm font-semibold">
              Sign In
            </Link>
            <Link to="/sign-up" className="btn-primary text-sm !py-2 !px-5">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {open && (
        <div className="md:hidden glass-card rounded-none border-x-0 border-t-0">
          <div className="flex flex-col gap-4 p-6">
            <button onClick={() => scrollTo("features")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface">
              Features
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface">
              How It Works
            </button>
            <button onClick={() => scrollTo("integrations")} className="text-sm font-medium text-on-surface-variant hover:text-on-surface">
              Integrations
            </button>
            <hr className="border-outline-variant/50" />
            <Link to="/sign-in" className="btn-ghost text-sm font-semibold justify-center">
              Sign In
            </Link>
            <Link to="/sign-up" className="btn-primary text-sm justify-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

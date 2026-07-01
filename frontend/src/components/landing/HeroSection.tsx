import { Link } from "react-router-dom";
import { ShaderCanvas } from "../effects/ShaderCanvas";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <ShaderCanvas />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-16 w-full">
        <div className="max-w-3xl">
          <h1 className="hero-headline text-white mb-6">
            From Guideline Chaos to{" "}
            <span className="gradient-text-light">Automated Execution</span>{" "}
            in One Click.
          </h1>
          <p className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-2xl leading-relaxed">
            Rubix uses AI to parse complex PDF guidelines, assign tasks, and automate
            team reminders — so you never miss a deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/sign-up" className="btn-primary text-base px-8 py-4 rounded-full justify-center">
              Start Free
            </Link>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary text-base px-8 py-4 rounded-full justify-center"
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 md:mt-24 glass-card rounded-2xl p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-purple-400" />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {["Total Projects", "Active", "Completed", "Overdue"].map((label) => (
              <div key={label} className="glass-card rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {label === "Total Projects" ? "12" : label === "Active" ? "5" : label === "Completed" ? "7" : "0"}
                </div>
                <div className="text-xs text-[#94A3B8]">{label}</div>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cfbcff] to-[#6750a4]" />
              <div>
                <div className="text-sm font-semibold text-white">CS301 Final Report</div>
                <div className="text-xs text-[#94A3B8]">Due in 5 days</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#e1d4fd]" />
                <span className="w-6 h-6 rounded-full bg-[#c9a74d]" />
                <span className="w-6 h-6 rounded-full bg-[#4f378a]" />
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/3 rounded-full gradient-progress" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

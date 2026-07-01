import { Link } from "react-router-dom";

export function Footer() {
  const sections = [
    {
      title: "Product",
      links: ["Features", "Integrations", "Pricing", "FAQ"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
    {
      title: "Support",
      links: ["Help Center", "Documentation", "API Status", "Community"],
    },
  ];

  return (
    <footer className="bg-[#0F172A] text-white/70 py-16 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-white/10 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text-light">RUBIX</span>
          </div>
          <p className="text-sm text-white/50">
            © 2026 Rubix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

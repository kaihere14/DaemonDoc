import React from "react";

const PRODUCT_LINKS = ["Features", "Workflow", "Demo", "GitHub App"];
const COMPANY_LINKS = ["About", "Careers", "Security"];
const RESOURCE_LINKS = ["Documentation", "API Reference", "Changelog"];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16">
          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <img src="/DaemonLogo.png" alt="DaemonDoc" className="w-60 self-center pt-2" />
            </div>
            <p className="text-slate-600 leading-relaxed font-light max-w-xs text-sm">
              The automation layer for your codebase documentation.
            </p>
          </div>

          {/* Link columns */}
          <div className="md:col-span-5 grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-slate-900 font-semibold mb-6 text-xs uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-4">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-[#1d4ed8] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold mb-6 text-xs uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-4">
                {COMPANY_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-[#1d4ed8] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold mb-6 text-xs uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-4">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-[#1d4ed8] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscribe column */}
          <div className="md:col-span-3">
            <h4 className="text-slate-900 font-semibold mb-6 text-xs uppercase tracking-wider">
              Subscribe to Updates
            </h4>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Get the latest technical releases and news directly in your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] outline-none transition-all placeholder:text-slate-400"
              />
              <button className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 text-sm">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <span className="text-slate-500 text-sm">
              © {currentYear} DaemonDoc Inc.
            </span>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-[#1d4ed8] transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-slate-500 hover:text-[#1d4ed8] transition-colors text-sm">
                Terms
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* X (Twitter) */}
            <a
              href="#"
              className="text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/kaihere14/daemondoc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

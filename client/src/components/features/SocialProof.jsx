import React from "react";
import { Code2, Cloud, Zap, Boxes, Hexagon } from "lucide-react";

const COMPANIES = [
  { icon: Code2, name: "ACME Corp" },
  { icon: Cloud, name: "Nebula" },
  { icon: Zap, name: "FlashDev" },
  { icon: Boxes, name: "Stacker" },
  { icon: Hexagon, name: "Polymer" },
];

const SocialProof = () => (
  <section className="py-12  bg-linear-to-b from-white via-slate-50/50 to-white">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
        Trusted by developers at
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
        {COMPANIES.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-1.5 text-lg font-bold text-slate-800 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <c.icon size={18} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;

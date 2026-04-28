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
  <section className="bg-linear-to-b from-white via-slate-50/50 to-white ">
    <div className="mx-auto max-w-7xl px-4 text-center">
      {/* <p className="mb-8 text-xs font-semibold tracking-widest text-slate-400 uppercase">
        Trusted by developers at
      </p> */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {COMPANIES.map((c) => (
          <div
            key={c.name}
            className="flex cursor-default items-center gap-1.5 text-lg font-bold text-slate-800 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
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

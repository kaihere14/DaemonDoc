import { Code2, Cloud, Zap, Boxes, Hexagon } from "lucide-react";

const COMPANIES = [
  { icon: Code2, name: "ACME Corp" },
  { icon: Cloud, name: "Nebula" },
  { icon: Zap, name: "FlashDev" },
  { icon: Boxes, name: "Stacker" },
  { icon: Hexagon, name: "Polymer" },
];

export default function SocialProof() {
  return (
    <div aria-label="Teams using DaemonDoc" role="group">
      <div className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {COMPANIES.map((c) => (
            <div
              key={c.name}
              className="font-display flex cursor-default items-center gap-1.5 text-lg font-bold text-slate-800 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <c.icon size={18} />
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

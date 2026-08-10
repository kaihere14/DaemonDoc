"use client";

import { useState } from "react";

interface EngineFeature {
  icon: React.ComponentType<Record<string, unknown>>;
  animation: string;
  title: string;
  desc: string;
  iconClass: string;
}

interface EngineCardProps {
  f: EngineFeature;
}

export default function EngineCard({ f }: EngineCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-raised)] focus-within:shadow-[var(--shadow-raised)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        className={`h-12 w-12 ${f.iconClass} mb-6 flex items-center justify-center rounded-xl transition-transform duration-300`}
      >
        <f.icon size={22} animate={hovered ? f.animation : false} />
      </div>
      <h3 className="mb-2 text-base font-bold tracking-[0.045em] text-slate-900 uppercase">
        {f.title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
    </div>
  );
}

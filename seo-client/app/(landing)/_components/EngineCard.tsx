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
      className="relative bg-white p-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute top-2 -left-1 w-[calc(100%+0.5rem)] border border-dashed border-neutral-200"></div>
      <div className="pointer-events-none absolute -top-1 left-2 h-[calc(100%+0.5rem)] border border-dashed border-neutral-200"></div>
      <div className="pointer-events-none absolute -top-1 right-2 h-[calc(100%+0.5rem)] border border-dashed border-neutral-200"></div>
      <div className="pointer-events-none absolute bottom-2 -left-1 w-[calc(100%+0.5rem)] border border-dashed border-neutral-200"></div>

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

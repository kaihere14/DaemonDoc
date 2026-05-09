"use client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

export default function UpgradeButton() {
  return (
    <a
      href={`${APP_URL}/upgrade`}
      className="relative isolate block w-full cursor-pointer overflow-hidden rounded-full bg-blue-600 py-3 text-center text-lg font-semibold text-white transition-all after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:translate-x-[-180%] after:skew-x-[-20deg] after:bg-white/40 after:blur-sm after:transition-transform after:duration-700 after:content-[''] hover:brightness-110 hover:after:translate-x-[320%]"
    >
      <span className="relative z-10">Upgrade to Pro</span>
    </a>
  );
}

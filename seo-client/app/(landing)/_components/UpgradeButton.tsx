"use client";

import { CandyLink } from "@/components/ui/candy-button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

export default function UpgradeButton() {
  return (
    <CandyLink href={`${APP_URL}/upgrade`} className="w-full py-3 text-lg">
      Upgrade to Pro
    </CandyLink>
  );
}

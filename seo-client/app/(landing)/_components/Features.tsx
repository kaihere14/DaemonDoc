import CoreCapabilities from "./CoreCapabilities";
import Testimonials from "./Testimonials";
import Pricing from "./Pricing";
import EngineSection from "./EngineSection";
import type { Plan } from "../_lib/plans";

interface FeaturesProps {
  monthly: Plan | null;
  yearly: Plan | null;
}

export default function Features({ monthly, yearly }: FeaturesProps) {
  return (
    <>
      <CoreCapabilities />
      <Testimonials />
      <Pricing monthly={monthly} yearly={yearly} />
      <EngineSection />
    </>
  );
}

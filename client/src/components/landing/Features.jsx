import React from "react";
import CoreCapabilities from "./sections/CoreCapabilities";
import Pricing from "./sections/Pricing";
import EngineSection from "./sections/EngineSection";
import Testemonials from "./Testemonials";

const Features = () => (
  <>
    <CoreCapabilities />
    <Testemonials />
    <Pricing />
    <EngineSection />
  </>
);

export default Features;

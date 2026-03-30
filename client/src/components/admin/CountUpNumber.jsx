/* eslint-disable react/prop-types */
import React from "react";

const CountUpNumber = ({ value, suffix = "", duration = 1100 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const target = Number(value) || 0;
  const widthCh = Math.max(String(target).length + String(suffix).length, 2);

  React.useEffect(() => {
    let frameId;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = globalThis.requestAnimationFrame(tick);
      }
    };

    setDisplayValue(0);
    frameId = globalThis.requestAnimationFrame(tick);

    return () => {
      if (frameId) {
        globalThis.cancelAnimationFrame(frameId);
      }
    };
  }, [target, duration]);

  return (
    <span
      className="inline-block tabular-nums"
      style={{ minWidth: `${widthCh}ch` }}
    >
      {displayValue}
      {suffix}
    </span>
  );
};

export default CountUpNumber;

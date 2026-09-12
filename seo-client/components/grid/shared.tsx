import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useId } from "react";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return <div className={className}>{children}</div>;
};

export const CardHeading = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-md font-md flex items-center gap-2">{children}</div>
  );
};

export const CardDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="text-md font-md flex items-center gap-2 pt-3 text-neutral-500 sm:pt-2">
      {children}
    </div>
  );
};

export const CardIllustrations = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mx-auto min-h-[73%] w-[calc(100%-10px)] pt-5 sm:pt-3">
      {children}
    </div>
  );
};

export const LineSvg = ({
  className,
  delay = 0,
  color = "#F17463",
}: {
  className: string;
  delay?: number;
  color?: string;
}) => {
  const glowId = useId();
  return (
    <svg
      width="312"
      height="33"
      viewBox="0 0 312 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute top-2 right-4 overflow-visible", className)}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M0.5 1 H311.5 V32"
        stroke="#e5e5e5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0.5 1 H311.5 V32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="24 366"
        filter={`url(#${glowId})`}
        style={{
          animation: `line-pulse-travel-corner 2.6s linear ${delay}s infinite`,
        }}
      />
    </svg>
  );
};

export const StraightLine = ({
  className,
  delay = 0,
  color = "#F17463",
}: {
  className: string;
  delay?: number;
  color?: string;
}) => {
  const glowId = useId();
  return (
    <svg
      width="312"
      height="2"
      viewBox="0 0 312 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute overflow-visible", className)}
    >
      <defs>
        <filter
          id={glowId}
          filterUnits="userSpaceOnUse"
          x="-10"
          y="-10"
          width="332"
          height="22"
        >
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M0.5 1 H311.5"
        stroke="#e5e5e5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0.5 1 H311.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="24 335"
        filter={`url(#${glowId})`}
        style={{
          animation: `line-pulse-travel-straight 2.6s linear ${delay}s infinite`,
        }}
      />
    </svg>
  );
};

export const PulseBorderIcon = ({ className }: { className?: string }) => {
  const glowId = useId();
  return (
    <div className={cn("absolute size-12", className)}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="absolute inset-0 overflow-visible"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#e5e5e5"
          strokeWidth="1"
          fill="none"
        />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 176.6"
          filter={`url(#${glowId})`}
          style={{
            animation: "border-ring-pulse 3s linear infinite",
          }}
        />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#a855f7"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 176.6"
          filter={`url(#${glowId})`}
          style={{
            animation: "border-ring-pulse 3s linear infinite",
            animationDelay: "-1.5s",
          }}
        />
      </svg>
      <div className="absolute inset-px flex items-center justify-center rounded-[2px] bg-neutral-100">
        <Image
          src="/daemon-icon.webp"
          width={183}
          height={240}
          alt="DaemonDoc"
          className="h-7 w-auto pl-1"
        />
      </div>
    </div>
  );
};

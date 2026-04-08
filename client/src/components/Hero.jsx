import React, { useRef } from "react";
import { Play, ArrowRight, Lock, GitCommit, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Unplug } from "@/components/animate-ui/icons/unplug";
import { Activity } from "@/components/animate-ui/icons/activity";
import { ClipboardCheck } from "@/components/animate-ui/icons/clipboard-check";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

const FLOATING_ICONS = [
  {
    id: "java",
    bg: "#ffffff",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
    pos: "top-20 left-4",
    rotate: "-rotate-6",
    anim: "animate-float-slow",
  },
  {
    id: "cpp",
    bg: "#00599c",
    logo: "https://cdn.simpleicons.org/cplusplus/ffffff",
    pos: "top-60 left-24",
    rotate: "rotate-12",
    anim: "animate-float-slow-delayed",
  },
  {
    id: "go",
    bg: "#00acd7",
    logo: "https://cdn.simpleicons.org/go/ffffff",
    pos: "top-96 left-10",
    rotate: "-rotate-3",
    anim: "animate-float-slow",
  },
  {
    id: "js",
    bg: "#ffffff",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    pos: "top-24 right-12",
    rotate: "rotate-6",
    anim: "animate-float-slow-delayed",
  },
  {
    id: "ts",
    bg: "#3178c6",
    logo: "https://cdn.simpleicons.org/typescript/ffffff",
    pos: "top-64 right-32",
    rotate: "-rotate-12",
    anim: "animate-float-slow",
  },
  {
    id: "react",
    bg: "#20232a",
    logo: "https://cdn.simpleicons.org/react/61dafb",
    pos: "top-96 right-10",
    rotate: "rotate-3",
    anim: "animate-float-slow-delayed",
  },
];

const STEPS = [
  {
    Icon: (props) => <Unplug {...props} />,
    title: "Connect Repo",
    desc: "Link your GitHub repository once",
    iconClass: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    Icon: (props) => <Activity {...props} />,
    title: "Push Code",
    desc: "Just code & commit as usual",
    iconClass: "bg-sky-100 text-sky-600 border-sky-200",
  },
  {
    Icon: (props) => <ClipboardCheck {...props} />,
    title: "README Updates",
    desc: "Docs sync automatically instantly",
    iconClass: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
];

const Hero = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <main
      className="relative overflow-hidden pt-36 pb-20 lg:pt-50 lg:pb-24"
      id="hero"
    >
      {/* Subtle SVG Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 mask-[radial-gradient(100%_100%_at_50%_0%,white,transparent)] opacity-[0.15]">
        <svg className="h-full w-full" aria-hidden="true">
          <defs>
            <pattern
              id="hero-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M.5 60V.5H60"
                fill="none"
                stroke="currentColor"
                className="text-blue-500"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-transparent via-cyan-50/30 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Floating tech icon chips — absolute inside the container so they hug content edges */}
        {FLOATING_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`absolute hidden lg:block ${icon.pos} ${icon.anim}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md shadow-lg shadow-slate-200/40 ${icon.rotate}`}
              style={{ background: icon.bg }}
            >
              <img src={icon.logo} alt={icon.id} className="h-8 w-8" />
            </div>
          </div>
        ))}
        {/* Headline + CTAs */}
        <div className="mx-auto max-w-4xl space-y-8">
          <h1
            className="overflow-visible text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Where your code turns into{" "}
            <span className="text-primary relative mx-1 inline-block transform-[perspective(800px)_rotateY(15deg)_rotateX(5deg)] rounded-lg border border-blue-100 bg-blue-50/50 px-2 leading-tight font-extrabold whitespace-nowrap shadow-sm drop-shadow-2xl text-shadow-md sm:mr-0 sm:ml-5">
              documentation
              <svg
                className="text-primary/40 absolute -bottom-2 left-0 h-3 w-full"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M0 5 Q 50 1 100 5 T 200 5"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                />
              </svg>
            </span>{" "}
            with a click
          </h1>

          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-light text-slate-600 md:text-2xl">
            Connect once. We handle the rest. Your README updates automatically
            with every git push.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <button
              onClick={() => {
                location.href = "/login";
              }}
              className="group bg-primary group hover:bg-primary/90 flex cursor-pointer items-center gap-3 rounded-full px-8 py-3.5 font-medium text-white shadow-xl drop-shadow-2xl transition-colors duration-200 ease-in-out text-shadow-md"
            >
              <span>Try Now</span>
              <span className="rounded-full bg-white p-1 text-slate-900 drop-shadow-2xl transition-all duration-300 ease-out group-hover:-rotate-23">
                <ArrowRight size={14} />
              </span>
            </button>

            <a
              href="#features"
              className="flex items-center justify-center gap-1 rounded-full p-4 font-medium text-slate-600 transition duration-300 hover:bg-neutral-300/30"
            >
              View Capabilities
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* 3-step flow */}
        <div className="mx-auto mt-16 mb-8 max-w-4xl px-4">
          <div className="relative grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {/* Connecting SVG Flow (desktop only) */}
            <div className="pointer-events-none absolute top-[28px] left-0 z-0 hidden h-[80px] w-full overflow-visible md:block">
              <svg
                width="100%"
                height="80"
                viewBox="0 0 1000 80"
                fill="none"
                preserveAspectRatio="none"
              >
                {/* More visible base path with 'live' flow */}
                <motion.path
                  d="M 120 40 L 880 40"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="10 10"
                  className="opacity-40"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Bright Travelling Data Packet */}
                <motion.circle
                  r="4"
                  fill="#1d4ed8"
                  className="shadow-[0_0_12px_rgba(29,78,216,0.8)]"
                  animate={{
                    cx: [120, 500, 500, 880, 880, 120],
                    opacity: [0, 1, 1, 1, 0, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    times: [0, 0.1, 0.45, 0.9, 0.95, 1],
                    ease: "easeInOut",
                  }}
                  cy="40"
                />
              </svg>
            </div>

            {STEPS.map((step, i) => (
              <AnimateIcon key={i} animateOnHover asChild>
                <div className="group relative z-10 rounded-xl border border-dashed border-neutral-200 bg-white/60 p-4 drop-shadow-xl backdrop-blur-sm transition-colors duration-300 hover:bg-white">
                  <div
                    className={`h-12 w-12 ${step.iconClass} mx-auto mb-3 flex items-center justify-center rounded-full border shadow-sm transition-shadow group-hover:shadow-md`}
                  >
                    <step.Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                </div>
              </AnimateIcon>
            ))}
          </div>
        </div>

        {/* README Preview Card */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          {/* Gradient glow */}
          <div className="animate-pulse-slow absolute -inset-1 top-0 right-0 left-0 rounded-2xl bg-linear-to-r from-blue-500 to-sky-500 opacity-20 blur" />

          {/* Browser card */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3">
              <div className="flex shrink-0 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex flex-1 items-center justify-center gap-1 rounded-md bg-white py-1 pr-20 font-mono text-xs text-slate-400">
                <Lock size={10} className="shrink-0" />
                daemondoc.online
              </div>
            </div>

            {/* Video content */}
            <div
              className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-900"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            >
              <video
                ref={videoRef}
                src="https://pub-e788e87cb08043ab80dcbe889ea20c84.r2.dev/uploads/6938711c1aafcfa552a1d8ef/0e27fe3948b7dddab65cd51143e7212f40ba6efaad7c1282d1527cbe3fde92fb%2B27"
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              {/* Image thumbnail overlay */}
              <img
                src="/landing.png"
                alt="Demo thumbnail"
                className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
              />

              {/* Play/pause icon overlay */}
              <div
                className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/10 transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/20 shadow-lg backdrop-blur-md">
                  <Play
                    size={28}
                    className="ml-1 text-white"
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blend gradient at the bottom */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-40 w-full bg-linear-to-t from-white to-transparent" />
    </main>
  );
};

export default Hero;

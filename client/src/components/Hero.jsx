import React, { useRef } from "react";
import {
  Play,
  ArrowRight,
  Lock,
  GitCommit,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Unplug } from "@/components/animate-ui/icons/unplug";
import { Activity } from "@/components/animate-ui/icons/activity";
import { ClipboardCheck } from "@/components/animate-ui/icons/clipboard-check";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

// Positioned relative to the max-w-7xl container (not the viewport)
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
      className="relative  pt-36 pb-20 lg:pt-50 lg:pb-24 overflow-hidden"
      id="hero"
    >
      {/* Subtle SVG Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] mask-[radial-gradient(100%_100%_at_50%_0%,white,transparent)]">
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

      <div className="absolute inset-0  bg-linear-to-b from-transparent via-cyan-50/30  to-white  z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  relative z-10 text-center">
        {/* Floating tech icon chips — absolute inside the container so they hug content edges */}
        {FLOATING_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`hidden lg:block absolute ${icon.pos} ${icon.anim}`}
          >
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg shadow-slate-200/40 ${icon.rotate}`}
              style={{ background: icon.bg }}
            >
              <img src={icon.logo} alt={icon.id} className="w-8 h-8" />
            </div>
          </div>
        ))}
        {/* Headline + CTAs */}
        <div className="max-w-4xl mx-auto space-y-8">
          <h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-slate-900 overflow-visible"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Where your code turns into{" "}
            <span className="relative inline-block text-shadow-md drop-shadow-2xl text-primary font-extrabold mx-1 sm:ml-5 sm:mr-0 transform-[perspective(800px)_rotateY(15deg)_rotateX(5deg)] bg-blue-50/50 px-2 rounded-lg border border-blue-100 shadow-sm leading-tight whitespace-nowrap">
              documentation
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
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

          <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            Connect once. We handle the rest. Your README updates automatically
            with every git push.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                location.href = "/login";
              }}
              className="group bg-primary group text-shadow-md drop-shadow-2xl cursor-pointer text-white px-8 py-3.5 rounded-full font-medium flex items-center gap-3 hover:bg-primary/90 transition-colors ease-in-out duration-200 shadow-xl"
            >
              <span>Try Now</span>
              <span className="bg-white group-hover:-rotate-23 drop-shadow-2xl transition-all duration-300 ease-out text-slate-900  rounded-full p-1">
                <ArrowRight size={14} />
              </span>
            </button>

            <a
              href="#features"
              className="text-slate-600 hover:bg-neutral-300/30 p-4 rounded-full font-medium transition duration-300 flex items-center justify-center gap-1"
            >
              View Capabilities
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* 3-step flow */}
        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Connecting SVG Flow (desktop only) */}
            <div className="hidden md:block absolute top-[28px] left-0 w-full h-[80px] z-0 overflow-visible pointer-events-none">
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
                <div className="relative border-dashed border border-neutral-200 drop-shadow-xl z-10 bg-white/60 backdrop-blur-sm p-4 rounded-xl group hover:bg-white transition-colors duration-300">
                  <div
                    className={`w-12 h-12 ${step.iconClass} rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border transition-shadow group-hover:shadow-md`}
                  >
                    <step.Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                </div>
              </AnimateIcon>
            ))}
          </div>
        </div>

        {/* README Preview Card */}
        <div className="mt-12 relative mx-auto max-w-5xl">
          {/* Gradient glow */}
          <div className="absolute top-0 left-0 right-0 -inset-1 bg-linear-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-20 animate-pulse-slow" />

          {/* Browser card */}
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Browser chrome */}
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-4">
              <div className="flex gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white rounded-md py-1 pr-20 text-xs text-slate-400 flex items-center justify-center gap-1 font-mono">
                <Lock size={10} className="shrink-0" />
                daemondoc.online
              </div>
            </div>

            {/* Video content */}
            <div
              className="relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer"
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
                className="w-full h-full object-cover"
              />
              {/* Image thumbnail overlay */}
              <img
                src="/landing.png"
                alt="Demo thumbnail"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${isPlaying ? "opacity-0" : "opacity-100"}`}
              />

              {/* Play/pause icon overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 pointer-events-none z-20 ${isPlaying ? "opacity-0" : "opacity-100"}`}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20">
                  <Play
                    size={28}
                    className="text-white ml-1"
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blend gradient at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-40 bg-linear-to-t from-white to-transparent pointer-events-none z-0" />
    </main>
  );
};

export default Hero;

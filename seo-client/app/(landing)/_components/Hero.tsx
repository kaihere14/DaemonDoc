"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, ArrowRight, Lock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Unplug } from "@/app/(landing)/_animate-ui/icons/unplug";
import { Activity } from "@/app/(landing)/_animate-ui/icons/activity";
import { ClipboardCheck } from "@/app/(landing)/_animate-ui/icons/clipboard-check";
import { AnimateIcon } from "@/app/(landing)/_animate-ui/icons/icon";
import { CandyLink } from "@/components/ui/candy-button";
import { SECTION_X } from "@/app/(landing)/_lib/section";
import GradientWaves from "@/components/GradientWaves";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

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
    Icon: (props: Record<string, unknown>) => <Unplug {...props} />,
    title: "Connect Repo",
    desc: "Link your GitHub repository once",
    iconClass: "bg-[#D6EAFF] text-[#005FD6] border-[#A9D3FF]",
  },
  {
    Icon: (props: Record<string, unknown>) => <Activity {...props} />,
    title: "Push Code",
    desc: "Just code & commit as usual",
    iconClass: "bg-[#D6EAFF] text-[#005FD6] border-[#A9D3FF]",
  },
  {
    Icon: (props: Record<string, unknown>) => <ClipboardCheck {...props} />,
    title: "README Updates",
    desc: "Docs sync automatically instantly",
    iconClass: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <main
      className="relative overflow-hidden pt-32 pb-14 lg:pt-44 lg:pb-20"
      id="hero"
    >
      {/* SVG Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <GradientWaves
          horizonColor="#209BFF"
          opacity={1}
          detail="high"
          height={15}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-transparent via-[#EAF4FF]/30 to-white" />

      <div className={`relative z-10 text-center ${SECTION_X}`}>
        {/* Floating tech icon chips */}
        {FLOATING_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`absolute hidden lg:block ${icon.pos} ${icon.anim}`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-lg shadow-slate-200/40 ${icon.rotate}`}
              style={{ background: icon.bg }}
            >
              {/* Purely decorative: the language set is conveyed by the copy, so
                  these stay out of the accessibility tree. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={icon.logo}
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </div>
          </div>
        ))}

        {/* Headline + CTAs */}
        <div className="mx-auto max-w-4xl space-y-8">
          <h1 className="font-display overflow-visible text-4xl leading-[1.06] font-bold tracking-[-0.038em] text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Where your code turns into{" "}
            <span className="text-primary relative mx-1 inline-block transform-[perspective(800px)_rotateY(15deg)_rotateX(5deg)] rounded-t-lg border border-[#D6EAFF] bg-[#EAF4FF]/50 px-2 leading-tight font-extrabold whitespace-nowrap shadow-sm drop-shadow-2xl text-shadow-md sm:mr-0 sm:ml-5">
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
                  initial={
                    reduceMotion
                      ? { pathLength: 1, opacity: 1 }
                      : { pathLength: 0, opacity: 0 }
                  }
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 1.5, delay: 0.5, ease: "easeOut" }
                  }
                />
              </svg>
            </span>{" "}
            with a click
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed font-light tracking-[-0.012em] text-slate-600 sm:text-xl md:text-2xl">
            Connect once. We handle the rest. Your README updates automatically
            with every git push.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <CandyLink
              href={`${APP_URL}/login`}
              className="w-full gap-2 sm:w-auto"
            >
              Try Now
              <ArrowRight size={18} />
            </CandyLink>

            <a
              href="#features"
              className="flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-transparent px-9 py-3 font-medium text-slate-600 transition-all duration-300 ease-in-out hover:border-white active:scale-[0.98]"
            >
              View Capabilities
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* 3-step flow */}
        <section
          aria-labelledby="hero-steps"
          className="mx-auto mt-16 max-w-4xl"
        >
          <h2 id="hero-steps" className="sr-only">
            How DaemonDoc works
          </h2>
          <div className="relative grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {/* Connecting SVG Flow (desktop only) */}
            <div className="pointer-events-none absolute top-121 left-0 z-0 hidden h-20 w-full overflow-visible md:block">
              <svg
                width="100%"
                height="80"
                viewBox="0 0 1000 80"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 120 40 L 880 40"
                  stroke="#209BFF"
                  strokeWidth="1.5"
                  strokeDasharray="10 10"
                  className="mt-10 opacity-40"
                  animate={
                    reduceMotion ? undefined : { strokeDashoffset: [0, -20] }
                  }
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {!reduceMotion && (
                  <motion.circle
                    r="4"
                    fill="#005FD6"
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
                )}
              </svg>
            </div>

            {STEPS.map((step, i) => (
              <AnimateIcon key={i} animateOnHover asChild>
                <div className="group relative z-10 rounded-xl border border-dashed border-neutral-200 bg-white p-4">
                  <div
                    className={`h-12 w-12 ${step.iconClass} mx-auto mb-3 flex items-center justify-center rounded-full border shadow-sm transition-shadow group-hover:shadow-md`}
                  >
                    <step.Icon size={24} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                </div>
              </AnimateIcon>
            ))}
          </div>
        </section>

        {/* README Preview Card */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="animate-pulse-slow absolute -inset-1 top-0 right-0 left-0 rounded-2xl bg-linear-to-r from-[#209BFF] to-[#54A1FD] opacity-20 blur" />

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
            {/* Reachable by keyboard: this is the only control for the demo
                video, so it needs a role, a tab stop and Enter/Space. */}
            <div
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? "Pause demo video" : "Play demo video"}
              aria-pressed={isPlaying}
              className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-900"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
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
              <Image
                src="/landing.png"
                alt="Demo thumbnail"
                fill
                className={`absolute inset-0 z-10 object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
              />
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

      {/* Bottom blend gradient */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-40 w-full bg-linear-to-t from-white to-transparent" />
    </main>
  );
}

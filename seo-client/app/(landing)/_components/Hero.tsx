"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Play,
  ArrowRight,
  Lock,
  Sparkles,
  ChevronRight,
  FileText,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { SECTION_X } from "@/app/(landing)/_lib/section";
import { CandyLink } from "@/components/ui/candy-button";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

/** Languages the analyzer reads — shown as a static strip under the prompt card. */
const TECH_LOGOS = [
  {
    id: "java",
    label: "Java",
    bg: "#ffffff",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  },
  {
    id: "cpp",
    label: "C++",
    bg: "#00599c",
    logo: "https://cdn.simpleicons.org/cplusplus/ffffff",
  },
  {
    id: "go",
    label: "Go",
    bg: "#00acd7",
    logo: "https://cdn.simpleicons.org/go/ffffff",
  },
  {
    id: "js",
    label: "JavaScript",
    bg: "#ffffff",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  },
  {
    id: "ts",
    label: "TypeScript",
    bg: "#3178c6",
    logo: "https://cdn.simpleicons.org/typescript/ffffff",
  },
  {
    id: "react",
    label: "React",
    bg: "#20232a",
    logo: "https://cdn.simpleicons.org/react/61dafb",
  },
];

/** The two things DaemonDoc does with a repo, shown as labels on the mock. */
const MODES = [
  { id: "generate", label: "Generate", Icon: FileText },
  { id: "sync", label: "Keep in sync", Icon: RefreshCw },
] as const;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

  // The photo starts edge-to-edge and pulls into a rounded, inset panel as the
  // page scrolls — the same move the reference makes.
  const { scrollY } = useScroll();
  const radius = useTransform(scrollY, [0, 260], [0, 32]);
  const inset = useTransform(scrollY, [0, 260], [0, 14]);
  const frameStyle = reduceMotion
    ? undefined
    : {
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        marginLeft: inset,
        marginRight: inset,
      };

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
    <main id="hero">
      {/* ── Full-bleed photo panel ─────────────────────────────────────────── */}
      <motion.section
        style={frameStyle}
        className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-40 pb-40 lg:pt-48 lg:pb-52"
      >
        <Image
          src="/background4.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center [filter:saturate(1.45)_contrast(1.14)_brightness(1.06)]"
        />

        {/* Scrims. Kept light so the photo stays saturated — the headline earns
            its contrast from a tight text-shadow instead of a heavy overlay. */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_45%_at_50%_30%,rgba(3,17,48,0.30)_0%,rgba(3,17,48,0.10)_55%,transparent_80%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-linear-to-b from-slate-950/32 via-slate-950/8 to-transparent" />

        <div className={`relative text-center ${SECTION_X}`}>
          {/* Eyebrow pill */}
          <a
            href="#engine"
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 py-2 pr-2.5 pl-3 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:gap-3 sm:pr-3 sm:pl-4 sm:text-sm"
          >
            <Sparkles size={15} className="shrink-0 text-sky-200" />
            <span className="h-4 w-px shrink-0 bg-white/30" />
            <span className="truncate">
              Synced on every push
              <span className="hidden sm:inline"> — no manual edits</span>
            </span>
            <ChevronRight size={15} className="shrink-0 opacity-70" />
          </a>

          {/* Headline. Reference proportions: ~64px desktop, regular weight —
              the display face carries the line, no bold and no ornament. */}
          <h1 className="font-display mx-auto mt-10 max-w-3xl text-[1.75rem] leading-[1.16] font-normal tracking-[-0.022em] text-white [text-shadow:0_1px_2px_rgba(3,17,48,0.7),0_3px_18px_rgba(3,17,48,0.55)] sm:mt-12 sm:text-5xl lg:text-[4rem]">
            From git push to current docs in seconds.
          </h1>

          {/* Prompt card. A still of the product, not a form — there is nothing
              to submit from the marketing site, so the only live control is the
              link into the app. The mock is inert and out of the tab order. */}
          <div className="mx-auto mt-14 w-full max-w-2xl rounded-[22px] bg-white/25 p-1 shadow-[var(--shadow-overlay)] ring-1 ring-white/40 backdrop-blur-md">
            <div className="rounded-[18px] bg-slate-950/90 p-4 text-left select-none">
              <p
                aria-hidden="true"
                className="px-2 pt-2 pb-10 font-mono text-sm text-slate-500 sm:pb-12 sm:text-lg"
              >
                github.com/your-org/your-repo
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.18em] bg-slate-500/80 align-baseline" />
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center gap-1 rounded-full bg-white/[0.06] p-1"
                >
                  {MODES.map(({ id, label, Icon }, i) => (
                    <span
                      key={id}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap sm:flex-none sm:px-4 ${
                        i === 0 ? "bg-white/12 text-white" : "text-slate-400"
                      }`}
                    >
                      <Icon size={15} className="hidden shrink-0 sm:block" />
                      {label}
                    </span>
                  ))}
                </div>

                <CandyLink
                  href={`${APP_URL}/login`}
                  className="w-full gap-2 px-5 py-2.5 text-base sm:w-auto"
                >
                  Connect repo
                  <Sparkles size={16} className="shrink-0" />
                </CandyLink>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Demo, in its own band below the photo ─────────────────────────── */}
      <section
        className={`relative pt-20 pb-14 lg:pt-28 lg:pb-20 ${SECTION_X}`}
      >
        <div className="relative mx-auto max-w-5xl">
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

        <p className="mx-auto mt-12 max-w-2xl text-center text-lg leading-relaxed font-light tracking-[-0.012em] text-slate-600">
          DaemonDoc reads your repository, writes the README, and patches only
          the sections your code actually changed.
        </p>

        {/* Language strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-slate-500">
            Reads the whole repo:
          </span>
          {TECH_LOGOS.map((tech) => (
            <div
              key={tech.id}
              title={tech.label}
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-[var(--shadow-card)]"
              style={{ background: tech.bg }}
            >
              {/* Decorative: the copy already names the capability. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.logo}
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#features"
            className="hover:text-primary flex items-center justify-center gap-1 rounded-xl px-6 py-3 font-medium text-slate-600 transition-colors"
          >
            View capabilities
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}

import React from "react";

const RepoCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-2xl bg-slate-200 sm:h-11 sm:w-11" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 max-w-[140px] animate-pulse rounded-lg bg-slate-200 sm:h-5 sm:max-w-[160px]" />
            <div className="h-3 w-full max-w-[200px] animate-pulse rounded bg-slate-100 sm:max-w-[220px]" />
          </div>
        </div>
        <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-2 w-2 rounded-full bg-slate-100" />
        <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="h-7 w-20 animate-pulse rounded-xl bg-slate-200 sm:w-24" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-28 animate-pulse rounded bg-slate-100 sm:w-36" />
        </div>
      </div>
    </div>
  </div>
);

export default RepoCardSkeleton;

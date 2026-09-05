import React from "react";

/* Mirrors LogItem's row geometry so the loading state occupies the same
   vertical space as the loaded feed. Without it the page was short enough to
   have no scrollbar, and the first render of real logs shifted the whole
   layout sideways as one appeared. */
const LogRowSkeleton = () => (
  <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
    <div className="flex min-w-0 items-start gap-3 sm:gap-5">
      <div className="mt-1 h-[42px] w-[42px] shrink-0 animate-pulse rounded-2xl bg-slate-200 sm:h-[46px] sm:w-[46px]" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-[14px] w-40 animate-pulse rounded bg-slate-200 sm:h-[15px] sm:w-52" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-100 sm:w-36" />
          <div className="hidden h-1 w-1 rounded-full bg-slate-200 sm:block" />
          <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4 self-start sm:self-center">
      <div className="h-[30px] w-[130px] animate-pulse rounded-full bg-slate-200" />
      <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

export default LogRowSkeleton;

import {
  CheckCircle2,
  RefreshCw,
  SkipForward,
  SquareMousePointer,
} from "lucide-react";
import { Card, CardDescription, CardHeading, CardIllustrations } from "./shared";

const STATUS_STYLES = {
  success: {
    label: "Success",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: <CheckCircle2 size={14} />,
  },
  ongoing: {
    label: "In Progress",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-100",
    icon: <RefreshCw size={14} className="animate-spin" />,
  },
  skipped: {
    label: "Skipped",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: <SkipForward size={14} />,
  },
};

const runs = [
  {
    action: "Full README Rewrite",
    repo: "daemondoc/server",
    time: "2m ago",
    status: "success",
  },
  {
    action: "Targeted Section Patch",
    repo: "daemondoc/seo-client",
    time: "12m ago",
    status: "success",
  },
  {
    action: "README Cleanup",
    repo: "daemondoc/client",
    time: "28m ago",
    status: "ongoing",
  },
  {
    action: "Full README Rewrite",
    repo: "daemondoc/convex-server",
    time: "1h ago",
    status: "skipped",
  },
] as const;

const ChatCard = () => {
  return (
    <Card className="h-110 w-full overflow-hidden p-4">
      <CardHeading>
        <SquareMousePointer className="size-4" />
        Watch Every Push, Live
      </CardHeading>
      <CardDescription>
        Every push streams live job status straight to your dashboard over
        Convex no polling, no refreshing, just the run as it happens.
      </CardDescription>
      <CardIllustrations>
        <div className="relative mx-auto mt-8 flex h-64 w-full max-w-md flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_88%,transparent)]">
          <div className="flex flex-col gap-2">
            {runs.map((run, index) => {
              const style = STATUS_STYLES[run.status];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-md border ${style.bg} ${style.border} ${style.color}`}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-neutral-800">
                        {run.action}
                      </p>
                      <p className="truncate font-mono text-[10px] text-neutral-400">
                        {run.repo} {run.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${style.bg} ${style.border} ${style.color}`}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <p className="text-[12px] text-neutral-500">
              Waiting for next commit
            </p>
          </div>
        </div>
      </CardIllustrations>
    </Card>
  );
};

export default ChatCard;

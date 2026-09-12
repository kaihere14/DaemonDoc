import { FileText, GitBranch, GitPullRequest, Network } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeading,
  CardIllustrations,
  LineSvg,
  PulseBorderIcon,
  StraightLine,
} from "./shared";

const IngestCard = () => {
  return (
    <Card className="h-110 w-full overflow-hidden p-4 lg:col-span-2">
      <CardHeading>
        <GitBranch className="size-4" />
        One Webhook, Smart Generation
      </CardHeading>
      <CardDescription>
        A push webhook decides the mode full rewrite, targeted section
        patch, or a background cleanup pass all run through the same
        BullMQ pipeline.
      </CardDescription>
      <CardIllustrations>
        <div className="relative mx-auto mr-50 h-full max-w-2xl sm:scale-120">
          <LineSvg className="top-25 left-50" color="#3b82f6" />
          <StraightLine className="top-39 left-50" />
          <LineSvg className="top-45 left-50 rotate-x-180" color="#a855f7" />

          <div className="absolute top-23 left-14 flex items-center gap-2 text-xs">
            <FileText size={16} />
            Full Rewrite
          </div>
          <div className="absolute top-37 left-14 flex items-center gap-2 text-xs">
            <GitPullRequest size={16} />
            Section Patch
          </div>
          <div className="absolute top-51 left-14 flex items-center gap-2 text-xs">
            <Network size={16} />
            Cleanup Worker
          </div>

          <PulseBorderIcon className="top-33 left-[72.5%]" />
        </div>
      </CardIllustrations>
    </Card>
  );
};

export default IngestCard;

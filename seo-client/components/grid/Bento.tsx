import ModelCard from "./ModelCard";
import ChatCard from "./ChatCard";
import IngestCard from "./IngestCard";

const Grid = () => {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col items-center gap-5">
        <div className="text-blue-600">Platform</div>
        <div className="text-4xl font-medium tracking-tighter">
          One webhook. Docs that write themselves.
        </div>
        <div className="max-w-2xl text-center">
          Every feature below runs off the same GitHub push webhook
          provider fallback, smart generation modes, and live job logs all
          stay in sync automatically.
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-full grid-cols-1 divide-x divide-y divide-neutral-200 border border-neutral-200 rounded-2xl mb-4 lg:grid-cols-2">
          <ModelCard />
          <ChatCard />
          <IngestCard />
        </div>
      </div>
    </div>
  );
};

export default Grid;

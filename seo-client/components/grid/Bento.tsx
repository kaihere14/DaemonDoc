import ModelCard from "./ModelCard";
import ChatCard from "./ChatCard";
import IngestCard from "./IngestCard";

const Grid = () => {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col items-center gap-5 px-4 text-center">
        <div className="text-blue-600">Platform</div>
        <div className="text-2xl font-medium tracking-tighter sm:text-3xl md:text-4xl">
          One webhook. Docs that write themselves.
        </div>
        <div className="max-w-2xl">
          Every feature below runs off the same GitHub push webhook provider
          fallback, smart generation modes, and live job logs all stay in sync
          automatically.
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 grid min-w-full grid-cols-1 gap-4 divide-neutral-200 rounded-2xl sm:gap-0 sm:divide-x sm:divide-y sm:border sm:border-neutral-200 lg:grid-cols-2">
          <ModelCard />
          <ChatCard />
          <IngestCard />
        </div>
      </div>
    </div>
  );
};

export default Grid;

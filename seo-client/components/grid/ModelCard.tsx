import { BrainIcon, FolderIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardDescription, CardHeading, CardIllustrations } from "./shared";

const ModelCard = () => {
  return (
    <Card className="h-110 w-full overflow-hidden p-4">
      <CardHeading>
        <BrainIcon className="size-4" />
        Provider Priority & Fallback
      </CardHeading>
      <CardDescription>
        Gemini runs first with automatic key rotation across multiple API
        keys. If it's rate-limited or down, Sarvam AI steps in so your
        README run never stalls.
      </CardDescription>
      <CardIllustrations>
        <div className="main-card relative mx-auto mt-16 h-70 max-w-lg">
          <div className="relative h-full rounded-t-2xl border border-neutral-200 bg-white p-2 shadow-[0_10px_80px_var(--color-neutral-300)]">
            <div className="flex gap-2 p-2">
              <div className="size-[12px] rounded-full bg-red-500"></div>
              <div className="size-[12px] rounded-full bg-yellow-500"></div>
              <div className="size-[12px] rounded-full bg-green-500"></div>
            </div>

            <div className="flex items-center gap-2 pt-10 pl-2">
              <FolderIcon className="size-4" />
              <p className="text-md text-sm text-neutral-700">
                Provider Priority
              </p>
              <div className="rounded-md bg-neutral-100 p-1 text-[12px]">
                3 keys
              </div>
            </div>

            <hr className="mt-2 text-neutral-200" />

            <div className="relative h-[calc(100%-5.75rem)] overflow-hidden">
              <div className="ai-list flex flex-col gap-2 pb-12">
                <div className="mt-4 ml-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[14px]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#4285F4"
                    >
                      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
                    </svg>
                    <p>Gemini</p>
                  </div>
                  <div className="rounded-md border border-emerald-400 bg-emerald-100/50 px-2 py-[0.5] text-[12px] text-emerald-400">
                    Available
                  </div>
                </div>
                <div className="mt-4 ml-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[14px]">
                    <Image
                      src="/sarvam.svg"
                      height={16}
                      width={16}
                      alt="Sarvam"
                    />
                    <p>Sarvam</p>
                  </div>
                  <div className="rounded-md border border-yellow-400 bg-yellow-100/50 px-2 py-[0.5] text-[12px] text-yellow-400">
                    Fallback
                  </div>
                </div>
                <div className="mt-4 ml-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[14px]">
                    <Image
                      src="/groq.svg"
                      height={16}
                      width={16}
                      alt="Groq"
                      className="rounded-[3px]"
                    />
                    <p>Groq</p>
                  </div>
                  <div className="rounded-md border border-neutral-300 bg-neutral-100 px-2 py-[0.5] text-[12px] text-neutral-500">
                    Upcoming
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
            </div>
          </div>

          <div className="floating-card absolute -top-10 -right-10 w-40 min-w-fit rounded-md border border-neutral-200 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between p-2 text-[12px]">
              <div className="flex items-center gap-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#4285F4"
                >
                  <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
                </svg>
                <p className="">Gemini</p>
              </div>
              <p className="text-md font-light text-neutral-500">Key #2</p>
            </div>

            <hr className="mt text-neutral-200" />

            <div className="p-2">
              <p className="h-fit w-fit rounded-sm border border-blue-500 px-2 text-[12px] text-blue-500">
                Active
              </p>
            </div>
          </div>
        </div>
      </CardIllustrations>
    </Card>
  );
};

export default ModelCard;

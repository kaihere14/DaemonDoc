"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/app/(landing)/_lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
}

export default function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <div className="mx-auto mt-12 grid max-w-300 grid-cols-1 items-end gap-10 sm:grid-cols-2 md:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(-1)}
          className={cn(
            "relative flex h-75 justify-end flex-col items-start rounded-lg p-10",
            activeIndex === index ? "blur-none" : "blur-xs",
            activeIndex === -1
              ? "blur-none"
              : "transition-all duration-200 ease-in",
          )}
        >
          <div className="absolute top-2 -left-2 w-[105%] border border-dashed border-neutral-200"></div>
          <div className="absolute -top-2 left-2 h-[105%] border border-dashed border-neutral-200"></div>
          <div className="absolute -top-2 right-2 h-[105%] border border-dashed border-neutral-200"></div>
          <div className="absolute bottom-2 -left-2 w-[105%] border border-dashed border-neutral-200"></div>
          <div className="absolute top-2 left-3">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              className="absolute top-2 left-2 text-neutral-200"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path>
            </svg>
          </div>

          <p className="mb-4 text-gray-600">{testimonial.quote}</p>

          <div className="flex items-center justify-center gap-3">
            <div className="relative size-13 shrink-0">
              <Image
                src={testimonial.src}
                alt={testimonial.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-md font-semibold text-shadow-2xs">
                {testimonial.name}
              </h3>
              <p className="text-sm text-gray-500">{testimonial.designation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

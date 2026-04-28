import React, { act } from "react";
import { AnimatedTestimonials } from "./ui/animated-testimonials";
import { cn } from "@/lib/utils";
import SocialProof from "./features/SocialProof";

const Testemonials = () => {
  const content = [
    {
      quote:
        "The level of technical understanding this engine displays for our complex backend architecture is unmatched. It generates documentation that perfectly captures our internal logic and API structures.",
      name: "Khushi",
      designation: "AI/ML Engineer",
      src: "/khushi.webp",
    },
    {
      quote:
        "DaemonDoc has completely transformed our development workflow. Keeping our documentation in sync with our code was always a nightmare until we integrated this engine. It's truly 'push once, sync forever'.",
      name: "Yash Bavadiya",
      designation: "Full Stack Developer",
      src: "/yash.webp",
    },
    {
      quote:
        "Finally, a documentation tool that respects enterprise security. Getting high-quality READMEs automatically while keeping our code protected is exactly what we needed for our internal developer portal.",
      name: "Gurudas Bhardwaj",
      designation: "Backend Developer",
      src: "/gurudwas.webp",
    },
    {
      quote:
        "As someone who juggles both frontend and backend, writing documentation always fell through the cracks. This tool handles it automatically and the output actually reflects how our APIs and components work together.",
      name: "Aakarsh",
      designation: "Full Stack Developer",
      src: "/aakarsh.webp",
    },
    {
      quote:
        "DaemonDoc is genuinely impressive. The UI is clean, the experience is smooth, and everything just works the way you'd expect it to. Would recommend it to any developer without hesitation.",
      name: "Shaswat Sharma",
      designation: "Software Developer",
      src: "/shaswat.webp",
    },
    {
      quote:
        "Tried DaemonDoc and it’s honestly amazing. The UI is super clean, and the login page feels unreal and majestic. Everything is well-designed and smooth. Loved it so much that I’m considering using it for all my projects.",
      name: "Raghuraj Singh Rathore",
      designation: "Front End Developer",
      src: "/raghuraj.webp",
    },
  ];
  const [activeIndex, setActiveIndex] = React.useState(-1);

  return (
    <div className="h-full w-full  px-4">
      {/* Section Heading */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2
          className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Trusted by Developers Who Ship
        </h2>
        <p className="text-lg font-light text-slate-600">
          See what engineers and developers are saying about DaemonDoc.
        </p>
      </div>

      <div className="py-5">
        <SocialProof/>
      </div>

      {/* <AnimatedTestimonials testimonials={content} autoplay={false} /> */}
      {/* Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mt-12 max-w-300 mx-auto items-end">
        {content.map((testimonial, index) => (
          <div
            key={index}
            onMouseEnter={()=>setActiveIndex(index)}
            onMouseLeave={()=>setActiveIndex(-1)}
            className={cn("flex flex-col items-start  rounded-lg  p-10 h-fit relative ",
                          activeIndex === index ? "blur-none":"blur-sm",
                          activeIndex === -1 ? "blur-none": "transition-all duration-200 ease-in",
                        )}
          >
            <div className="border border-dashed border-neutral-200 w-[105%] absolute -left-2 top-2"></div>
            <div className="border border-dashed border-neutral-200 h-[105%] absolute left-2 -top-2"></div>
            <div className="border border-dashed border-neutral-200 h-[105%] absolute right-2 -top-2"></div>
            <div className="border border-dashed border-neutral-200 w-[105%] absolute -left-2 bottom-2"></div>
            <div className="absolute top-2 left-3">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="absolute top-2 left-2 text-neutral-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path></svg>
            </div>


            <p className="text-gray-600  mb-4">{testimonial.quote}</p>
            
            <div className="flex justify-center items-center gap-3">
              <div className="img">
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  className="size-13 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-md font-semibold text-shadow-2xs">{testimonial.name}</h3>
                <p className="text-sm text-gray-500">{testimonial.designation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testemonials;

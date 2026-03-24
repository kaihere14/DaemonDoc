import React from "react";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

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
      name: "Arman Thakur",
      designation: "Backend Developer",
      src: "/arman.webp",
    },
  ];

  return (
    <div className=" px-4 h-full w-full  bg-linear-to-b from-white via-cyan-50/50 to-white">
      <AnimatedTestimonials testimonials={content}  autoplay={false}/>
    </div>
  );
};

export default Testemonials;

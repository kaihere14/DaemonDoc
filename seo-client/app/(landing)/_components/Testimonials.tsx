import SocialProof from "./SocialProof";
import TestimonialsGrid from "./TestimonialsGrid";

const TESTIMONIALS = [
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
      "Tried DaemonDoc and it's honestly amazing. The UI is super clean, and the login page feels unreal and majestic. Everything is well-designed and smooth. Loved it so much that I'm considering using it for all my projects.",
    name: "Raghuraj Singh Rathore",
    designation: "Front End Developer",
    src: "/raghuraj.webp",
  },
];

export default function Testimonials() {
  return (
    <div className="h-full w-full px-4">
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
        <SocialProof />
      </div>

      <TestimonialsGrid testimonials={TESTIMONIALS} />
    </div>
  );
}

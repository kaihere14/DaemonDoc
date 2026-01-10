import React from "react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 text-center">
      <h2 className="text-4xl font-bold mb-8">Ready to automate?</h2>
      <button
        onClick={() => navigate("/login")}
        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
      >
        Get Started for Free
      </button>
    </section>
  );
};

export default FinalCTA;

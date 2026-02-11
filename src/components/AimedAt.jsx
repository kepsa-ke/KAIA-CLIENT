import React from "react";
import { RiGovernmentFill } from "react-icons/ri";
import {
  FaIndustry,
  FaSchool,
  FaHandsHelping,
  FaIdCardAlt,
  FaBookOpen,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import BackImg from "../assets/cybersecurity.jpg";

const AimedAt = () => {
  return (
    <section className="relative w-full min-h-screen md:min-h-[75vh] flex items-center justify-center overflow-hidden">
      {/* background image */}
      <img
        src={BackImg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-[#0067b8]/90" />

      {/* content */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-12 text-white flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          Who can join
        </h2>

        <p className="text-center text-sm sm:text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
          The Alliance is open to all organizations and individuals committed to
          advancing AI skills and opportunities in Kenya.
        </p>

        {/* icons + text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
          <div className="flex items-start gap-3">
            <RiGovernmentFill className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Government agencies and regulators
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaIndustry className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Private sector companies and startups
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaSchool className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Universities, TVETs, and research institutions
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaHandsHelping className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Civil society organizations and nonprofits
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaIdCardAlt className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Development partners and donors
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaBookOpen className="text-2xl flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg leading-relaxed">
              Educators, trainers, and AI enthusiasts
            </p>
          </div>
        </div>

        {/* button */}
        <div className="mt-10">
          <Link to="/membership">
            <button className="bg-gray-100 text-[#0067b8] px-6 py-2 rounded-md font-medium hover:bg-white transition">
              Become a Member
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AimedAt;

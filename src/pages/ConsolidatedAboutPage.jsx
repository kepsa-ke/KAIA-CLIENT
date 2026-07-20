import React from "react";
import Kaisa from "../assets/kaisaL.jpg";
import Navbar from "../components/Navbar";
import AimedAt from "../components/AimedAt";
import WhyJoin from "../components/WhyJoin";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import Footer from "../components/Footer";

const ConsolidatedAboutPage = () => {
  const ourValues = [
    {
      marker: "01",
      title: "Inclusive By Design",
      desc: "AI skills for every Kenyan — across ages, regions, genders and abilities. Never gatekept by jargon.",
    },
    {
      marker: "02",
      title: "Skills That Count",
      desc: "We teach what gets people hired and what lets them build — practical, demonstrable, recognised.",
    },
    {
      marker: "03",
      title: "Responsible AI",
      desc: "We build with AI thoughtfully: ethics, safety and the public good are part of the curriculum.",
    },
    {
      marker: "04",
      title: "Stronger Together",
      desc: "Government, industry and academia achieve more aligned than apart. The alliance is the method.",
    },
  ];
  return (
    <div>
      <Navbar />

      <div className="my-[6em] md:my-[8em]" />

      <div className="max-w-6xl m-auto px-[20px] xl:px-0">
        <h2
          className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
          style={{
            lineHeight: "1.4em",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          About the alliance
        </h2>
        <h2
          className=" mb-[2em] text-[#0A0A1F] text-[30px] font-semibold"
          style={{
            lineHeight: "1.4em",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          A National Alliance For An AI-Ready Kenya
        </h2>
        <p
          className="mb-[4em] text-xl max-w-4xl"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          KAISA brings government, industry, academia and civil society under
          one mission: to train and certify one million Kenyans in artificial
          intelligence by 2027 — and to make sure no one is left behind in the
          intelligent-systems economy.
        </p>
        <div className="">
          <img
            src={Kaisa}
            alt="KAISA"
            className="max-h-[480px] w-full object-cover rounded-2xl"
          />
        </div>
      </div>

      <div className="bg-[#EAEBEF] mt-[4em] px-[20px] lg:px-[10em] xl:px-[22em] py-[3em]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-10">
          <div className="bg-[white] backdrop-blur-sm rounded-lg p-4 border border-[#D2D3DC] flex-1 flex flex-col">
            <h3
              className="text-xl font-semibold mb-2 text-[#FFC42E] mb-5"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              Mission
            </h3>
            <p className="text-lg flex-1">
              To unite government, industry, academia, development partners, and
              civil society to build AI skills, expand opportunities, and
              accelerate Kenya's transition into an AI-powered economy.
            </p>
          </div>

          <div className="bg-[white] backdrop-blur-sm rounded-lg p-4 border border-[#D2D3DC] flex-1 flex flex-col">
            <h3
              className="text-xl font-semibold mb-2 text-[#FFC42E] mb-5"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              Vision
            </h3>
            <p className="text-lg flex-1">
              A Kenya where every individual and organization can harness
              Artificial Intelligence to drive innovation, decent work, and
              inclusive economic growth.
            </p>
          </div>
        </div>
      </div>

      {/* skills that guide us */}
      <div className="max-w-6xl m-auto px-[20px] xl:px-0 py-[3em]">
        <h2
          className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase mt-[4em]"
          style={{
            lineHeight: "1.4em",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          What guides us
        </h2>
        <h2
          className=" mb-[1.4em] sm:mb-[2em] text-[#0A0A1F] text-[30px] font-semibold"
          style={{
            lineHeight: "1.4em",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Our Values
        </h2>
        <div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {ourValues.map((item, index) => (
              <div key={index}>
                <h2 className="text-[#E0A200] mb-3">{item.marker}</h2>
                <h3
                  className="my-4 font-semibold"
                  style={{
                    lineHeight: "1.4em",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {item.title}
                </h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl m-auto py-[3em] px-[20px] xl:px-0">
        <AimedAt />
      </div>

      <div className="max-w-6xl m-auto py-[3em]  px-[20px]">
        <WhyJoin />
      </div>

      {/* call to action */}
      <div
        className="max-w-6xl m-auto p-[3em] rounded-2xl text-white mb-8 flex flex-col md:flex-row gap-12 md:gap-4  items-center"
        style={{
          // background: "#1B12E8",
          background:
            "linear-gradient(80deg, rgba(27, 18, 232, 1) 0%, rgba(19, 12, 168, 1) 50%, rgba(12, 8, 102, 1) 100%)",
        }}
      >
        <div className="flex-[0.5]">
          <h2
            style={{
              lineHeight: "1.4em",
              fontFamily: "Space Grotesk, sans-serif",
            }}
            className="text-4xl mb-5"
          >
            Build The Alliance With Us
          </h2>
          <p className="text-lg">
            Employers, universities and county governments — bring your people,
            programmes and opportunities into the movement.
          </p>
        </div>
        <div className="flex-[0.5] flex justify-end">
          <Link
            to="/membership"
            className="bg-[#E0A200] p-4 rounded-2xl text-black flex gap-2 items-center"
          >
            <p>Become A Member</p>
            <FaArrowRightLong />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ConsolidatedAboutPage;

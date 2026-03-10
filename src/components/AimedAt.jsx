import React, { useState } from "react";
import { RiGovernmentFill } from "react-icons/ri";
import {
  FaIndustry,
  FaSchool,
  FaHandsHelping,
  FaIdCardAlt,
  FaBookOpen,
  FaBriefcase,
  FaCalendarAlt,
  FaBullhorn,
  FaUsers,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import BackImg from "../assets/cybersecurity.jpg";

const AimedAt = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const stakeholders = [
    {
      id: 1,
      icon: <RiGovernmentFill className="text-2xl flex-shrink-0 mt-1" />,
      title: "Government agencies and regulators",
      valueProps: [
        "Access real-time labor market data from member job ads to inform policy",
        "Showcase public sector AI initiatives to 1M+ citizens",
        "Collaborate on ethical AI governance frameworks",
      ],
    },
    {
      id: 2,
      icon: <FaIndustry className="text-2xl flex-shrink-0 mt-1" />,
      title: "Private sector companies and startups",
      valueProps: [
        "Post unlimited job ads and attract Kenya's top AI talent",
        "Promote your brand through free event and blog publicity",
        "Connect with training partners to upskill your workforce",
      ],
    },
    {
      id: 3,
      icon: <FaSchool className="text-2xl flex-shrink-0 mt-1" />,
      title: "Universities, TVETs, and research institutions",
      valueProps: [
        "Get listed as official training partners visible to the public",
        "Share research and success stories through blog features",
        "Connect students directly with employer job opportunities",
      ],
    },
    {
      id: 4,
      icon: <FaHandsHelping className="text-2xl flex-shrink-0 mt-1" />,
      title: "Civil society organizations and nonprofits",
      valueProps: [
        "Amplify community impact through free event promotion",
        "Connect with corporate partners for funding and collaboration",
        "Showcase success stories to attract donors and volunteers",
      ],
    },
    {
      id: 5,
      icon: <FaIdCardAlt className="text-2xl flex-shrink-0 mt-1" />,
      title: "Development partners and donors",
      valueProps: [
        "Monitor program impact through member activity data",
        "Identify high-potential grantees across the ecosystem",
        "Coordinate with government on aligned AI initiatives",
      ],
    },
    {
      id: 6,
      icon: <FaBookOpen className="text-2xl flex-shrink-0 mt-1" />,
      title: "Educators, trainers, and AI enthusiasts",
      valueProps: [
        "Join as training partners and get featured to job seekers",
        "Network at KAISA member events and build your community",
        "Access job board to find opportunities or post your services",
      ],
    },
  ];

  // Platform-wide benefits that apply to all members
  const platformBenefits = [
    {
      icon: <FaBriefcase />,
      text: "Post job ads & attract quality talent",
    },
    {
      icon: <FaCalendarAlt />,
      text: "Free event promotion & publicity",
    },
    {
      icon: <FaBullhorn />,
      text: "Blog features to amplify your voice",
    },
    {
      icon: <FaUsers />,
      text: "Network at exclusive member events",
    },
  ];

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

        <p className="text-center text-sm sm:text-base md:text-lg mb-6 max-w-2xl leading-relaxed">
          The Alliance is open to all organizations and individuals committed to
          advancing AI skills and opportunities in Kenya.
        </p>

        {/* platform-wide benefits badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {platformBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-sm"
            >
              <span className="text-white">{benefit.icon}</span>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* stakeholders with value propositions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {stakeholders.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer"
              // onMouseEnter={() => setExpandedCard(item.id)}
              // onMouseLeave={() => setExpandedCard(null)}
              // onClick={() =>
              //   setExpandedCard(expandedCard === item.id ? null : item.id)
              // }
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-medium leading-relaxed mb-2">
                    {item.title}
                  </p>

                  {/* value propositions - shown on hover/tap */}
                  {/* {expandedCard === item.id && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                      {item.valueProps.map((prop, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-white/90"
                        >
                          <span className="text-yellow-300 mt-1">•</span>
                          <span>{prop}</span>
                        </div>
                      ))}
                    </div>
                  )} */}

                  <div className="mt-3 space-y-2 animate-fadeIn">
                    {item.valueProps.map((prop, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-white/90"
                      >
                        <span className="text-yellow-300 mt-1">•</span>
                        <span>{prop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* job seekers callout */}
        <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-2xl w-full text-center">
          <p className="text-base sm:text-lg">
            <span className="font-semibold">Job seekers?</span> Browse
            opportunities from KAISA members and launch your AI career.
            <Link
              to="/jobs"
              className="underline font-medium hover:text-yellow-200 ml-1"
            >
              View job board →
            </Link>
          </p>
        </div>

        {/* button */}
        <div className="mt-8">
          <Link to="/membership">
            <button className="bg-gray-100 text-[#0067b8] px-8 py-3 rounded-md font-medium hover:bg-white transition transform hover:scale-105 duration-200">
              Become a Member Today
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AimedAt;

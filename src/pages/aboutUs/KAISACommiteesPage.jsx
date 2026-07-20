import React from "react";
import {
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBriefcase,
  FiShield,
  FiBookOpen,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiMenu,
  FiX,
  FiCode,
  FiLayers,
  FiCpu,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

// Committee data
const committees = [
  {
    id: "steering",
    title: "Steering Committee",
    purpose:
      "Provides strategic direction, oversight, and performance management for KAISA to deliver responsible, inclusive, and market-relevant AI readiness across Kenya.",
    responsibilities: [
      "Strategic Direction",
      "Oversight & Performance",
      "Resource Mobilisation & Partnerships",
      "Risk, Governance & Compliance",
      "Communication & Influence",
    ],
    icon: <FiTarget className="w-6 h-6" />,
  },
  {
    id: "policy",
    title: "Policy & Thought Leadership Committee",
    purpose:
      "Provides strategic guidance on national AI policy, workforce readiness, ethics, and regulatory alignment, positioning KAISA as a leading advisory voice driving responsible and inclusive AI adoption.",
    objectives: [
      "Guide KAISA's policy direction in alignment with national priorities",
      "Provide thought leadership through research and public commentary",
      "Support government and private sector alignment on responsible AI",
      "Integrate insights from partner engagements into policy recommendations",
    ],
    responsibilities: [
      "Policy Analysis & Recommendations",
      "National Dialogue & Stakeholder Engagement",
      "Thought Leadership Development",
      "Ethics, Trust & Responsible AI",
    ],
    icon: <FiTrendingUp className="w-6 h-6" />,
  },
  {
    id: "capacity",
    title: "Capacity Building & Skills Development Committee",
    purpose:
      "Designs, standardises, coordinates, and oversees AI skilling, training, and workforce development initiatives across KAISA's partners and national programs.",
    objectives: [
      "Ensure consistent, high-quality AI training aligned to employer needs",
      "Support delivery of AI Literacy Week tracks, workshops, and hackathons",
      "Drive ecosystem collaboration and reduce duplication across training providers",
    ],
    responsibilities: [
      "Training Framework & Standards",
      "Program Design & Coordination",
      "Skills Demand & Labour Insights",
      "Capacity Building for Institutions",
    ],
    icon: <FiBookOpen className="w-6 h-6" />,
  },
  {
    id: "membership",
    title: "Ecosystem Coordination Committee.",
    purpose:
      "Strengthens, grows, and supports KAISA's multi-stakeholder ecosystem by coordinating member onboarding, partnership development, engagement, and value delivery.",
    objectives: [
      "Build a vibrant, diverse membership base aligned with KAISA's mission",
      "Clarify partner value propositions and contribution pathways",
      "Ensure effective coordination and collaboration across all partners",
      "Mobilise participation for flagship activities",
    ],
    responsibilities: [
      "Membership Recruitment & Onboarding",
      "Partnership Development & Coordination",
      "Engagement & Communication",
      "Value Proposition & Sustainability",
    ],
    icon: <FiUsers className="w-6 h-6" />,
  },
];

// Brand colors from guidelines
const colors = {
  ultramarine: "#1B12E8",
  voltGold: "#FFC42E",
  dark: "#0A0A1A",
  gray: "#6B7280",
  lightBg: "#F8F9FC",
  white: "#FFFFFF",
};

// Main component
const KAISACommitteesPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] font-manrope">
      {/* Navigation Bar */}
      <Navbar />
      <div className=" my-[4em] sm:my-[8em]" />

      <div className="max-w-6xl m-auto px-[20px] xl:px-0 py-6">
        <h2
          className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
          style={{
            lineHeight: "1.4em",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          Working Committees
        </h2>
        <h2
          className=" mb-[1em] text-[#0A0A1F] text-[30px] font-semibold"
          style={{
            lineHeight: "1.4em",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Driving Kenya's AI Future
        </h2>
        <p
          className=" text-xl max-w-4xl"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          KAISA operates through four committees that collectively drive
          strategy, policy, skills development, and partnerships across Kenya's
          AI ecosystem.
        </p>
      </div>

      {/* How We Work Section */}
      {/* <section className=" px-5 xl:px-0 py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto ">
          <div className=" mb-16">
            <p
              className="text-[#1b12e8] text-[12px] mb-4 font-bold uppercase"
              style={{
                lineHeight: "1.4em",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.12em",
              }}
            >
              How We Work
            </p>
            <h2
              className=" mb-[1em] text-[#0A0A1F] text-[30px] font-semibold"
              style={{
                lineHeight: "1.4em",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              A Unified Approach to AI Readiness
            </h2>
            <p
              className="mb-[4em] text-xl max-w-4xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Each committee has a distinct mandate, working together to ensure
              responsible, inclusive, and market-relevant AI adoption across
              Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {committees.map((committee) => (
              <div
                key={committee.id}
                className="group bg-[#F8F9FC] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#1B12E8]/20"
              >
                <div className="w-14 h-14 bg-[#1B12E8]/10 rounded-2xl flex items-center justify-center text-[#1B12E8] group-hover:bg-[#1B12E8] group-hover:text-white transition-all duration-300 mb-4">
                  {committee.icon}
                </div>
                <h3
                  className="font-space-grotesk font-semibold text-lg mb-2"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {committee.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {committee.responsibilities.slice(0, 3).join(" • ")}
                </p>
              
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Committees Detail Section */}
      <section className="px-5 xl:px-0 py-16 md:py-20 bg-[#F8F9FC]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p
              className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
              style={{
                lineHeight: "1.4em",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.12em",
              }}
            >
              Our Committees
            </p>
            <h2
              className=" mb-[1em] text-[#0A0A1F] text-[30px] font-semibold"
              style={{
                lineHeight: "1.4em",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Driving Strategy, Policy, Skills & Partnerships
            </h2>
            <p className="text-gray-600 text-lg">
              Each committee plays a vital role in Kenya's AI ecosystem, working
              collaboratively to achieve our national AI readiness goals.
            </p>
          </div>

          <div className="space-y-12">
            {committees.map((committee, index) => (
              <div
                key={committee.id}
                className={`bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 ${
                  index % 2 === 1
                    ? "lg:border-l-4 lg:border-l-[#E0A200]"
                    : "lg:border-l-4 lg:border-l-[#1B12E8]"
                }`}
              >
                <div className="p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`p-3 rounded-2xl flex-shrink-0 ${
                        index % 2 === 0
                          ? "bg-[#1B12E8]/10 text-[#1B12E8]"
                          : "bg-[#E0A200]/10 text-[#E0A200]"
                      }`}
                    >
                      {committee.icon}
                    </div>
                    <div>
                      <h3 className="font-space-grotesk text-2xl font-bold">
                        {committee.title}
                      </h3>
                      <p className="text-gray-600 mt-1 text-lg">
                        {committee.purpose}
                      </p>
                    </div>
                  </div>

                  {committee.objectives && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">
                        Objectives
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {committee.objectives.map((obj, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <FiCheckCircle
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                index % 2 === 0
                                  ? "text-[#1B12E8]"
                                  : "text-[#E0A200]"
                              }`}
                            />
                            <span className="text-sm">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">
                      Key Responsibilities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {committee.responsibilities.map((resp, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                            index % 2 === 0
                              ? "bg-[#1B12E8]/5 text-[#1B12E8] border border-[#1B12E8]/10"
                              : "bg-[#E0A200]/5 text-[#E0A200] border border-[#E0A200]/10"
                          }`}
                        >
                          {resp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-20 bg-[#0A0A1A] text-white max-w-6xl m-auto  rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-[#FFC42E] mb-4"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  letterSpacing: "0.12em",
                }}
              >
                Get Involved
              </p>
              <h2
                className="font-space-grotesk text-3xl md:text-4xl font-bold mt-2 mb-4"
                style={{
                  lineHeight: "1.4em",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Join Kenya's AI Revolution
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Whether you're from government, industry, academia, or civil
                society, there's a place for you in KAISA. Together, we're
                building a future-ready AI workforce.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/membership"
                  className="bg-[#FFC42E] text-[#0A0A1A] hover:bg-[#FFC42E]/90 px-8 py-3 rounded-full font-medium transition-colors flex items-center"
                >
                  Become a Member <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/about"
                  className="border border-gray-600 hover:border-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  More On KAISA
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1B12E8]/10 rounded-2xl p-6 border border-[#1B12E8]/20">
                <div className="text-3xl font-bold text-[#FFC42E]">1M</div>
                <p className="text-sm text-gray-400">Kenyans trained by 2027</p>
              </div>
              <div className="bg-[#1B12E8]/10 rounded-2xl p-6 border border-[#1B12E8]/20">
                <div className="text-3xl font-bold text-[#FFC42E]">4</div>
                <p className="text-sm text-gray-400">Working Committees</p>
              </div>
              <div className="bg-[#1B12E8]/10 rounded-2xl p-6 border border-[#1B12E8]/20">
                <div className="text-3xl font-bold text-[#FFC42E]">50+</div>
                <p className="text-sm text-gray-400">Partner Organizations</p>
              </div>
              <div className="bg-[#1B12E8]/10 rounded-2xl p-6 border border-[#1B12E8]/20">
                <div className="text-3xl font-bold text-[#FFC42E]">2026</div>
                <p className="text-sm text-gray-400">National AI Strategy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default KAISACommitteesPage;

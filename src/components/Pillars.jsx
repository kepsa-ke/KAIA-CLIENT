import React, { useState } from "react";
import { MdMenuBook } from "react-icons/md";
import { LuBadge } from "react-icons/lu";
import { RiNumbersLine } from "react-icons/ri";
import Hands from "../assets/hands.jpeg";
import Three from "../assets/three.jpeg";
import Woman from "../assets/woman.jpeg";

const Pillars = () => {
  const [readMoreSkills, setReadMoreSkills] = useState(false);
  const [readMorePolicy, setReadMorePolicy] = useState(false);
  const [readMoreStakeholder, setReadMoreStakeholder] = useState(false);

  return (
    <div className="px-[2em]  xl:px-[5em] mt-[2em] mb-[4em]">
      <div className="">
        <h2
          className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
          style={{
            lineHeight: "1.4em",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          Pillars
        </h2>
        <h2
          className=" mb-[1em] text-[#0A0A1F] text-[30px] font-semibold"
          style={{
            lineHeight: "1.4em",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          What We Stand On
        </h2>

        {/* pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {/* Skills & Capacity Building */}
          <div className="">
            <div className="mb-10">
              {/* <MdMenuBook className="text-2xl text-[#1B12E8]" /> */}
              <img src={Three} alt="" className="rounded-lg object-cover" />
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: "0.5em",
              }}
            >
              AI Education and Skills Development
            </h3>

            <p className=" mb-2 ">
              Deliver inclusive, high quality AI training and certification at
              scale{" "}
              <span
                className="  text-[#1B12E8] cursor-pointer"
                onClick={() => setReadMoreSkills(!readMoreSkills)}
              >
                {readMoreSkills ? "Hide" : "More..."}
              </span>
            </p>
            {readMoreSkills && (
              <p className="text-md ">
                Institutionalize AI literacy and technical skills across all
                levels of education, and promote lifelong learning by
                establishing national AI skills framework to guide coordinated
                curriculum development across institutions and partners,
                standardize credentialing to ensure recognition across sectors,
                equip educators and trainers to cascade knowledge and implement
                robust track and report numbers of individuals trained and
                certified
              </p>
            )}
          </div>
          {/* credentials */}
          <div className="">
            <div className="mb-10 ">
              {/* <LuBadge className="text-2xl text-[#1B12E8]" /> */}
              <img src={Woman} alt="" className="rounded-lg object-cover" />
            </div>

            <h3
              className="text-xl font-semibold mb-2 "
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: "0.5em",
              }}
            >
              Jobs & Entrepreneurship
            </h3>
            <p className=" mb-2 ">
              Connect trained individuals to employment or support them in
              creating jobs{" "}
              <span
                className="text-[#1B12E8] cursor-pointer "
                onClick={() => setReadMorePolicy(!readMorePolicy)}
              >
                {readMorePolicy ? "Hide" : "More..."}
              </span>
            </p>
            {readMorePolicy && (
              <p className="text-md text-gray-700 text-center">
                Ensure skills standards are aligned to economic needs, build
                employer partnerships for internships, apprenticeships and
                hiring, link academia and industry to drive local AI solutions
                and adapt global tech to Kenyan context, create a national AI
                talent portal and track job placements and startup creation
                metrics
              </p>
            )}
          </div>
          {/* stakeholder collaboration */}
          <div className="">
            <div className="mb-10 ">
              {/* <RiNumbersLine className="text-2xl text-[#1B12E8]" /> */}
              <img src={Hands} alt="" className="rounded-lg object-cover" />
            </div>

            <h3
              className="text-xl font-semibold mb-2 "
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: "0.5em",
              }}
            >
              Ecosystem Coordination and Advocacy
            </h3>
            <h3 className="mb-2 ">
              Unite fragmented efforts to advocate for inclusive AI development{" "}
              <span
                className="text-[#1B12E8] cursor-pointer "
                onClick={() => setReadMoreStakeholder(!readMoreStakeholder)}
              >
                {readMoreStakeholder ? "Hide" : "More..."}
              </span>
            </h3>
            {readMoreStakeholder && (
              <p className="text-md text-gray-700">
                Convene stakeholders across government, industry, academia and
                civil society, advocate for policy alignment on credentials,
                standards and incentives for adoption, advocate for and aid
                development of required infrastructure (connectivity, labs,
                funding mechanisms, data resources) that make AI skilling
                possible on a sustained basis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pillars;

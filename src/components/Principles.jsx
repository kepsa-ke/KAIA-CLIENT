import Assess from "../assets/civil.jpg";
import { FaHandPointRight } from "react-icons/fa";

const Principles = () => {
  const principles = [
    "Inclusivity",
    "Collaboration",
    "Innovation",
    "Ethics & Trust",
    "Transparency",
  ];
  return (
    <div className="mt-[3em] px-[2em]  xl:px-[5em] ">
      <h2
        className="text-[#1b12e8] text-[22px] mb-4 font-bold uppercase"
        style={{
          lineHeight: "1.4em",
          fontFamily: "Space Grotesk, sans-serif",
          letterSpacing: "0.12em",
        }}
      >
        Our Guiding Principles
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-center ">
        {/* image side */}
        <div>
          <img
            src={Assess}
            alt=""
            className="h-[300px] object-contain rounded-md"
            loading="lazy"
          />
        </div>
        {/* text side */}
        <div>
          <ul>
            {principles.map((item, index) => (
              <li key={index} className="flex items-center gap-4 mb-4">
                <FaHandPointRight className="text-lg text-[#1b12e8]" />
                <p className="text-lg">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Principles;

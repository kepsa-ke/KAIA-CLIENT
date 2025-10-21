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
      <h2 className=" mb-8 blueHeaderText text-center">
        Our Guiding Principles
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
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
                <FaHandPointRight className="text-lg text-[#0067b8]" />
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

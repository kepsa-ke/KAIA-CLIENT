import React from "react";
import { RiAiGenerate2 } from "react-icons/ri";
import { TbAlignRight2 } from "react-icons/tb";
import { CiTextAlignCenter } from "react-icons/ci";
import { GoNorthStar } from "react-icons/go";
import { IoChatbubblesOutline } from "react-icons/io5";
import { LiaBullseyeSolid } from "react-icons/lia";
import { Link } from "react-router-dom";

const TrainingContent = () => {
  const contents = [
    {
      id: 1,
      icon: <RiAiGenerate2 size={24} className="text-[#0067b8]" />,
      title: "Generative AI and new scenarios",
      desc: "What it is, how it works, and which tools to use (Copilot, ChatGPT, Claude, Gemini). Opportunities and limitations of generative AI applied to the workplace.",
    },
    {
      id: 2,
      icon: <TbAlignRight2 size={24} className="text-[#0067b8]" />,
      title: "Ethics, safety and regulations",
      desc: "Risks, opportunities, and rules for the responsible and ethical use of AI: from the AI ​​Act to the GDPR, to ensure trust and competitiveness.",
    },
    {
      id: 3,
      icon: <CiTextAlignCenter size={24} className="text-[#0067b8]" />,
      title: "Effective prompts",
      desc: "Prompt engineering techniques for effective results: from marketing to data analysis, from documentation to decision-making.",
    },
    {
      id: 4,
      icon: <GoNorthStar size={24} className="text-[#0067b8]" />,
      title: "AI for productivity",
      desc: "Concrete applications of AI for business: marketing automation, customer service, predictive analytics, and document management.",
    },
    {
      id: 5,
      icon: <IoChatbubblesOutline size={24} className="text-[#0067b8]" />,
      title: "Intelligent agents",
      desc: "Autonomous systems that simplify complex processes, optimize workflows, and improve organizations' operational efficiency.",
    },
    // {
    //   id: 6,
    //   icon: <LiaBullseyeSolid size={24} className="text-[#0067b8]" />,
    //   title: "Other resources",
    //   desc: "To best complete your learning path, discover",
    //   link: "",
    // },
  ];
  return (
    <div>
      <div className=" bg-gray-100 px-[2em]  xl:px-[5em] py-[3em] ">
        <h2 className="text-center  mb-8 blueHeaderText ">Training Content</h2>
        <p className="text-xl text-center text-zinc-600  mb-[1em] ">
          Explore our broad selection of curated AI courses from our partners
          for individuals, organizations, SME’s and much more.
        </p>

        <div className="grid  sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10  mb-[3em] mt-[2em] ">
          {contents.map((item) => (
            <div key={item.id}>
              <div className="flex gap-4">
                <div>{item.icon}</div>
                <div>
                  <h2>{item.title}</h2>
                  <p>
                    {item.desc}{" "}
                    {item.link && (
                      <Link
                        to={`${item.link}`}
                        target="_blank"
                        className="text-[#0067b8] underline"
                      >
                        additional training content and in-depth materials.
                      </Link>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link to={`/learning`} className="flex justify-center cursor-pointer">
          <button className="bg-[#0067b8] text-white px-4 py-2 rounded-md cursor-pointer">
            Unlock your AI skills
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TrainingContent;

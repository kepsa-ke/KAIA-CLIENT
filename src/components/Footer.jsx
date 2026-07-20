import { AiOutlineMail } from "react-icons/ai";
import { MdOutlineLocalPhone } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { CiCalendar } from "react-icons/ci";
import Logo from "../assets/kai2.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="mt-8 bg-[#0A0A1F] text-white py-10 px-[2em]  xl:px-[5em] ">
      {/* top part */}
      <div className="flex flex-col md:flex-row justify-between items-center   gap-8  ">
        {/* first column */}
        <div>
          <img
            src={Logo}
            alt="Logo"
            className="h-18 mb-7 mx-auto md:mx-0 bg-white p-2 rounded-xl"
          />
          <p className="text-[#9A9AB0] sm:max-w-lg">
            The Kenya Artificial Intelligence Skilling Alliance. Training and
            certifying one million Kenyans, AI-ready by 2027.
          </p>
        </div>

        {/* second column */}
        <div>
          <h2
            className="text-[#9A9AB0] mb-6 "
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.12em",
            }}
          >
            PROGRAMME
          </h2>
          <div>
            <ul className="flex flex-col gap-4 items-center md:items-start">
              <li>
                <Link to="/learn">
                  <p className="text-white cursor-pointer">Learn</p>
                </Link>
              </li>
              <li>
                <Link to="/jobs">
                  <p className="text-white cursor-pointer">Jobs Board</p>
                </Link>
              </li>
              <li>
                <Link to="/membership">
                  <p className="text-white cursor-pointer">Our Members</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* third column */}
        <div>
          <h2
            className="text-[#9A9AB0] mb-6 "
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.12em",
            }}
          >
            INSIGHTS
          </h2>
          <div>
            <ul className="flex flex-col gap-4 items-center md:items-start">
              <li>
                <Link to="/news">
                  <p className="text-white cursor-pointer">News</p>
                </Link>
              </li>
              <li>
                <Link to="/blogs">
                  <p className="text-white cursor-pointer">Blogs</p>
                </Link>
              </li>
              <li>
                <Link to="/events">
                  <p className="text-white cursor-pointer">Events</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* FOURTH column */}
        <div>
          <h2
            className="text-[#9A9AB0] mb-6 "
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.12em",
            }}
          >
            ALLIANCE
          </h2>
          <div>
            <ul className="flex flex-col gap-4 items-center md:items-start">
              <li>
                <Link to="/about">
                  <p className="text-white cursor-pointer">About KAISA</p>
                </Link>
              </li>
              <li>
                <Link to="/membership">
                  <p className="text-white cursor-pointer">Become A Member</p>
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <p className="text-white cursor-pointer">Contact</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#2A2A3D] h-[1px] w-full my-[2em]" />

      <div className=" ">
        <p className="text-[#9A9AB0] text-[14px]">
          © 2027 KAISA . A national alliance of government, industry, academia &
          civil society.
        </p>
      </div>
    </div>
  );
};

export default Footer;

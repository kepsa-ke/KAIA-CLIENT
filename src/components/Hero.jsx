import Bg1 from "../assets/bg3.mp4";
import Mic from "../assets/microsoft.png";
import Kepsa from "../assets/newKepsa.png";
import ILO from "../assets/ilo.png";
import Gov from "../assets/gov1.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative w-full">
      <div className="relative w-full h-[85vh] overflow-hidden">
        {/* Background Video */}
        <video
          src={Bg1}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        {/* Dark Overlay*/}
        <div className="absolute inset-0 bg-black/80 z-[1]" />

        {/* Hero Text - on top of overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-2 sm:px-5 text-white gap-5 pt-16">
          <div>
            <h2
              className="text-center text-3xl sm:text-5xl font-bold"
              style={{
                lineHeight: "1.7em",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Kenya AI Skilling Alliance
            </h2>
            {/* <p
              className="text-base sm:text-xl text-center max-w-4xl mt-5"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Position Kenya as the global hub for AI talent by training and
              certifying 1M people on AI.
            </p> */}
            <p
              className="text-base sm:text-xl text-center max-w-4xl mt-5"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Position Kenya as Africa's leading AI talent hub by training and
              certifying one million people with AI skills by 2027.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <div className="flex justify-center gap-5 mt-4">
              <Link to="/membership">
                <p
                  className="bg-[#1B12E8] text-white px-3 lg:px-5 py-2 rounded-md text-base text-center cursor-pointer  transition-colors"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Join the Alliance.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-zinc-800 text-white px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-base sm:text-lg font-semibold mb-6"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            In partnership with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10">
            <Link to="https://gok.kenya.go.ke/" target="_blank">
              <img
                src={Gov}
                alt="Government"
                className="h-14 sm:h-20 w-auto object-contain"
              />
            </Link>
            <Link to="https://www.microsoft.com/en-us" target="_blank">
              <img
                src={Mic}
                alt="Microsoft"
                className="h-14 sm:h-20 w-auto object-contain"
              />
            </Link>
            <Link to="https://www.kepsa.or.ke/" target="_blank">
              <img
                src={Kepsa}
                alt="KEPSA"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </Link>
            <Link to="https://www.ilo.org/" target="_blank">
              <img
                src={ILO}
                alt="ILO"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

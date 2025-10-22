import Bg1 from "../assets/bg3.mp4";
import Mic from "../assets/microsoft.png";
import Kepsa from "../assets/KEPSA.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="">
      <div className="">
        <div className="relative w-full h-[97vh] overflow-hidden">
          {/* background video */}
          <video
            src={Bg1}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          />

          {/* dark overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/80" />

          {/* content overlay but we want a black background just like Italin Page */}
          <div className="absolute w-full h-full top-0 flex flex-col justify-center items-center px-2 sm:px-5 text-white gap-5">
            <div>
              <h2
                className="text-center text-3xl sm:text-5xl font-bold"
                style={{ lineHeight: "1.7em" }}
              >
                Kenya AI Skilling Alliance
              </h2>
              <p className=" sm:text-xl  text-center max-w-4xl mt-5">
                Position Kenya as the global hub for AI talent by training and
                certifying 1M people on AI.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <div className="flex justify-center gap-5 mt-4 z-10">
                <Link to="/membership">
                  <p className="bg-[#0067b8] text-white px-3 lg:px-5 py-2 rounded-md text-md text-center cursor-pointer">
                    Join the Alliance.
                  </p>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute w-full h-full bottom-0 flex flex-col justify-end items-center text-white gap-5">
            <div className="bg-zinc-800 text-white w-full px-4 sm:px-8 py-3 mt-7">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                {/* spearheaded by */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-b border-zinc-600 pb-4">
                  <p className="text-base sm:text-lg font-semibold">
                    Spearheaded by
                  </p>
                  <img
                    src={Kepsa}
                    alt="KEPSA"
                    className="h-10 sm:h-14 w-auto object-contain"
                  />
                </div>

                {/* initiative by */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <p className="text-base sm:text-lg font-semibold">
                    In partnership with
                  </p>
                  <img
                    src={Mic}
                    alt="Microsoft"
                    className="h-10 sm:h-14 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

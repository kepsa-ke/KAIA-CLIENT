import BackImg from "../assets/ethics.jpg";
import { Link } from "react-router-dom";

const ReqInfo = () => {
  return (
    <div className="mt-[1em]">
      <div className="relative w-full h-[43vh] overflow-hidden">
        <img
          src={BackImg}
          alt="BackImage"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        {/* color overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#0067b8]/90" />

        {/* content overlay */}
        <div className="absolute w-full h-full top-0 px-[2em] xl:px-[5em] flex flex-col justify-center">
          <div>
            <h2 className=" whiteHeaderText mb-[16px] text-white text-center">
              Want to know more ?
            </h2>
            <p className="text-center text-white text-md mb-[1.4em]">
              Request more information
            </p>
            <div className="flex justify-center">
              <Link
                to="/contact"
                className="bg-white p-2 rounded-lg hover:text-blue-800"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReqInfo;

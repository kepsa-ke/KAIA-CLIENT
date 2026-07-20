const Mission = () => {
  return (
    <div className="px-[2em]  xl:px-[5em] my-[5em] flex flex-col sm:flex-row gap-10 sm:gap-20 items-center justify-center">
      {/* left side */}
      <div className="w-full sm:w-1/2">
        <h2
          className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
          style={{
            lineHeight: "1.4em",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          Our Mission
        </h2>
        <p
          className="text-[44px] text-[#0A0A1F] font-bold "
          style={{ lineHeight: "1.4em" }}
        >
          We Believe Every Kenyan Can Build With AI
        </p>
      </div>
      {/* right side */}
      <div className="w-full sm:w-1/2">
        <p
          className=" text-xl text-[#2A2A3D] "
          style={{
            lineHeight: "1.4em",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          To unite government, industry, academia, development partners, and
          civil society to build AI skills, expand opportunities, and accelerate
          Kenya's transition into an AI-powered economy.
        </p>
      </div>
    </div>
  );
};

export default Mission;

const WhyJoin = () => {
  return (
    <div className="mt-[3em]">
      {/*  */}

      <h2
        className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
        style={{
          lineHeight: "1.4em",
          fontFamily: "IBM Plex Mono, monospace",
          letterSpacing: "0.12em",
        }}
      >
        Why Join the Alliance
      </h2>

      <p
        className=" mb-[2em] text-[#0A0A1F] text-[20px] font-semibold md:max-w-2xl"
        style={{
          lineHeight: "1.4em",
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        The Kenya AI Skilling Alliance offers unique value to every stakeholder
        across the ecosystem. Discover how you can collaborate and contribute to
        the mission.
      </p>

      <div className="grid md:grid-cols-3 gap-8 text-center md:text-start   mb-[3em] mt-[4em]">
        <div>
          <h2
            className="mb-4 font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Free courses on Artificial Intelligence
          </h2>
          <p>
            Dedicated courses to support people in their digital transformation.
          </p>
        </div>
        <div>
          <h2
            className="mb-4 font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Quality content
          </h2>
          <p>
            Training materials developed with qualified and recognized partners.
          </p>
        </div>
        <div>
          <h2
            className="mb-4 font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            A national network for collaboration
          </h2>
          <p>Engage in championing AI Skilling Initiatives through advocacy</p>
        </div>
      </div>
    </div>
  );
};

export default WhyJoin;

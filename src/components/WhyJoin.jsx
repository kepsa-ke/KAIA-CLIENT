const WhyJoin = () => {
  return (
    <div className="mt-[3em]">
      {/*  */}
      <h2 className=" mb-4 blueHeaderText text-center">
        Why Join the Alliance
      </h2>
      <p className="text-xl  text-center mb-[1em]">
        The Kenya AI Skilling Alliance offers unique value to every stakeholder
        across the ecosystem. Discover how you can collaborate and contribute to
        the mission.
      </p>

      <div className="grid md:grid-cols-3 gap-8 text-center md:text-start  w-[100%] md:w-[80%] lg:w-[70%] mx-auto mb-[3em] mt-[4em]">
        <div>
          <h2 className="mb-4 font-semibold">
            Free courses on Artificial Intelligence
          </h2>
          <p>
            Dedicated courses to support people in their digital transformation.
          </p>
        </div>
        <div>
          <h2 className="mb-4 font-semibold">Quality content with Microsoft</h2>
          <p>
            Training materials developed with qualified and recognized partners.
          </p>
        </div>
        <div>
          <h2 className="mb-4 font-semibold">
            A national network for digitalization
          </h2>
          <p>
            Institutions, associations, and businesses collaborate to strengthen
            the country's skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyJoin;

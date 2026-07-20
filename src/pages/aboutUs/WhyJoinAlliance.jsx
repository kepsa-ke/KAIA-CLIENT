import React from "react";
import WhyJoin from "../../components/WhyJoin";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const WhyJoinAlliance = () => {
  return (
    <div>
      <Navbar />
      <div className=" my-[6em] md:my-[8em]" />
      <div className="px-[10px] md:px-[3em]">
        <WhyJoin />
      </div>
      <div className="my-[8em]" />
      <Footer />
    </div>
  );
};

export default WhyJoinAlliance;

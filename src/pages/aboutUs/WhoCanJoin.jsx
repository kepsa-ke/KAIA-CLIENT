import React from "react";
import AimedAt from "../../components/AimedAt";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const WhoCanJoin = () => {
  return (
    <div>
      <div>
        <Navbar />
        <div className="my-[6em] md:my-[8em]" />
        <div className="px-[10px] md:px-[3em]">
          <AimedAt />
        </div>
        <div className="my-[8em]" />
        <Footer />
      </div>
    </div>
  );
};

export default WhoCanJoin;

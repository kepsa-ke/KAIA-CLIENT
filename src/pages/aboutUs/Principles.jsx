import React from "react";
import Principles from "../../components/Principles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AboutPrinciples = () => {
  return (
    <div>
      <div>
        <Navbar />
        <div className="my-[6em] md:my-[8em]" />
        <div className="px-[10px] md:px-[3em]">
          <Principles />
        </div>
        <div className="my-[8em]" />
        <Footer />
      </div>
    </div>
  );
};

export default AboutPrinciples;

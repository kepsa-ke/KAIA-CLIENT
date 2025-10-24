import React from "react";
import Footer from "../components/Footer";
import LearnFeed from "../components/LearnFeed";
import Navbar from "../components/Navbar";

const Learning = () => {
  return (
    <div>
      <Navbar />
      <div className="px-[2em]  xl:px-[5em] mt-[6.4em] mb-5">
        <div className="mt-[3em]">
          <h1 className="text-4xl font-bold mb-4">Learn</h1>
          <p className="text-gray-600 mb-8">
            Find skills that enhance your work at any level and in any
            organisation.
          </p>
        </div>

        <LearnFeed />
      </div>
      <Footer />
    </div>
  );
};

export default Learning;

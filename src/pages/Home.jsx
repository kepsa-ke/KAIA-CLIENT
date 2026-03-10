import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Mission from "../components/Mission";
import Pillars from "../components/Pillars";
import ReqInfo from "../components/ReqInfo";
import WhyJoin from "../components/WhyJoin";
import AimedAt from "../components/AimedAt";
import TrainingContent from "../components/TrainingContent";
import Members from "../components/Members";
import TechnicalPartners from "../components/TechnicalPartners";
import Footer from "../components/Footer";
import Principles from "../components/Principles";
import ImpactOverview from "../components/ImpactOverview";
import NewsCarousel from "../components/NewsCarousel";
import EventsCarousel from "../components/EventsCarousel";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Mission />
      <div className="my-[3em]" />
      <Pillars />
      <NewsCarousel />
      <ImpactOverview />
      <EventsCarousel />
      <ReqInfo />
      <WhyJoin />
      <AimedAt />
      <Principles />
      <TrainingContent />
      <Members />
      <TechnicalPartners />
      <Footer />
    </div>
  );
};

export default Home;

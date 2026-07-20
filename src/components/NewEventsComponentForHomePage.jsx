import React from "react";
import UpcomingEvents from "./UpcomingEvents";
import EventsCarousel from "./EventsCarousel";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

const NewEventsComponentForHomePage = () => {
  return (
    <div className="px-[2em]  xl:px-[5em]">
      {/* top section */}
      <div className=" flex flex-col sm:flex-row gap-10 sm:gap-20 justify-between items-center mb-[3em] ">
        <div>
          <h2
            className="text-[#1b12e8] text-[16px] mb-4 font-bold uppercase"
            style={{
              lineHeight: "1.4em",
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.12em",
            }}
          >
            WHAT'S ON
          </h2>
          <h3
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
            className="text-[30px] text-[#0A0A1F] font-semibold mb-2"
          >
            Upcoming & Recent Events
          </h3>
          <p className="text-[#2A2A3D] mb-6">
            Workshops, bootcamps, webinar and more across the country
          </p>
        </div>
        <div>
          <Link to="/events">
            <p className="text-[#1b12e8] font-medium flex items-center gap-2">
              All Events
              <FaArrowRightLong />
            </p>
          </Link>
        </div>
      </div>
      {/* upcoming events */}
      <div>
        <h2
          className="text-[#0A0A1F] text-[14px] mb-4 font-bold uppercase"
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          UPCOMING
        </h2>
        <UpcomingEvents />
      </div>
      {/* recent events */}
      <div className="my-[2em]" />
      <div>
        <h2
          h2
          className="text-[#0A0A1F] text-[14px] mb-4 font-bold uppercase"
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
          }}
        >
          RECENT
        </h2>
        <EventsCarousel />
      </div>
    </div>
  );
};

export default NewEventsComponentForHomePage;

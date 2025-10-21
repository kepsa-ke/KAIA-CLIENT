import Mic from "../assets/microsoft.png";
import KEPSA from "../assets/KEPSA.png";
import ilo from "../assets/ilo.png";
import undp from "../assets/undp.jpg";
import axios from "../axios";

import { useEffect, useRef, useState } from "react";

const TechnicalPartners = () => {
  // ---------------- FETCH PARTNERS ----------------
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleFetchPartners = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/partners");
      setPartners(data);
    } catch (error) {
      console.log("Error fetching partners", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPartners();
  }, []);

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      const container = scrollRef.current;
      const nextIndex = (activeIndex + 1) % partners.length;
      const cardWidth = container.scrollWidth / partners.length;

      container.scrollTo({
        left: cardWidth * nextIndex,
        behavior: "smooth",
      });

      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, partners.length]);

  return (
    <div>
      <div className="mt-[5em] px-[2em]  xl:px-[5em]">
        <div>
          <h2 className=" text-center  mb-10 blueHeaderText ">
            Technical Partners
          </h2>

          {/* scrollable container */}
          <div
            ref={scrollRef}
            className="flex justify-center gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-hide"
          >
            {partners.map((partner, index) => (
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
              >
                <div className="flex-shrink-0 snap-center w-32 h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalPartners;

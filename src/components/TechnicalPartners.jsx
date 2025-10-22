import axios from "../axios";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TechnicalPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef(null);
  const intervalRef = useRef(null);
  const userInteractedRef = useRef(false);

  // ---------------- FETCH PARTNERS ----------------
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

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    if (partners.length === 0 || !scrollRef.current) return;

    const container = scrollRef.current;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (userInteractedRef.current) return; // pause if user interacted

        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % partners.length;
          const cardWidth = container.scrollWidth / partners.length;
          container.scrollTo({
            left: cardWidth * nextIndex,
            behavior: "smooth",
          });
          return nextIndex;
        });
      }, 5000);
    };

    startAutoScroll();
    return () => clearInterval(intervalRef.current);
  }, [partners]);

  // ---------------- USER INTERACTION ----------------
  const handleUserInteraction = () => {
    userInteractedRef.current = true;
    clearInterval(intervalRef.current);

    // Resume auto-scroll after 10 seconds of inactivity
    setTimeout(() => {
      userInteractedRef.current = false;
    }, 10000);
  };

  // ---------------- SCROLL CONTROL ----------------
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const atStart = container.scrollLeft <= 0;
    const atEnd =
      Math.ceil(container.scrollLeft + container.clientWidth) >=
      container.scrollWidth;

    setShowPrev(!atStart);
    setShowNext(!atEnd);
  };

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth =
      container.querySelector(".partner-card")?.offsetWidth || 150;

    container.scrollBy({
      left: direction === "next" ? cardWidth + 24 : -(cardWidth + 24),
      behavior: "smooth",
    });

    handleUserInteraction();
  };

  // ---------------- HANDLE OVERFLOW ----------------
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;

    const checkOverflow = () => {
      if (container.scrollWidth > container.clientWidth) {
        setShowNext(true);
      } else {
        setShowNext(false);
        setShowPrev(false);
      }
    };

    checkOverflow();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkOverflow);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [partners]);

  return (
    <div className="mt-[5em] px-[2em] xl:px-[5em] relative">
      <h2 className="text-center mb-10 blueHeaderText">Technical Partners</h2>

      {loading ? (
        <div className="flex justify-center items-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="relative">
          {/* Scrollable container */}
          <div
            ref={scrollRef}
            onTouchStart={handleUserInteraction}
            onWheel={handleUserInteraction}
            className="flex justify-start gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-hide"
          >
            {partners.map((partner, index) => (
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="flex-shrink-0 snap-center partner-card"
              >
                <div className="w-32 h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </a>
            ))}
          </div>

          {/* Navigation Arrows */}
          {showPrev && (
            <button
              onClick={() => scrollByAmount("prev")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-600 text-white p-3 rounded-full shadow-md hover:bg-gray-800 transition-all"
            >
              <FaChevronLeft />
            </button>
          )}
          {showNext && (
            <button
              onClick={() => scrollByAmount("next")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-600 text-white p-3 rounded-full shadow-md hover:bg-gray-800 transition-all"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicalPartners;

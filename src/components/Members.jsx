import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "../axios";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const scrollRef = useRef(null);
  const intervalRef = useRef(null);
  const userInteractedRef = useRef(false);

  // Fetch members
  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/members/approved");
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMembers();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (members.length === 0 || !scrollRef.current) return;

    const container = scrollRef.current;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (userInteractedRef.current) return; // pause if user interacted

        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % members.length;
          const cardWidth = container.scrollWidth / members.length;
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
  }, [members]);

  // Handle user scroll or touch
  const handleUserInteraction = () => {
    userInteractedRef.current = true;
    clearInterval(intervalRef.current);

    // Resume auto-scroll after 10s of inactivity
    setTimeout(() => {
      userInteractedRef.current = false;
    }, 10000);
  };

  // Check scroll boundaries
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

  // Scroll left or right by one card width
  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth =
      container.querySelector(".member-card")?.offsetWidth || 200;

    container.scrollBy({
      left: direction === "next" ? cardWidth + 24 : -(cardWidth + 24),
      behavior: "smooth",
    });

    handleUserInteraction();
  };

  // Observe overflow (for showing arrows)
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
  }, [members]);

  return (
    <div className="mt-[3em] px-[2em] xl:px-[5em] relative">
      <h2 className="text-center mb-8 blueHeaderText">
        Who has joined the Alliance
      </h2>

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
            className="flex justify-start gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-hide"
          >
            {members.map((member, index) => (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="flex-shrink-0 snap-center member-card"
              >
                <div className="w-60 h-40 bg-[#0067b8] text-white rounded-lg shadow-md flex items-center justify-center text-center font-bold p-4">
                  {member.organizationName}
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

export default Members;

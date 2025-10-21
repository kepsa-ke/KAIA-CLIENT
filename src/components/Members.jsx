import { useEffect, useRef, useState } from "react";
import axios from "../axios";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch members
  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/members/approved");
      setMembers(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMembers();
  }, []);

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      const container = scrollRef.current;
      const nextIndex = (activeIndex + 1) % members.length;
      const cardWidth = container.scrollWidth / members.length;

      container.scrollTo({
        left: cardWidth * nextIndex,
        behavior: "smooth",
      });

      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, members.length]);

  // scroll manually when clicking dots
  const handleDotClick = (index) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.scrollWidth / members.length;

    container.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  return (
    <div className="mt-[3em] px-[2em]  xl:px-[5em]">
      <div>
        <h2 className=" text-center  mb-8 blueHeaderText ">
          Who has joined the Alliance
        </h2>

        {loading ? (
          <div className="flex justify-center items-center">
            <p>Loading ...</p>
          </div>
        ) : (
          <>
            {/* scrollable container */}
            <div
              ref={scrollRef}
              className="flex justify-center gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-hide"
            >
              {members.map((member, index) => (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  <div className="flex-shrink-0 snap-center w-60 h-40 bg-[#0067b8] text-white rounded-lg shadow-md flex items-center justify-center text-center font-bold p-4">
                    {member.organizationName}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* dots navigation */}
        {/* <div className="flex justify-center mt-4 gap-2">
          {members.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                activeIndex === index ? "bg-[#0067b8]" : "bg-gray-400"
              }`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Members;

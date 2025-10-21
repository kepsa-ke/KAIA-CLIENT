import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

import Photo from "../assets/photo1.png";
import Photo2 from "../assets/photo2.png";
import Mic from "../assets/microsoft.png";
import Undp from "../assets/undp.jpg";
import kepsa from "../assets/KEPSA.png";
import axios from "../axios";
import { toast } from "react-toastify";
import { CourseCategories } from "../data";

import { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const LearnFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState("Everyone");
  const [searchText, setSearchText] = useState("");
  const [coursesFeed, setCoursesFeed] = useState([]);

  const [loading, setLoading] = useState(false);
  // Fetch courses
  const handleFetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/courses/approved");
      setCoursesFeed(data);
    } catch {
      toast.error("Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchCourses();
  }, []);

  // Filter courses by search and category
  const filteredCourses = coursesFeed.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.tag.toLowerCase().includes(searchText.toLowerCase()) ||
      course.desc.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === "Everyone" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md w-full md:w-1/3 mb-6">
        <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
        <input
          type="text"
          placeholder="Search course..."
          className="bg-transparent outline-none w-full"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Categories */}
      {/* <div className="flex flex-wrap gap-8 mb-8">
        {CourseCategories?.map((item) => (
          <span
            key={item}
            className={`cursor-pointer transition-all ${
              selectedCategory === item
                ? "text-[#0067b8] font-bold border-b-4 border-[#0067b8] pb-1"
                : "text-gray-600 hover:text-[#0067b8]"
            }`}
            onClick={() => setSelectedCategory(item)}
          >
            {item}
          </span>
        ))}
      </div> */}
      {/* Left Arrow */}
      {/* <button
        onClick={() => scroll("left")}
        className="absolute left-0 bg-white shadow-md rounded-full p-2 z-10 hidden sm:block"
      >
        <FaArrowLeft className="w-5 h-5 text-gray-600" />
      </button> */}

      {/* Scrollable Categories */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide px-10 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {CourseCategories?.map((item) => (
          <span
            key={item}
            className={`cursor-pointer whitespace-nowrap transition-all ${
              selectedCategory === item
                ? "text-[#0067b8] font-bold border-b-4 border-[#0067b8] pb-1"
                : "text-gray-600 hover:text-[#0067b8]"
            }`}
            onClick={() => setSelectedCategory(item)}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Right Arrow */}
      {/* <button
        onClick={() => scroll("right")}
        className="absolute right-0 bg-white shadow-md rounded-full p-2 z-10 hidden sm:block"
      >
        <FaArrowRight className="w-5 h-5 text-gray-600" />
      </button> */}

      {/* Feed */}
      {filteredCourses.length === 0 ? (
        <p className="text-gray-600 text-center mt-8 text-lg">
          No course found.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          style={{ marginTop: "2em" }}
        >
          {filteredCourses.map((course, index) => (
            <div
              key={index}
              className="hover:shadow-lg p-2 rounded-xl transition"
            >
              <a href={course.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={course.image}
                  alt={course.title}
                  height={300}
                  width={400}
                  className="rounded-xl"
                />
                <div className="mt-4">
                  <p className="text-[#0067b8] text-sm font-bold mb-3">
                    {course.tag}
                  </p>
                  <h2 className="font-bold mb-3">{course.title}</h2>
                  <p className="text-gray-600 text-sm">
                    {course.desc.length > 100
                      ? course.desc.substring(0, 100) + "..."
                      : course.desc}
                  </p>
                  <div className="mt-4">
                    {course.organization === "kepsa" ? (
                      <img
                        src={kepsa}
                        alt={course.organization}
                        height={20}
                        width={30}
                        className="rounded-md"
                      />
                    ) : course.organization === "undp" ? (
                      <img
                        src={Undp}
                        alt={course.organization}
                        height={20}
                        width={30}
                        className="rounded-md"
                      />
                    ) : course.organization === "microsoft" ? (
                      <img
                        src={Mic}
                        alt={course.organization}
                        height={20}
                        width={30}
                        className="rounded-md"
                      />
                    ) : null}
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearnFeed;

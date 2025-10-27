import { useEffect, useState, useRef } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowUp,
  AiOutlineSearch,
} from "react-icons/ai";
import axios from "../axios";
import { toast } from "react-toastify";
import { CourseCategories } from "../data";

import Mic from "../assets/microsoft.png";
import Undp from "../assets/undp.jpg";
import kepsa from "../assets/KEPSA.png";
import { Link } from "react-router-dom";

const LearnFeed = () => {
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Everyone");
  const [activeSection, setActiveSection] = useState("featured");

  const featuredRef = useRef(null);
  const topicRef = useRef(null);
  const roleRef = useRef(null);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/courses/approved");
      setCourses(data);
    } catch {
      toast.error("Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Scroll to top arrow visibility
  useEffect(() => {
    const handleScroll = () => setShowArrow(window.pageYOffset > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Smooth scroll to section
  const scrollToSection = (ref, section) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(section);
    }
  };

  // Track section currently in view
  useEffect(() => {
    const sections = [
      { id: "featured", ref: featuredRef },
      { id: "topic", ref: topicRef },
      { id: "role", ref: roleRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((sec) => {
      if (sec.ref.current) {
        sec.ref.current.id = sec.id;
        observer.observe(sec.ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const text = searchText.toLowerCase();
    return (
      course.title.toLowerCase().includes(text) ||
      course.tag.toLowerCase().includes(text) ||
      course.desc.toLowerCase().includes(text)
    );
  });

  // Segment courses
  const featuredCourse = filteredCourses.find((c) => c.featured);
  const topicCourses = filteredCourses.filter(
    (c) => c.segment === "topic" && !c.featured
  );
  const roleCourses = filteredCourses.filter(
    (c) => c.segment === "role" && !c.featured
  );

  const getLogo = (org) => {
    if (org.toLowerCase() === "kepsa") return kepsa;
    if (org.toLowerCase() === "undp") return Undp;
    if (org.toLowerCase() === "microsoft") return Mic;
    return null;
  };

  const roleCoursesByCategory = roleCourses.filter(
    (c) => c.category === selectedCategory
  );

  return (
    <div className="relative">
      {/* Scroll to top arrow */}
      {showArrow && (
        <div
          className="fixed bottom-20 right-4 text-3xl z-[999] cursor-pointer bg-[#0067b8] text-white rounded-full p-[5px]"
          onClick={handleScrollTop}
        >
          <AiOutlineArrowUp />
        </div>
      )}

      <Link
        to="/"
        className="flex items-center gap-2 px-[2em]  xl:px-[5em] mb-[2em] underline"
      >
        <AiOutlineArrowLeft />
        <p className="text-sm">Home</p>
      </Link>

      {/* Welcome message */}
      <div className="mb-4 px-[2em]  xl:px-[5em]">
        <h2 className="text-2xl font-bold text-[#0067b8] mb-2">
          Start your journey and discover the world of AI with us.
        </h2>
        <p className="text-gray-600">
          Unlock new opportunities with AI skills that are in demand now and in
          the future.
        </p>
      </div>

      {/* Sticky Navbar */}

      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 py-3 shadow-sm flex justify-start space-x-8 px-[2em]  xl:px-[5em]">
        {[
          { label: "Featured", ref: featuredRef, id: "featured" },
          { label: "Learn by Topic", ref: topicRef, id: "topic" },
          { label: "Learn by Role", ref: roleRef, id: "role" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.ref, item.id)}
            className={`relative font-medium transition pb-1 ${
              activeSection === item.id
                ? "text-[#0067b8] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-[#0067b8]"
                : "text-gray-600 hover:text-[#0067b8]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-[2em]  xl:px-[5em]">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md w-full md:w-1/3 mt-6 mb-8 ">
          <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search course..."
            className="bg-transparent outline-none w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="mt-[5em] flex justify-center px-[2em]  xl:px-[5em]">
          <p className="text-[#0067b8] font-semibold text-xl">
            Loading Courses...
          </p>
        </div>
      ) : (
        <>
          {/* If searching, show only search results */}
          {searchText.trim() ? (
            <section className="mb-12 px-[2em]  xl:px-[5em]">
              <h2 className="text-2xl font-bold mb-6 text-[#0067b8]">
                Search Results
              </h2>

              {filteredCourses.length === 0 ? (
                <p className="text-gray-600">No matching courses found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredCourses.map((course, index) => (
                    <a
                      key={index}
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:shadow-lg p-2 rounded-xl transition block"
                    >
                      <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="text-[#0067b8] text-sm font-bold mb-2">
                          {course.tag}
                        </p>
                        <h2 className="font-bold mb-2">{course.title}</h2>
                        <p className="text-gray-600 text-sm">
                          {course.desc.length > 100
                            ? course.desc.substring(0, 100) + "..."
                            : course.desc}
                        </p>
                        {/* {getLogo(course.organization) && (
                          <img
                            src={getLogo(course.organization)}
                            alt={course.organization}
                            className="mt-3 h-6 w-auto rounded-md"
                          />
                        )} */}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Featured Section */}
              {featuredCourse && (
                <div ref={featuredRef} className="mb-12 scroll-mt-24 ">
                  {/* <h2 className="text-2xl font-bold mb-4 text-[#0067b8]">
                    Featured Course
                  </h2> */}
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-[#0067b8] text-white py-[2.4em] px-[2em]  xl:px-[5em]">
                    <img
                      src={featuredCourse.image}
                      alt={featuredCourse.title}
                      className="w-full md:w-1/2 h-72 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-8">
                        {featuredCourse.title}
                      </h3>

                      <p className="text-white mb-8">{featuredCourse.desc}</p>
                      <a
                        href={featuredCourse.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0067b8] bg-white p-4 font-semibold rounded-lg"
                      >
                        Go to Course →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Learn by Topic */}
              <section
                ref={topicRef}
                className="mb-12 scroll-mt-24 px-[2em]  xl:px-[5em] "
              >
                <h2 className="text-2xl font-bold mb-6 text-[#0067b8]">
                  Learn by Topic
                </h2>
                <p className="text-sm mb-6">
                  Develop skills for the technology and AI that enhance
                  productivity and creativity for everyone.
                </p>
                {topicCourses.length === 0 ? (
                  <p className="text-gray-600">No topic-based courses yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {topicCourses.map((course, index) => (
                      <a
                        key={index}
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:shadow-lg p-2 rounded-xl transition block"
                      >
                        <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-[#0067b8] text-sm font-bold mb-2">
                            {course.tag}
                          </p>
                          <h2 className="font-bold mb-2">{course.title}</h2>
                          <p className="text-gray-600 text-sm">
                            {course.desc.length > 100
                              ? course.desc.substring(0, 100) + "..."
                              : course.desc}
                          </p>
                          {/* {getLogo(course.organization) && (
                            <img
                              src={getLogo(course.organization)}
                              alt={course.organization}
                              className="mt-3 h-6 w-auto rounded-md"
                            />
                          )} */}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              {/* Learn by Role */}
              <section
                ref={roleRef}
                className="scroll-mt-24 px-[2em]  xl:px-[5em]"
              >
                <h2 className="text-2xl font-bold mb-6 text-[#0067b8]">
                  Learn by Role
                </h2>

                <p className="text-sm mb-6">
                  Find skills that enhance your work at any level and in any
                  organisation.
                </p>

                {/* Role Filter */}
                <div className="flex overflow-x-auto space-x-6 pb-3 no-scrollbar mb-8">
                  {CourseCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`pb-2 font-medium whitespace-nowrap ${
                        selectedCategory === cat
                          ? "text-[#0067b8] border-b-2 border-[#0067b8]"
                          : "text-gray-600 hover:text-[#0067b8]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {roleCoursesByCategory.length === 0 ? (
                  <p className="text-gray-600">
                    No courses available under this role yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {roleCoursesByCategory.map((course, index) => (
                      <a
                        key={index}
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:shadow-lg p-2 rounded-xl transition block"
                      >
                        <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-[#0067b8] text-sm font-bold mb-2">
                            {course.tag}
                          </p>
                          <h2 className="font-bold mb-2">{course.title}</h2>
                          <p className="text-gray-600 text-sm">
                            {course.desc.length > 100
                              ? course.desc.substring(0, 100) + "..."
                              : course.desc}
                          </p>
                          {/* {getLogo(course.organization) && (
                            <img
                              src={getLogo(course.organization)}
                              alt={course.organization}
                              className="mt-3 h-6 w-auto rounded-md"
                            />
                          )} */}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LearnFeed;

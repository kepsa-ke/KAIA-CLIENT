import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import moment from "moment";
import {
  AiOutlineSearch,
  AiOutlineShareAlt,
  AiOutlineClose,
  AiOutlineLink,
  AiOutlineEye,
} from "react-icons/ai";
import {
  IoFilterOutline,
  IoBookOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import {
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaEnvelope,
  FaLink,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineTag } from "react-icons/hi";
import { MdOutlineEmail, MdOutlineLink } from "react-icons/md";
import { BiCalendar, BiReset } from "react-icons/bi";
import { FiShare2 } from "react-icons/fi";
import { CourseCategories, MicrosoftColors } from "../data";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CourseCard = ({ course, onView, onShare }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => onView(course)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#130CA8] to-[#1B12E8]">
        {course.image && !imageError ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoBookOutline size={64} className="text-white opacity-50" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className=" left-3">
          <span className=" text-[#1B12E8] rounded-lg text-xs font-semibold">
            {course.category}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#1B12E8] transition-colors">
          {course.title.length > 60
            ? course.title.substring(0, 57) + "..."
            : course.title}
        </h3>
        {/* <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.desc}</p> */}

        <div>
          <div className="flex items-center gap-2 mb-2 text-[12px] text-gray-500">
            <span>Offered By: </span>
            <span className="line-clamp-1">{course.organization}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <BiCalendar size={14} />
            <span>{moment(course.createdAt).format("MMM DD, YYYY")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(course);
            }}
            className=" right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
            title="Share"
          >
            <AiOutlineShareAlt size={18} className="text-[#146C94]" />
          </button> */}

          {/* <div className="">
            <span className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
              <IoCheckmarkCircle size={12} />
              Approved
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ course, onClose }) => {
  const [copied, setCopied] = useState(false);
  const courseUrl = `${window.location.origin}/courses/${course._id}`;
  const shareText = `Check out this course: ${course.title} by ${course.organization}`;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + courseUrl)}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "#1DA1F2",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(courseUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "#0077B5",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(courseUrl)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}`,
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "#EA4335",
      url: `mailto:?subject=${encodeURIComponent(course.title)}&body=${encodeURIComponent(shareText + " " + courseUrl)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(courseUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: shareText,
          url: courseUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Share Course</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">{course.title}</p>
            <p className="text-sm text-gray-600">{course.organization}</p>
          </div>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full mb-4 py-3 bg-[#146C94] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#0d5675] transition-colors"
            >
              <FiShare2 size={20} />
              Share via...
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            {shareOptions.map((option) => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all hover:shadow-md"
                style={{ color: option.color }}
              >
                <option.icon size={20} />
                <span className="text-sm font-medium">{option.name}</span>
              </a>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={courseUrl}
              readOnly
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <FaCheckCircle size={16} className="text-green-600" />
              ) : (
                <FaLink size={16} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseDetailsModal = ({ course, onClose, onShare }) => {
  const [imageError, setImageError] = useState(false);

  if (!course) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 bg-gradient-to-br from-[#146C94] to-[#19A7CE]">
          {course.image && !imageError ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-contain bg-white"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoBookOutline size={80} className="text-white opacity-50" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
          >
            <AiOutlineClose size={24} />
          </button>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1B12E8] rounded-lg text-sm font-semibold">
              {course.category}
            </span>
            {course.tag && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg text-sm">
                #{course.tag}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2
            className="text-2xl font-bold mb-4 text-gray-800"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {course.title}
          </h2>

          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <IoPeopleOutline size={18} />
            <span>{course.organization}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          </div>

          <div className="prose max-w-none mb-6">
            <h3
              className="font-semibold text-lg mb-2 text-gray-800"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Description
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {course.desc}
            </p>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Contact Information
              </h4>
              <a
                href={`mailto:${course.email}`}
                className="text-[#1B12E8] hover:underline text-sm flex items-center gap-2"
              >
                <MdOutlineEmail />
                {course.email}
              </a>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Course Link
              </h4>
              <a
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#146C94] hover:underline text-sm flex items-center gap-2 break-all"
              >
                <MdOutlineLink />
                {course.link}
              </a>
            </div>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#1B12E8] text-white rounded-lg font-medium text-center hover:bg-[#0d5675] transition-colors flex items-center justify-center gap-2"
            >
              Access Course
              <AiOutlineLink size={18} />
            </a>
            {/* <button
              onClick={() => {
                onShare(course);
                onClose();
              }}
              className="flex-1 py-3 border-2 border-[#146C94] text-[#146C94] rounded-lg font-medium hover:bg-[#146C94] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              Share Course
              <AiOutlineShareAlt size={18} />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar = ({
  tempFilters,
  onTempFilterChange,
  onApply,
  onReset,
  availableCategories,
  isMobileOpen,
  setIsMobileOpen,
  hasActiveFilters,
}) => {
  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full py-3 bg-white border rounded-lg flex items-center justify-center gap-2 shadow-sm"
        >
          <IoFilterOutline size={20} />
          Filter Courses
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-[#1B12E8] text-white text-xs rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`
        fixed md:sticky top-0 md:top-20 left-0 h-full md:h-auto w-80 md:w-auto
        bg-white md:bg-transparent z-40 transform transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        shadow-lg md:shadow-none p-6 md:p-0 overflow-y-auto
      `}
      >
        <div className="mb-6 flex justify-between items-center md:hidden">
          <h3 className="text-xl font-bold">Filters</h3>
          <button onClick={() => setIsMobileOpen(false)}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Search
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <AiOutlineSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={tempFilters.search}
                onChange={(e) => onTempFilterChange("search", e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Category
            </label>
            <select
              value={tempFilters.category}
              onChange={(e) => onTempFilterChange("category", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
            >
              <option value="all">All Categories</option>
              {CourseCategories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Organization Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Organization
            </label>
            <input
              type="text"
              placeholder="Filter by organization..."
              value={tempFilters.organization}
              onChange={(e) =>
                onTempFilterChange("organization", e.target.value)
              }
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={() => {
              onApply();
              setIsMobileOpen(false);
            }}
            className="w-full py-3 bg-[#1B12E8] text-white rounded-lg font-medium hover:bg-[#0d5675] transition-colors flex items-center justify-center gap-2"
          >
            <AiOutlineSearch size={18} />
            Apply Filters
          </button>

          {/* Reset Button - ALWAYS VISIBLE */}
          <button
            onClick={() => {
              onReset();
              setIsMobileOpen(false);
            }}
            className={`w-full py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
              hasActiveFilters
                ? "text-red-600 border-red-600 hover:bg-red-50"
                : "text-gray-400 border-gray-300 cursor-not-allowed"
            }`}
            disabled={!hasActiveFilters}
          >
            <BiReset size={18} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCourse, setShareCourse] = useState(null);

  // APPLIED filters (what's actually sent to the API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    category: "all",
    organization: "",
  });

  // TEMP filters (what the user is typing/selecting before applying)
  const [tempFilters, setTempFilters] = useState({
    search: "",
    category: "all",
    organization: "",
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const observerRef = useRef();

  // Intersection Observer for infinite scroll
  const lastCourseRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  // Fetch categories once on mount
  //   useEffect(() => {
  //     const fetchCategories = async () => {
  //       try {
  //         const response = await axios.get("/courses/categories");
  //         setAvailableCategories(response.data.data || []);
  //       } catch (error) {
  //         console.error("Error fetching categories:", error);
  //       }
  //     };
  //     fetchCategories();
  //   }, []);

  // Fetch courses whenever appliedFilters OR page changes
  const fetchCourses = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;

        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
        });

        // Only add params if they have values
        if (appliedFilters.search?.trim()) {
          params.append("search", appliedFilters.search.trim());
        }
        if (appliedFilters.category && appliedFilters.category !== "all") {
          params.append("category", appliedFilters.category);
        }
        if (appliedFilters.organization?.trim()) {
          params.append("organization", appliedFilters.organization.trim());
        }

        const response = await axios.get(`/courses/approved?${params}`);
        const { data, pagination } = response.data;
        const newCourses = data || [];

        if (reset) {
          setCourses(newCourses);
          setTotalResults(pagination?.totalItems || 0);
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
        }

        setHasMore(pagination?.hasNextPage || false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(error.response?.data?.error || "Error fetching courses");
        if (reset) {
          setCourses([]);
          setTotalResults(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, page],
  );

  // When appliedFilters change -> reset to page 1 and fetch
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCourses(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // When page changes (and > 1) -> fetch more
  useEffect(() => {
    if (page > 1) {
      fetchCourses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Check if any filters are currently applied
  const hasActiveFilters =
    appliedFilters.search !== "" ||
    appliedFilters.category !== "all" ||
    appliedFilters.organization !== "";

  // Handle temp filter changes (just updates UI, doesn't trigger API call)
  const handleTempFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters: copy temp to applied, which triggers the useEffect
  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
  };

  // Reset: clear both temp and applied, then refetch
  const handleResetFilters = () => {
    const resetState = {
      search: "",
      category: "all",
      organization: "",
    };
    setTempFilters(resetState);
    setAppliedFilters(resetState);
    // The useEffect on appliedFilters will handle the refetch
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleShareCourse = (course) => {
    setShareCourse(course);
    setShowShareModal(true);
  };

  return (
    <div className="">
      <Navbar />
      <div className="mt-[4em]"></div>
      {/* Header */}
      <div
        className=" text-white py-12 px-4 lg:px-14"
        style={{
          background: `linear-gradient(135deg, #1B12E8 0%, #130CA8 100%)`,
        }}
      >
        <div className="container mx-auto px-4">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Courses
          </h1>
          <p className="text-lg opacity-90">
            Discover high-quality courses from trusted organizations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <FilterSidebar
              tempFilters={tempFilters}
              onTempFilterChange={handleTempFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              availableCategories={availableCategories}
              isMobileOpen={isMobileFilterOpen}
              setIsMobileOpen={setIsMobileFilterOpen}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Courses Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-600">
                {loading && courses.length === 0 ? (
                  <span className="text-gray-400">Searching...</span>
                ) : (
                  <>
                    {/* Found <span className="font-semibold">{totalResults}</span>{" "}
                    course
                    {totalResults !== 1 ? "s" : ""} */}
                    {hasActiveFilters && (
                      <span className="text-sm text-gray-400 ml-2">
                        (filtered)
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Active filter tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.search && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full flex items-center gap-1">
                      Search: "{appliedFilters.search}"
                    </span>
                  )}
                  {appliedFilters.category !== "all" && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full flex items-center gap-1">
                      Category: {appliedFilters.category}
                    </span>
                  )}
                  {appliedFilters.organization && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full flex items-center gap-1">
                      Org: {appliedFilters.organization}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading Initial */}
            {loading && courses.length === 0 && (
              <div className="flex justify-center items-center h-64">
                <Spinner message="Loading courses..." />
              </div>
            )}

            {/* No Results */}
            {!loading && courses.length === 0 && hasActiveFilters && (
              <div className="text-center py-12 bg-white rounded-xl">
                <IoBookOutline
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-500 mb-4">
                  No results match your current filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#1B12E8] text-white rounded-lg hover:bg-[#0d5675] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Empty State (no filters, no data) */}
            {!loading && courses.length === 0 && !hasActiveFilters && (
              <div className="text-center py-12 bg-white rounded-xl">
                <IoBookOutline
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No courses available
                </h3>
                <p className="text-gray-500">
                  Check back later for new courses.
                </p>
              </div>
            )}

            {/* Courses Grid */}
            {courses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  if (courses.length === index + 1) {
                    return (
                      <div ref={lastCourseRef} key={course._id}>
                        <CourseCard
                          course={course}
                          onView={handleViewCourse}
                          onShare={handleShareCourse}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <CourseCard
                        key={course._id}
                        course={course}
                        onView={handleViewCourse}
                        onShare={handleShareCourse}
                      />
                    );
                  }
                })}
              </div>
            )}

            {/* Loading More */}
            {loading && courses.length > 0 && (
              <div className="flex justify-center py-8">
                <Spinner message="Loading more courses..." />
              </div>
            )}

            {/* No More Results */}
            {!hasMore && courses.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>You've reached the end! No more courses to load.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onShare={handleShareCourse}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareCourse && (
        <ShareModal
          course={shareCourse}
          onClose={() => {
            setShowShareModal(false);
            setShareCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default Courses;

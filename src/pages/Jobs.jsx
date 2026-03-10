import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineLink,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import {
  BiCalendar,
  BiHash,
  BiReset,
  BiTime,
  BiMap,
  BiWorld,
  BiBriefcase,
  BiBuilding,
} from "react-icons/bi";
import {
  MdOutlineDateRange,
  MdOnlinePrediction,
  MdLocationOn,
  MdWork,
  MdAttachMoney,
  MdTrendingUp,
} from "react-icons/md";
import {
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaRegCalendarAlt,
  FaBuilding,
  FaClock,
  FaLevelUpAlt,
  FaDollarSign,
} from "react-icons/fa";
import { HiOutlinePhotograph } from "react-icons/hi";
import { TfiLocationPin } from "react-icons/tfi";
import { GrLocation } from "react-icons/gr";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import Navbar from "../components/Navbar";

// Work Mode Badge Component
const WorkModeBadge = ({ mode }) => {
  const config = {
    remote: {
      icon: FaVideo,
      text: "Remote",
      bg: "#e6f0fa",
      textColor: "#0067b8",
    },
    onsite: {
      icon: FaMapMarkerAlt,
      text: "On-site",
      bg: "#fee2e2",
      textColor: "#991b1b",
    },
    hybrid: {
      icon: MdOnlinePrediction,
      text: "Hybrid",
      bg: "#f3e8ff",
      textColor: "#6b21a8",
    },
  };

  const { bg, text, icon: Icon, textColor } = config[mode] || config.remote;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <Icon size={10} />
      {text}
    </span>
  );
};

// Job Type Badge Component
const JobTypeBadge = ({ type }) => {
  const config = {
    "full-time": { bg: "#e0f2e9", text: "#0b5e42", label: "Full Time" },
    "part-time": { bg: "#fff3cd", text: "#856404", label: "Part Time" },
    contract: { bg: "#e6f0fa", text: "#0067b8", label: "Contract" },
    internship: { bg: "#f3e8ff", text: "#6b21a8", label: "Internship" },
    freelance: { bg: "#fee2e2", text: "#991b1b", label: "Freelance" },
  };

  const { bg, text, label } = config[type] || config["full-time"];

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

// Experience Level Badge
const ExperienceBadge = ({ level }) => {
  const config = {
    entry: { bg: "#e6f0fa", text: "#0067b8", label: "Entry Level" },
    mid: { bg: "#e0f2e9", text: "#0b5e42", label: "Mid Level" },
    senior: { bg: "#fee2e2", text: "#991b1b", label: "Senior Level" },
    lead: { bg: "#f3e8ff", text: "#6b21a8", label: "Lead" },
    executive: { bg: "#fff3cd", text: "#856404", label: "Executive" },
  };

  const { bg, text, label } = config[level] || config.mid;

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

// Salary Display Component
const SalaryDisplay = ({ salary }) => {
  if (!salary?.min && !salary?.max) {
    return (
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <FaDollarSign size={10} />
        Not specified
      </span>
    );
  }

  const formatSalary = (num) => {
    if (!num) return "";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num;
  };

  return (
    <span className="text-xs font-medium flex items-center gap-1">
      <FaDollarSign size={10} className="text-green-600" />
      {salary.currency || "USD"} {salary.min && formatSalary(salary.min)}
      {salary.min && salary.max && " - "}
      {salary.max && formatSalary(salary.max)}
      {salary.isNegotiable && " (Neg)"}
    </span>
  );
};

// Job Modal Component
const JobModal = ({ job, onClose, formatDate }) => {
  if (!job) return null;

  // Track view when modal is opened
  useEffect(() => {
    const trackView = async () => {
      try {
        // Just viewing the job, no need to track separately
        // The backend already increments viewCount when fetching
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };
    trackView();
  }, [job._id]);

  // Handle apply click
  const handleApplyClick = async () => {
    try {
      await axios.post(`/jobs/${job._id}/track-apply`);
      // Open the apply link in a new tab
      if (job.applyLink) {
        window.open(job.applyLink, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error tracking apply:", error);
      // Still open the link even if tracking fails
      if (job.applyLink) {
        window.open(job.applyLink, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Company Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="w-16 h-16 flex-shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-full h-full object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/64?text=Company";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaBuilding size={32} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Title and Company */}
            <div className="flex-1">
              <h2
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: "#0067b8" }}
              >
                {job.title}
              </h2>
              <p className="text-gray-600 mb-2">{job.companyName}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <WorkModeBadge mode={job.workMode} />
                <JobTypeBadge type={job.type} />
                <ExperienceBadge level={job.experienceLevel} />
              </div>
            </div>

            {/* Apply Button */}
            {job.applyLink && (
              <button
                onClick={handleApplyClick}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <AiOutlineLink size={18} />
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-medium flex items-center gap-1 text-sm">
                <TfiLocationPin size={14} />
                {job.location || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="font-medium capitalize text-sm">
                {job.category?.charAt(0).toUpperCase() +
                  job.category?.slice(1) || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Salary</p>
              <SalaryDisplay salary={job.salaryRange} />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Posted</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <BiCalendar size={14} />
                {moment(job.createdAt).fromNow()}
              </p>
            </div>
          </div>

          {/* About the Job */}
          {job.about && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">About the Job</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                {job.about}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                {job.requirements.map((req, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Qualifications</h3>
              <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                {job.qualifications.map((qual, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    {qual}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    style={{ backgroundColor: "#e6f0fa", color: "#0067b8" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Website */}
          {job.companyWebsite && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Company Website</h3>
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <BiWorld />
                {job.companyWebsite.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {/* Deadline */}
          {job.applicationDeadline && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Application Deadline</h3>
              <p
                className={`text-sm flex items-center gap-2 ${
                  moment(job.applicationDeadline).isBefore()
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                <FaClock />
                {moment(job.applicationDeadline).format("MMMM DD, YYYY")}
                {moment(job.applicationDeadline).isBefore() && " (Expired)"}
              </p>
            </div>
          )}

          {/* Posted By */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>
              Posted by {job.createdBy?.organizationName || "Unknown"} •{" "}
              {moment(job.createdAt).format("MMMM DD, YYYY")}
            </p>
          </div>

          {/* Views Counter */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <FaEye size={14} />
            <span>{job.applicationClicks || 0} Clicked Apply</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ item, onClick, formatDate }) => {
  const isExpired =
    item.applicationDeadline && moment(item.applicationDeadline).isBefore();

  return (
    <div
      onClick={() => onClick(item)}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full group ${
        isExpired ? "opacity-75" : ""
      }`}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b flex items-start gap-3">
        {/* Company Logo */}
        <div className="w-12 h-12 flex-shrink-0">
          {item.companyLogo ? (
            <img
              src={item.companyLogo}
              alt={item.companyName}
              className="w-full h-full object-cover rounded-lg border"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/48?text=Company";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <FaBuilding size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Title and Company */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold mb-1 line-clamp-1"
            style={{ color: "#0067b8" }}
          >
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {item.companyName}
          </p>
        </div>

        {/* Expired Badge */}
        {isExpired && (
          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
            Expired
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <WorkModeBadge mode={item.workMode} />
          <JobTypeBadge type={item.type} />
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
          <TfiLocationPin className="flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">
            {item.location || "Location TBA"}
          </span>
        </div>

        {/* Experience Level */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <FaLevelUpAlt className="flex-shrink-0" size={10} />
          <ExperienceBadge level={item.experienceLevel} />
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <SalaryDisplay salary={item.salaryRange} />
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2">
          <BiCalendar size={12} />
          <span>Posted {moment(item.createdAt).fromNow()}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 pt-2 border-t">
          <span className="flex items-center gap-1">
            <AiOutlineLink size={10} />
            {item.applicationClicks || 0} clicked apply
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Jobs Component
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Refs for search debounce
  const searchTimeout = useRef(null);

  // Fetch jobs with filters
  const fetchJobs = async (pageNum = 1, isNewSearch = false) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: pageNum,
        limit: 9,
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      if (workModeFilter !== "all") {
        params.append("workMode", workModeFilter);
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (experienceFilter !== "all") {
        params.append("experienceLevel", experienceFilter);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const { data } = await axios.get(`/jobs?${params.toString()}`);

      if (isNewSearch) {
        setJobs(data.data || []);
      } else {
        setJobs((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setLoading(false);

      // Fetch filter options (only once)
      if (availableCategories.length === 0) {
        fetchFilterOptions();
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const { data } = await axios.get("/jobs/filters/options");
      setAvailableCategories(data.data?.categories || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
      fetchJobs(1, true);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchText]);

  // Apply filters when they change
  useEffect(() => {
    setPage(1);
    fetchJobs(1, true);
  }, [
    debouncedSearch,
    selectedCategory,
    workModeFilter,
    typeFilter,
    experienceFilter,
    startDate,
    endDate,
  ]);

  // Load more for infinite scroll
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setWorkModeFilter("all");
    setTypeFilter("all");
    setExperienceFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchJobs(1, true);
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  // Handle card click
  const handleCardClick = (item) => {
    setSelectedJob(item);
    setShowModal(true);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchText) count++;
    if (selectedCategory) count++;
    if (workModeFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    if (experienceFilter !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-sm mt-[3em] mb-[3em]">
        <div className="container mx-auto px-4 py-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 mt-[1em]"
            style={{ color: "#0067b8" }}
          >
            Find Your Next Opportunity
          </h1>
          <p className="text-gray-600">
            Discover jobs from top companies and organizations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Search and Filters Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8 -mt-8 relative z-10">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center border-2 rounded-xl overflow-hidden focus-within:border-blue-400 transition">
                <AiOutlineSearch className="ml-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or keywords..."
                  className="w-full px-4 py-3 outline-none"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition ${
                showFilters
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-300"
              }`}
            >
              <BiHash />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
              {showFilters ? (
                <AiOutlineClose size={16} />
              ) : (
                <MdOutlineDateRange />
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Work Mode Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Work Mode
                  </label>
                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Work Modes</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Job Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Experience Level
                  </label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Posted After
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Posted Before
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {getActiveFilterCount() > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    <BiReset />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{jobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid with Infinite Scroll */}
        <InfiniteScroll
          dataLength={jobs.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-8">
              <Spinner message="Loading more jobs..." />
            </div>
          }
          endMessage={
            jobs.length > 0 && (
              <p className="text-center text-gray-500 py-8">
                You've reached the end! No more jobs to load.
              </p>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((item) => (
              <JobCard
                key={item._id}
                item={item}
                onClick={handleCardClick}
                formatDate={formatDate}
              />
            ))}
          </div>
        </InfiniteScroll>

        {/* Loading State */}
        {loading && jobs.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <Spinner message="Loading jobs..." />
          </div>
        )}

        {/* No Results */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <BiBriefcase size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {getActiveFilterCount() > 0
                ? "No jobs match your filters. Try adjusting your search criteria."
                : "There are no jobs available at the moment. Check back later!"}
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Job Modal */}
        {showModal && selectedJob && (
          <JobModal
            job={selectedJob}
            onClose={() => {
              setShowModal(false);
              setSelectedJob(null);
            }}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

export default Jobs;

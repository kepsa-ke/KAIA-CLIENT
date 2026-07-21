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
  IoTimeOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import {
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaEnvelope,
  FaLink,
  FaCheckCircle,
  FaEye,
  FaChartLine,
} from "react-icons/fa";
import { HiOutlineTag, HiOutlinePhotograph } from "react-icons/hi";
import {
  MdOutlineEmail,
  MdOutlineLink,
  MdOutlineScience,
  MdOutlineDescription,
} from "react-icons/md";
import { BiCalendar, BiReset, BiTrendingUp } from "react-icons/bi";
import { FiShare2 } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Insight Card Component
const InsightCard = ({ insight, onView, onShare }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => onView(insight)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#130CA8] to-[#1B12E8]">
        {insight.image && !imageError ? (
          <img
            src={insight.image}
            alt={insight.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoStatsChartOutline size={64} className="text-white opacity-50" />
          </div>
        )}

        {/* Featured Badge */}
        {insight.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <BiTrendingUp size={12} />
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Date */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
          <BiCalendar size={14} />
          <span>{moment(insight.dateOfInsight).format("MMM DD, YYYY")}</span>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#1B12E8] transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {insight.title.length > 60
            ? insight.title.substring(0, 57) + "..."
            : insight.title}
        </h3>

        {/* Organization */}
        <div className="flex items-center gap-2 mb-2 text-[12px] text-gray-500">
          <span>By: </span>
          <span className="line-clamp-1 font-medium">
            {insight.organizationName}
          </span>
        </div>

        {/* Tags Preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {insight.tags?.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {insight.tags?.length > 2 && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              +{insight.tags.length - 2}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FaEye size={12} className="text-[#1B12E8]" />
              {insight.views || 0}
            </span>
            {/* <span className="flex items-center gap-1">
              <FaLink size={12} className="text-green-600" />
              {insight.clicks || 0}
            </span> */}
          </div>
          <div className="flex items-center gap-1 text-[#1B12E8]">
            <span className="text-xs">Read more</span>
            <AiOutlineLink size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Share Modal Component
const ShareModal = ({ insight, onClose }) => {
  const [copied, setCopied] = useState(false);
  const insightUrl = `${window.location.origin}/insights/${insight._id}`;
  const shareText = `Check out this insight: ${insight.title} by ${insight.organizationName}`;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + insightUrl)}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "#1DA1F2",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(insightUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "#0077B5",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(insightUrl)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(insightUrl)}`,
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "#EA4335",
      url: `mailto:?subject=${encodeURIComponent(insight.title)}&body=${encodeURIComponent(shareText + " " + insightUrl)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(insightUrl);
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
          title: insight.title,
          text: shareText,
          url: insightUrl,
        });
        onClose();
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
            <h2 className="text-xl font-bold text-gray-800">Share Insight</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1 line-clamp-2">
              {insight.title}
            </p>
            <p className="text-sm text-gray-600">{insight.organizationName}</p>
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
              value={insightUrl}
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

// Insight Details Modal --  here
const InsightDetailsModal = ({ insight, onClose, onShare }) => {
  const [imageError, setImageError] = useState(false);

  if (!insight) return null;

  return (
    <div
      className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 bg-gradient-to-br from-[#1B12E8] to-[#130CA8]">
          {insight.image && !imageError ? (
            <img
              src={insight.image}
              alt={insight.title}
              className="w-full h-full object-contain bg-white"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoStatsChartOutline
                size={80}
                className="text-white opacity-50"
              />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
          >
            <AiOutlineClose size={24} />
          </button>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {insight.isFeatured && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
                <BiTrendingUp size={14} />
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2
            className="text-2xl font-bold mb-2 text-gray-800"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {insight.title}
          </h2>

          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <IoPeopleOutline size={18} />
            <span>{insight.organizationName}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <BiCalendar size={16} />
            <span>{moment(insight.dateOfInsight).format("MMMM DD, YYYY")}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <FaEye size={14} />
            <span>{insight.views || 0} views</span>
          </div>

          {/* Tags */}
          {insight.tags?.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    <HiOutlineTag size={12} />#{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="prose max-w-none mb-6">
            <h3
              className="font-semibold text-lg mb-2 text-gray-800 flex items-center gap-2"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <MdOutlineDescription size={20} />
              Summary
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
              {insight.insightSummary}
            </p>
          </div>

          {/* Methodology */}
          <div className="prose max-w-none mb-6">
            <h3
              className="font-semibold text-lg mb-2 text-gray-800 flex items-center gap-2"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <MdOutlineScience size={20} />
              Methodology
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
              {insight.methodologyInBrief}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <a
              href={insight.linkToFullReport}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Track click
                axios
                  .post(`/insights/${insight._id}/track-click`)
                  .catch(console.error);
              }}
              className="flex-1 py-3  text-white rounded-lg font-medium text-center  flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, #1B12E8 0%, #130CA8 100%)`,
              }}
            >
              Read Full Report
              <AiOutlineLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({
  tempFilters,
  onTempFilterChange,
  onApply,
  onReset,
  isMobileOpen,
  setIsMobileOpen,
  hasActiveFilters,
}) => {
  const years = [...new Array(5)].map((_, i) => moment().year() - i);
  const months = moment.months();

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full py-3 bg-white border rounded-lg flex items-center justify-center gap-2 shadow-sm"
        >
          <IoFilterOutline size={20} />
          Filter Insights
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
        fixed md:sticky top-0 md:top-4 left-0 h-full md:h-auto w-80 md:w-64
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
                placeholder="Search insights..."
                value={tempFilters.search}
                onChange={(e) => onTempFilterChange("search", e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
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

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Year
            </label>
            <select
              value={tempFilters.year}
              onChange={(e) => onTempFilterChange("year", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Month
            </label>
            <select
              value={tempFilters.month}
              onChange={(e) => onTempFilterChange("month", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
              disabled={tempFilters.year === "all"}
            >
              <option value="all">All Months</option>
              {months.map((month, idx) => (
                <option key={month} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
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

          {/* Reset Button */}
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

// Main Component
const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInsight, setShareInsight] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // APPLIED filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    organization: "",
    year: "all",
    month: "all",
  });

  // TEMP filters
  const [tempFilters, setTempFilters] = useState({
    search: "",
    organization: "",
    year: "all",
    month: "all",
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const observerRef = useRef();

  // Intersection Observer for infinite scroll
  const lastInsightRef = useCallback(
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

  // Fetch insights
  const fetchInsights = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;

        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
        });

        if (appliedFilters.search?.trim()) {
          params.append("search", appliedFilters.search.trim());
        }
        if (appliedFilters.organization?.trim()) {
          params.append("organizationName", appliedFilters.organization.trim());
        }

        const response = await axios.get(`/insights/approved?${params}`);
        const { data, pagination } = response.data;
        let newInsights = data || [];

        // Apply year/month filters on client side (since API doesn't support them)
        if (appliedFilters.year !== "all") {
          newInsights = newInsights.filter(
            (i) =>
              moment(i.dateOfInsight).year() === parseInt(appliedFilters.year),
          );
        }
        if (appliedFilters.month !== "all") {
          newInsights = newInsights.filter(
            (i) =>
              moment(i.dateOfInsight).month() + 1 ===
              parseInt(appliedFilters.month),
          );
        }

        if (reset) {
          setInsights(newInsights);
          setTotalResults(newInsights.length);
        } else {
          setInsights((prev) => [...prev, ...newInsights]);
        }

        setHasMore(pagination?.hasNextPage || false);
      } catch (error) {
        console.error("Error fetching insights:", error);
        toast.error(error.response?.data?.message || "Error fetching insights");
        if (reset) {
          setInsights([]);
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
    fetchInsights(true);
  }, [appliedFilters]);

  // When page changes (and > 1) -> fetch more
  useEffect(() => {
    if (page > 1) {
      fetchInsights(false);
    }
  }, [page]);

  const hasActiveFilters =
    appliedFilters.search !== "" ||
    appliedFilters.organization !== "" ||
    appliedFilters.year !== "all" ||
    appliedFilters.month !== "all";

  const handleTempFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
  };

  const handleResetFilters = () => {
    const resetState = {
      search: "",
      organization: "",
      year: "all",
      month: "all",
    };
    setTempFilters(resetState);
    setAppliedFilters(resetState);
  };

  const handleViewInsight = (insight) => {
    setSelectedInsight(insight);
    // Track view
    axios.get(`/insights/${insight._id}`).catch(console.error);
  };

  const handleShareInsight = (insight) => {
    setShareInsight(insight);
    setShowShareModal(true);
  };

  return (
    <div>
      <Navbar />
      <div className="mt-[4em]"></div>

      {/* Header */}
      <div
        className="text-white py-12 px-4 lg:px-14"
        style={{
          background: `linear-gradient(135deg, #1B12E8 0%, #130CA8 100%)`,
        }}
      >
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Insights</h1>
          <p className="text-lg opacity-90">
            Discover the latest research, benchmarks, and breakthroughs from our
            members
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
              isMobileOpen={isMobileFilterOpen}
              setIsMobileOpen={setIsMobileFilterOpen}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Insights Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="text-gray-600">
                {loading && insights.length === 0 ? (
                  <span className="text-gray-400">Searching...</span>
                ) : (
                  <>
                    Found <span className="font-semibold">{totalResults}</span>{" "}
                    insight
                    {totalResults !== 1 ? "s" : ""}
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
                  {appliedFilters.organization && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full flex items-center gap-1">
                      Org: {appliedFilters.organization}
                    </span>
                  )}
                  {appliedFilters.year !== "all" && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full">
                      Year: {appliedFilters.year}
                    </span>
                  )}
                  {appliedFilters.month !== "all" && (
                    <span className="px-2 py-1 bg-[#1B12E8]/10 text-[#1B12E8] text-xs rounded-full">
                      Month: {moment.months()[appliedFilters.month - 1]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading Initial */}
            {loading && insights.length === 0 && (
              <div className="flex justify-center items-center h-64">
                <Spinner message="Loading insights..." />
              </div>
            )}

            {/* No Results */}
            {!loading && insights.length === 0 && hasActiveFilters && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <IoStatsChartOutline
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No insights found
                </h3>
                <p className="text-gray-500 mb-4">
                  No results match your current filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && insights.length === 0 && !hasActiveFilters && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <IoStatsChartOutline
                  size={64}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No insights available
                </h3>
                <p className="text-gray-500">
                  Check back later for new insights from leading organizations.
                </p>
              </div>
            )}

            {/* Insights Grid */}
            {insights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((insight, index) => {
                  if (insights.length === index + 1) {
                    return (
                      <div ref={lastInsightRef} key={insight._id}>
                        <InsightCard
                          insight={insight}
                          onView={handleViewInsight}
                          onShare={handleShareInsight}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <InsightCard
                        key={insight._id}
                        insight={insight}
                        onView={handleViewInsight}
                        onShare={handleShareInsight}
                      />
                    );
                  }
                })}
              </div>
            )}

            {/* Loading More */}
            {loading && insights.length > 0 && (
              <div className="flex justify-center py-8">
                <Spinner message="Loading more insights..." />
              </div>
            )}

            {/* No More Results */}
            {!hasMore && insights.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>You've reached the end! No more insights to load.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Insight Details Modal */}
      {selectedInsight && (
        <InsightDetailsModal
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
          onShare={handleShareInsight}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareInsight && (
        <ShareModal
          insight={shareInsight}
          onClose={() => {
            setShowShareModal(false);
            setShareInsight(null);
          }}
        />
      )}
    </div>
  );
};

export default Insights;

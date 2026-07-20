import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { BiLink, BiCalendar, BiCategory, BiReset } from "react-icons/bi";
import { MdOutlineDateRange } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { FaExternalLinkAlt } from "react-icons/fa";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Blog Modal Component
const BlogModal = ({ ad, onClose, formatDate, handleAdClick }) => {
  if (!ad) return null;

  const handleVisitBlog = async () => {
    try {
      // Track the click
      await axios.post(`/blog-ads/${ad._id}/click`);
      // Open the blog URL in a new tab
      window.open(ad.blogUrl, "_blank", "noopener noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
      // Still open the URL even if tracking fails
      window.open(ad.blogUrl, "_blank", "noopener noreferrer");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {ad.image && (
          <div className="relative h-64 md:h-96 bg-gray-100">
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Blog+Ad";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "#1B12E8" }}
          >
            {ad.title}
          </h2>

          {/* Author and Date Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4 pb-4 border-b">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-gray-500">Promoted by :</p>
                <p className="text-sm font-medium text-gray-900">
                  {ad.createdBy?.organizationName ||
                    ad.createdBy?.email?.split("@")[0] ||
                    "KAISA Community"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 ml-auto">
              <BiCalendar />
              <span>{formatDate(ad.publishedAt || ad.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-6 whitespace-pre-wrap leading-relaxed">
            {ad.description}
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 mb-4">
            <BiCategory className="text-gray-500" />
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: "#e6f0fa", color: "#1B12E8" }}
            >
              {ad.category}
            </span>
          </div>

          {/* Tags */}
          {ad.tags && ad.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ad.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Visit Blog Button */}
          <button
            onClick={handleVisitBlog}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-white hover:opacity-90 transition text-lg font-medium"
            style={{ backgroundColor: "#1B12E8" }}
          >
            <FaExternalLinkAlt size={16} />
            Visit Blog
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Blog Card Component
const BlogCard = ({ item, onClick, formatDate, getExcerpt }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x200?text=Blog+Ad";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlinePhotograph size={48} className="text-gray-400" />
          </div>
        )}
        {/* Promoted Badge
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Promoted
        </div> */}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800"
          style={{ color: "#1B12E8" }}
        >
          {item.title.length > 50
            ? `${item.title.substring(0, 50)}...`
            : item.title || "Untitled"}
        </h3>

        {/* Promoter Info */}
        <div className="flex items-center gap-1 mb-2">
          <p className="text-xs text-gray-500">
            by{" "}
            {item.createdBy?.organizationName ||
              item.createdBy?.email?.split("@")[0] ||
              "KAISA Community"}
          </p>
        </div>

        {/* Category & Date */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: "#e6f0fa", color: "#1B12E8" }}
          >
            {item.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BiCalendar />
            <span>{formatDate(item.publishedAt || item.createdAt)}</span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
          {getExcerpt(item.description)}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {item.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Blogs Component
const Blogs = () => {
  const [blogAds, setBlogAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Refs for search debounce
  const searchTimeout = useRef(null);

  // Fetch blog ads with filters
  const fetchBlogAds = async (pageNum = 1, isNewSearch = false) => {
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

      if (selectedTag) {
        params.append("tag", selectedTag);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await axios.get(`/blog-ads?${params.toString()}`);

      // Handle response data
      const responseData = response.data.data || [];
      const pagination = response.data.pagination || {};

      if (isNewSearch) {
        setBlogAds(responseData);
      } else {
        setBlogAds((prev) => [...prev, ...responseData]);
      }

      setHasMore(pagination.hasMore || false);
      setLoading(false);

      // Fetch filter options (only once)
      if (availableCategories.length === 0 && availableTags.length === 0) {
        fetchFilterOptions();
      }
    } catch (error) {
      console.error("Error fetching blog ads:", error);
      toast.error("Failed to load blog advertisements");
      setLoading(false);
    }
  };

  // Fetch filter options (categories and tags)
  const fetchFilterOptions = async () => {
    try {
      const { data } = await axios.get("/blog-ads/filters/all");
      setAvailableCategories(data.data?.categories || []);
      setAvailableTags(data.data?.tags || []);
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
      fetchBlogAds(1, true);
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
    fetchBlogAds(1, true);
  }, [selectedCategory, selectedTag, startDate, endDate, debouncedSearch]);

  // Load more for infinite scroll
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogAds(nextPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchBlogAds(1, true);
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  // Get excerpt from description
  const getExcerpt = (description, maxLength = 100) => {
    if (!description) return "";
    const cleanText = description.replace(/\s+/g, " ").trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  // Handle card click
  const handleCardClick = (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-[4em]">
        <div className="mt-[3em] mb-[3em]" />

        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="container mx-auto px-4 py-8">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2 mt-[1em]"
              style={{ color: "#1B12E8" }}
            >
              Blog Directory
            </h1>
            <p className="text-gray-600">
              Discover amazing blogs from our community. Click to read full
              articles.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-200">
                  <AiOutlineSearch className="ml-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search blogs by title, description, category or tags..."
                    className="w-full px-3 py-3 outline-none"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <BiCategory />
                Filters
                {showFilters ? (
                  <AiOutlineClose size={16} />
                ) : (
                  <MdOutlineDateRange />
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Filter by Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Filter by Tag
                    </label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All Tags</option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(searchText ||
                  selectedCategory ||
                  selectedTag ||
                  startDate ||
                  endDate) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      <BiReset />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blog Ads Grid with Infinite Scroll */}
          <InfiniteScroll
            dataLength={blogAds.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-8">
                <Spinner message="Loading more blogs..." />
              </div>
            }
            endMessage={
              blogAds.length > 0 && (
                <p className="text-center text-gray-500 py-8">
                  You've reached the end! No more blogs to load.
                </p>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogAds.map((item) => (
                <BlogCard
                  key={item._id}
                  item={item}
                  onClick={handleCardClick}
                  formatDate={formatDate}
                  getExcerpt={getExcerpt}
                />
              ))}
            </div>
          </InfiniteScroll>

          {/* Loading State */}
          {loading && blogAds.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <Spinner message="Loading blogs..." />
            </div>
          )}

          {/* No Results */}
          {!loading && blogAds.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <HiOutlinePhotograph
                size={64}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">No Blogs Found</h3>
              <p className="text-gray-600">
                {searchText ||
                selectedCategory ||
                selectedTag ||
                startDate ||
                endDate
                  ? "No blogs match your filters. Try adjusting your search criteria."
                  : "There are no blog advertisements available at the moment."}
              </p>
              {(searchText ||
                selectedCategory ||
                selectedTag ||
                startDate ||
                endDate) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 rounded-md text-white hover:opacity-90 transition"
                  style={{ backgroundColor: "#1B12E8" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Blog Modal */}
        {showModal && selectedAd && (
          <BlogModal
            ad={selectedAd}
            onClose={() => {
              setShowModal(false);
              setSelectedAd(null);
            }}
            formatDate={formatDate}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Blogs;

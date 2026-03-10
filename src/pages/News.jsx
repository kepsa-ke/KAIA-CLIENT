import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { BiLink, BiCalendar, BiHash, BiReset } from "react-icons/bi";
import { MdOutlineDateRange } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import Navbar from "../components/Navbar";

const NewsModal = ({ news, onClose, formatDate }) => {
  if (!news) return null;

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
        {news.image && (
          <div className="relative h-64 md:h-96 bg-gray-100">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x400?text=News+Image";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "#0067b8" }}
          >
            {news.title}
          </h2>

          {/* Author and Date Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4 pb-4 border-b">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-gray-500">News by :</p>
                <p className="text-sm font-medium text-gray-900">
                  {news.createdBy?.organizationName || "Unknown Organization"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 ml-auto">
              <BiCalendar />
              <span>{formatDate(news.publishedAt || news.createdAt)}</span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <BiCalendar />
            <span>{formatDate(news.publishedAt || news.createdAt)}</span>
          </div>

          {/* Body - Preserve formatting */}
          <div className="prose max-w-none mb-6 whitespace-pre-wrap leading-relaxed">
            {news.body}
          </div>

          {/* Hashtags */}
          {news.hashtags && news.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {news.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: "#e6f0fa", color: "#0067b8" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* External Link */}
          {news.externalLink && (
            <a
              href={news.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white hover:opacity-90 transition"
              style={{ backgroundColor: "#0067b8" }}
            >
              <BiLink />
              Read Full Article
            </a>
          )}

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

const NewsCard = ({ item, onClick, formatDate, getExcerpt }) => (
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
            e.target.src =
              "https://via.placeholder.com/400x200?text=News+Image";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <HiOutlinePhotograph size={48} className="text-gray-400" />
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 flex-1 flex flex-col">
      {/* Title */}
      <h3
        className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800"
        style={{ color: "#0067b8" }}
      >
        {item.title.length > 40
          ? `${item.title.substring(0, 40)}...`
          : item.title || "Untitled"}
      </h3>

      <div className="flex items-center gap-2 mb-2">
        <div>
          <p className="text-sm font-medium text-gray-900">
            News by :{" "}
            {item.createdBy?.organizationName || "Unknown Organization"}
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <BiCalendar />
        <span>{formatDate(item.publishedAt || item.createdAt)}</span>
      </div>

      {/* Excerpt */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
        {getExcerpt(item.body)}
      </p>

      {/* Hashtags */}
      {item.hashtags && item.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.hashtags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-blue-50 rounded-full"
              style={{ color: "#0067b8", backgroundColor: "#e6f0fa" }}
            >
              #{tag}
            </span>
          ))}
          {item.hashtags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{item.hashtags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

// Main News Component
const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Refs for search debounce
  const searchTimeout = useRef(null);

  // Fetch news with filters
  const fetchNews = async (pageNum = 1, isNewSearch = false) => {
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

      if (selectedHashtag) {
        params.append("hashtag", selectedHashtag);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const { data } = await axios.get(`/news?${params.toString()}`);

      if (isNewSearch) {
        setNews(data.data || []);
      } else {
        setNews((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setLoading(false);

      // Fetch hashtags for filter dropdown (only once)
      if (availableHashtags.length === 0) {
        fetchHashtags();
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to load news");
      setLoading(false);
    }
  };

  // Fetch all hashtags for filter dropdown
  const fetchHashtags = async () => {
    try {
      const { data } = await axios.get("/news/hashtags/all");
      setAvailableHashtags(data.data || []);
    } catch (error) {
      console.error("Error fetching hashtags:", error);
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
      fetchNews(1, true);
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
    fetchNews(1, true);
  }, [selectedHashtag, startDate, endDate, debouncedSearch]);

  // Load more for infinite scroll
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedHashtag("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchNews(1, true);
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  // Get excerpt from body
  const getExcerpt = (body, maxLength = 120) => {
    if (!body) return "";
    // Remove extra whitespace but preserve words
    const cleanText = body.replace(/\s+/g, " ").trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  // Handle card click
  const handleCardClick = (item) => {
    setSelectedNews(item);
    setShowModal(true);
  };

  return (
    <div className="">
      <Navbar />
      <div className="px-[4em]">
        <div className="mt-[3em] mb-[3em]" />
        {/* Header */}
        <div className="bg-white  shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2 mt-[1em]"
              style={{ color: "#0067b8" }}
            >
              News & Updates
            </h1>
            <p className="text-gray-600">
              Stay informed with the latest news and announcements
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
                    placeholder="Search news by title, content or hashtags..."
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
                <BiHash />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hashtag Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Filter by Hashtag
                    </label>
                    <select
                      value={selectedHashtag}
                      onChange={(e) => setSelectedHashtag(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All Hashtags</option>
                      {availableHashtags.map((tag) => (
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
                {(searchText || selectedHashtag || startDate || endDate) && (
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

          {/* News Grid with Infinite Scroll */}
          <InfiniteScroll
            dataLength={news.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-8">
                <Spinner message="Loading more news..." />
              </div>
            }
            endMessage={
              news.length > 0 && (
                <p className="text-center text-gray-500 py-8">
                  You've reached the end! No more news to load.
                </p>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <NewsCard
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
          {loading && news.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <Spinner message="Loading news..." />
            </div>
          )}

          {/* No Results */}
          {!loading && news.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <HiOutlinePhotograph
                size={64}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">No News Found</h3>
              <p className="text-gray-600">
                {searchText || selectedHashtag || startDate || endDate
                  ? "No news matches your filters. Try adjusting your search criteria."
                  : "There are no news articles available at the moment."}
              </p>
              {(searchText || selectedHashtag || startDate || endDate) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 rounded-md text-white hover:opacity-90 transition"
                  style={{ backgroundColor: "#0067b8" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* News Modal */}
        {showModal && selectedNews && (
          <NewsModal
            news={selectedNews}
            onClose={() => {
              setShowModal(false);
              setSelectedNews(null);
            }}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

export default News;

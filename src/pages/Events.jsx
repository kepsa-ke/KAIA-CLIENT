import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { AiOutlineSearch, AiOutlineClose, AiOutlineLink } from "react-icons/ai";
import {
  BiCalendar,
  BiHash,
  BiReset,
  BiTime,
  BiMap,
  BiWorld,
} from "react-icons/bi";
import {
  MdOutlineDateRange,
  MdOnlinePrediction,
  MdLocationOn,
} from "react-icons/md";
import {
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { HiOutlinePhotograph } from "react-icons/hi";
import { TfiLocationPin } from "react-icons/tfi";
import { GrLocation } from "react-icons/gr";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import YouTube from "react-youtube";
// Event Type Badge Component
const EventTypeBadge = ({ type }) => {
  const typeConfig = {
    online: {
      icon: FaVideo,
      text: "Online",
      bg: "#f3e8ff",
      textColor: "#6b21a8",
    },
    "in-person": {
      icon: FaMapMarkerAlt,
      text: "In Person",
      bg: "#dbeafe",
      textColor: "#1e40af",
    },
    hybrid: {
      icon: MdOnlinePrediction,
      text: "Hybrid",
      bg: "#fff3cd",
      textColor: "#856404",
    },
  };

  const config = typeConfig[type] || typeConfig["in-person"];
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.textColor }}
    >
      <Icon size={10} />
      {config.text}
    </span>
  );
};

// Event Status Badge Component
const EventStatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { bg: "#e6f0fa", text: "#1B12E8", label: "Upcoming" },
    ongoing: { bg: "#e0f2e9", text: "#0b5e42", label: "Ongoing" },
    past: { bg: "#fee2e2", text: "#991b1b", label: "Past" },
  };

  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
};

// Event Modal Component
const EventModal = ({ event, onClose, formatDate }) => {
  if (!event) return null;

  // Helper to extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : null;
  };

  // Helper to check if URL is a YouTube link
  const isYouTubeLink = (url) => {
    return getYouTubeVideoId(url) !== null;
  };

  // Video Player Component
  // Video Player Component
  const VideoPlayer = ({ url }) => {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const videoId = getYouTubeVideoId(url);

    if (!videoId) return null;

    const opts = {
      height: isEnlarged ? "500" : "315",
      width: "100%",
      playerVars: {
        autoplay: 0,
        rel: 0,
      },
    };

    return (
      <div className="mb-4">
        <div
          className={
            isEnlarged
              ? "fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              : ""
          }
        >
          <div className={isEnlarged ? "w-full max-w-4xl" : "w-full max-w-2xl"}>
            <YouTube
              videoId={videoId}
              opts={opts}
              className={isEnlarged ? "w-full" : ""}
            />

            <button
              onClick={() => setIsEnlarged(!isEnlarged)}
              className="mt-3 px-4 py-2 bg-[#1B12E8] text-white rounded-lg hover:bg-[#150FA0] transition-colors text-sm"
            >
              {isEnlarged ? "Close" : "Enlarge"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Track click when modal is opened
  useEffect(() => {
    const trackClick = async () => {
      try {
        await axios.post(`/events/${event._id}/click`);
      } catch (error) {
        console.error("Error tracking click:", error);
      }
    };
    trackClick();
  }, [event._id]);

  return (
    <div
      className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {event.image && (
          <div className="relative h-64 md:h-96 bg-gray-100">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Event+Image";
              }}
            />
            {/* Status Badge Overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <EventStatusBadge status={event.eventStatus} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "#1B12E8" }}
          >
            {event.title}
          </h2>

          {/* Organizer Info */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <div>
              <p className="text-xs text-gray-500">Organized by</p>
              <p className="text-sm font-medium text-gray-900">
                {event.createdBy?.organizationName || "Unknown Organization"}
              </p>
            </div>
          </div>

          {/* Event Type and Date Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <EventTypeBadge type={event.eventType} />
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <FaRegCalendarAlt />
                <span>{formatDate(event.startDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <BiTime className="text-gray-500" size={18} />
              <span className="text-sm text-gray-600">
                {moment(event.startDate).format("HH:mm")} -{" "}
                {moment(event.endDate).format("HH:mm")}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">About This Event</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Location Details */}
          {event.eventType !== "online" && event.location && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Location</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {event.location.venue && (
                  <p className="font-medium flex items-center gap-2">
                    <GrLocation className="text-gray-500" />
                    {event.location.venue}
                  </p>
                )}
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <TfiLocationPin className="text-gray-500" />
                  {[
                    event.location.address,
                    event.location.city,
                    event.location.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Show message for past events with meeting links */}
          {(event.eventType === "online" || event.eventType === "hybrid") &&
            event.meetingLink && (
              <div className="mb-6">
                {/* <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600">
                    This event has{" "}
                    {event.eventStatus === "past" ? "ended" : "been cancelled"}.
                    The meeting link is no longer available.
                  </p>
                </div> */}

                <h3 className="font-semibold mb-2 text-lg">
                  Meeting Information
                </h3>
                {event.eventStatus === "past" ||
                event.eventStatus === "ended" ? (
                  <p className="py-3 text-red-500">Event Ended</p>
                ) : (
                  <p></p>
                )}

                {/* <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B12E8] hover:underline"
                >
                  Access Link
                </a> */}

                {event.meetingLink?.includes("youtube.com") ||
                event.meetingLink?.includes("youtu.be") ? (
                  <VideoPlayer url={event.meetingLink} />
                ) : (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1B12E8] hover:underline"
                  >
                    Access Link
                  </a>
                )}
                {/* <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600">
                    This event has{" "}
                    {event.eventStatus === "past" ? "ended" : "been cancelled"}.
                    The meeting link is no longer available.
                  </p>
                </div> */}
              </div>
            )}

          {/* Contact Info */}
          {(event.contactEmail || event.contactPhone) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-lg">
                Contact Information
              </h3>
              <div className="space-y-2">
                {event.contactEmail && (
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center gap-2 text-[#1B12E8] hover:underline"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {event.contactEmail}
                  </a>
                )}
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="flex items-center gap-2 text-[#1B12E8] hover:underline"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {event.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* External Event Link */}
          {event.eventLink && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">More Information</h3>
              <a
                href={event.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <AiOutlineLink />
                Visit Event Page
              </a>
            </div>
          )}

          {/* Hashtags */}
          {event.hashtags && event.hashtags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {event.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: "#e6f0fa", color: "#1B12E8" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Views Counter */}
          <div className="flex items-center gap-2 text-sm text-gray-500 border-t pt-4">
            <FaEye />
            <span>{event.clicks || 0} people have viewed this event</span>
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
    </div>
  );
};

// Event Card Component
const EventCard = ({ item, onClick, formatDate }) => {
  const isPast = moment(item.endDate).isBefore(moment());
  const isOngoing = moment().isBetween(
    moment(item.startDate),
    moment(item.endDate),
  );

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/400x200?text=Event+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlinePhotograph size={48} className="text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <EventStatusBadge status={item.eventStatus} />
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <EventTypeBadge type={item.eventType} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2"
          style={{ color: "#1B12E8" }}
        >
          {item.title.length > 50
            ? `${item.title.substring(0, 50)}...`
            : item.title}
        </h3>

        {/* Organizer */}
        <p className="text-xs text-gray-500 mb-2">
          by {item.createdBy?.organizationName || "Unknown"}
        </p>

        {/* Date and Time */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <BiCalendar className="flex-shrink-0" />
            <span>{formatDate(item.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <BiTime className="flex-shrink-0" />
            <span>
              {moment(item.startDate).format("HH:mm")} -{" "}
              {moment(item.endDate).format("HH:mm")}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-xs text-gray-600 mb-3">
          {item.eventType === "online" ? (
            <>
              <FaVideo className="flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">Online Event</span>
            </>
          ) : (
            <>
              <TfiLocationPin className="flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                {item.location?.venue || item.location?.city || "Location TBA"}
              </span>
            </>
          )}
        </div>

        {/* Hashtags */}
        {item.hashtags && item.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {item.hashtags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: "#e6f0fa", color: "#1B12E8" }}
              >
                #{tag}
              </span>
            ))}
            {item.hashtags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{item.hashtags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Views Counter */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
          <FaEye size={10} />
          <span>{item.clicks || 0} views</span>
        </div>
      </div>
    </div>
  );
};

// Main Events Component
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Refs for search debounce
  const searchTimeout = useRef(null);

  // Fetch events with filters
  const fetchEvents = async (pageNum = 1, isNewSearch = false) => {
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

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.append("eventType", typeFilter);
      }

      const { data } = await axios.get(`/events?${params.toString()}`);

      if (isNewSearch) {
        setEvents(data.data || []);
      } else {
        setEvents((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setLoading(false);

      // Fetch hashtags for filter dropdown (only once)
      if (availableHashtags.length === 0) {
        fetchHashtags();
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
      setLoading(false);
    }
  };

  // Fetch all hashtags for filter dropdown
  const fetchHashtags = async () => {
    try {
      const { data } = await axios.get("/events/hashtags/all");
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
      fetchEvents(1, true);
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
    fetchEvents(1, true);
  }, [
    selectedHashtag,
    startDate,
    endDate,
    debouncedSearch,
    statusFilter,
    typeFilter,
  ]);

  // Load more for infinite scroll
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedHashtag("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
    fetchEvents(1, true);
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  // Handle card click
  const handleCardClick = (item) => {
    setSelectedEvent(item);
    setShowModal(true);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchText) count++;
    if (selectedHashtag) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (statusFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white  shadow-sm mt-[3em] mb-[3em]  px-4 lg:px-18">
        <div className="container mx-auto px-4 py-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 mt-[1em]"
            style={{ color: "#1B12E8" }}
          >
            Events
          </h1>
          <p className="text-gray-600">
            Discover and join exciting events happening near you and online
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
                  placeholder="Search events by title, description, or hashtags..."
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
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Event Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Event Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Types</option>
                    <option value="online">Online</option>
                    <option value="in-person">In Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Hashtag Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Filter by Hashtag
                  </label>
                  <select
                    value={selectedHashtag}
                    onChange={(e) => setSelectedHashtag(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Hashtags</option>
                    {availableHashtags.map((tag) => (
                      <option key={tag} value={tag}>
                        #{tag}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      From
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
                      To
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
            Showing <span className="font-semibold">{events.length}</span>{" "}
            events
          </p>
        </div>

        {/* Events Grid with Infinite Scroll */}
        <InfiniteScroll
          dataLength={events.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-8">
              <Spinner message="Loading more events..." />
            </div>
          }
          endMessage={
            events.length > 0 && (
              <p className="text-center text-gray-500 py-8">
                You've reached the end! No more events to load.
              </p>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((item) => (
              <EventCard
                key={item._id}
                item={item}
                onClick={handleCardClick}
                formatDate={formatDate}
              />
            ))}
          </div>
        </InfiniteScroll>

        {/* Loading State */}
        {loading && events.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <Spinner message="Loading events..." />
          </div>
        )}

        {/* No Results */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <HiOutlinePhotograph
              size={64}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {getActiveFilterCount() > 0
                ? "No events match your filters. Try adjusting your search criteria."
                : "There are no events available at the moment. Check back later!"}
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

        {/* Event Modal */}
        {showModal && selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => {
              setShowModal(false);
              setSelectedEvent(null);
            }}
            formatDate={formatDate}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Events;

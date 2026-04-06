import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaLink,
  FaHashtag,
  FaMapMarkerAlt,
  FaClock,
  FaVideo,
  FaUserFriends,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import {
  AiOutlineLink,
  AiOutlineClose,
  AiOutlineCalendar,
} from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import { TfiLocationPin } from "react-icons/tfi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "../axios";
import moment from "moment";

const EventsCarousel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const autoPlayRef = useRef(null);

  const AUTO_PLAY_DELAY = 10000;

  useEffect(() => {
    fetchRecentEvents();
    return () => clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    if (events.length > 1) startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [events.length]);

  const fetchRecentEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/events/recent");
      setEvents(res.data.data);
      preloadImages(res.data.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const preloadImages = (items) => {
    items.forEach((item, index) => {
      const img = new Image();
      img.src = item.image;
      img.onload = () =>
        setImagesLoaded((prev) => ({ ...prev, [index]: true }));
      img.onerror = () =>
        setImagesLoaded((prev) => ({ ...prev, [index]: true }));
    });
  };

  const startAutoPlay = () => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      paginate(1);
    }, AUTO_PLAY_DELAY);
  };

  const pauseAutoPlay = () => clearInterval(autoPlayRef.current);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return events.length - 1;
      if (next >= events.length) return 0;
      return next;
    });
  };

  const handleDotClick = (idx) => {
    pauseAutoPlay();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
    setTimeout(startAutoPlay, 8000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "past":
        return "bg-gray-400";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "online":
        return <FaVideo />;
      case "in-person":
        return <FaUserFriends />;
      case "hybrid":
        return <FaGlobe />;
      default:
        return <FaCalendar />;
    }
  };

  const formatEventDate = (event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} • ${start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Different days
    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const getDaysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isEventActive = (event) => {
    return event.eventStatus !== "past" && event.eventStatus !== "cancelled";
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-[#0067b8] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="w-full py-12 text-center text-gray-500">
        No recent events available
      </div>
    );
  }

  const currentEvent = events[currentIndex];
  const daysUntil = getDaysUntil(currentEvent.startDate);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h2
        className="mb-3 text-center text-3xl font-bold text-gray-900"
        style={{ lineHeight: "1.4em" }}
      >
        Recent Events
      </h2>

      {/* View All Events Button */}
      <div className="flex justify-center mt-6 mb-8">
        <Link
          to="/events"
          className="bg-[#0067b8] text-white py-2 px-6 rounded-lg hover:bg-[#005599] transition-colors inline-flex items-center"
        >
          View All Events
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        onMouseEnter={pauseAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 120, damping: 20 },
              opacity: { duration: 0.25 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -100 || velocity.x < -500) paginate(1);
              if (offset.x > 100 || velocity.x > 500) paginate(-1);
            }}
            className="bg-gradient-to-br from-white to-gray-50 min-h-[600px]"
          >
            {/* Image Section */}
            <div className="relative h-56 md:h-72 lg:h-96 w-full bg-gray-100 overflow-hidden">
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/api/placeholder/800/400";
                }}
                style={{
                  opacity: imagesLoaded[currentIndex] ? 1 : 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
              {!imagesLoaded[currentIndex] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`${getStatusColor(currentEvent.eventStatus)} px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg`}
                >
                  {currentEvent.eventStatus?.charAt(0).toUpperCase() +
                    currentEvent.eventStatus?.slice(1)}
                </span>
              </div>

              {/* Event Type Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[#0067b8] text-sm font-medium shadow-lg flex items-center gap-2">
                  {getEventTypeIcon(currentEvent.eventType)}
                  <span>{currentEvent.eventType}</span>
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col min-h-[280px]">
              {/* Title */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {currentEvent.title}
              </h2>

              <div className="mb-8">
                {/* Description - Truncated */}
                <p className="text-gray-600 ">
                  {currentEvent.description.length > 150
                    ? currentEvent.description.substring(0, 150) + "..."
                    : currentEvent.description}{" "}
                  {/* Read More Button */}
                  <button
                    onClick={() => setSelectedEvent(currentEvent)}
                    className="text-[#0067b8] font-semibold hover:text-[#005599] hover:underline text-left"
                  >
                    Read More
                  </button>
                </p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <div className="text-[#0067b8] mt-1">
                    <FaCalendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </p>
                    <p className="text-sm font-medium">
                      {formatEventDate(currentEvent)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {currentEvent.eventType !== "online" && (
                  <div className="flex items-start space-x-3">
                    <div className="text-[#0067b8] mt-1">
                      <FaMapMarkerAlt size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Location
                      </p>

                      <p className="text-sm font-medium">
                        {currentEvent.location.venue &&
                          `${currentEvent.location.venue}, `}
                        {currentEvent.location.city},{" "}
                        {currentEvent.location.country}
                      </p>
                    </div>
                  </div>
                )}

                {/* Days until/Event status */}
                {currentEvent.eventStatus !== "past" &&
                  currentEvent.eventStatus !== "cancelled" && (
                    <div className="flex items-start space-x-3">
                      <div className="text-[#0067b8] mt-1">
                        <FaClock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {currentEvent.eventStatus === "ongoing"
                            ? "Ends in"
                            : "Starts in"}
                        </p>
                        <p className="text-sm font-medium">
                          {currentEvent.eventStatus === "ongoing"
                            ? `${Math.max(0, getDaysUntil(currentEvent.endDate))} days`
                            : daysUntil <= 0
                              ? "Today"
                              : `${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Hashtags */}
                {currentEvent.hashtags?.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="text-[#0067b8] mt-1">
                      <FaHashtag size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentEvent.hashtags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info (Optional) */}
              {(currentEvent.contactEmail || currentEvent.contactPhone) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Contact
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {currentEvent.contactEmail && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEnvelope className="mr-2 text-[#0067b8]" size={14} />
                        <a
                          href={`mailto:${currentEvent.contactEmail}`}
                          className="hover:text-[#0067b8]"
                        >
                          {currentEvent.contactEmail}
                        </a>
                      </div>
                    )}
                    {currentEvent.contactPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="mr-2 text-[#0067b8]" size={14} />
                        <span>{currentEvent.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer with Organization and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-auto">
                {/* Organization */}
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {currentEvent.createdBy?.organizationName ||
                        "Organization"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {events.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all z-10"
            >
              <FaChevronLeft className="text-gray-800" />
            </button>

            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all z-10"
            >
              <FaChevronRight className="text-gray-800" />
            </button>
          </>
        )}

        {/* Progress Indicators */}
        <div className="flex justify-center pb-6 gap-2">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className="group focus:outline-none"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-[#0067b8]"
                    : "w-2 bg-gray-300 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        formatDate={formatEventDate}
      />
    </div>
  );
};

// Event Status Badge Component
const EventStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "past":
        return "bg-gray-400";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <span
      className={`${getStatusColor(status)} px-3 py-1 rounded-full text-white text-xs font-medium`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Event Type Badge Component
const EventTypeBadge = ({ type }) => {
  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "online":
        return <FaVideo />;
      case "in-person":
        return <FaUserFriends />;
      case "hybrid":
        return <FaGlobe />;
      default:
        return <FaCalendar />;
    }
  };

  return (
    <span className="flex items-center gap-2 text-sm text-[#0067b8]">
      {getEventTypeIcon(type)}
      <span>{type}</span>
    </span>
  );
};

// Event Modal Component
const EventModal = ({ event, onClose, formatDate }) => {
  if (!event) return null;

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

  const isEventActive = () => {
    return event.eventStatus !== "past" && event.eventStatus !== "cancelled";
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition z-10"
            >
              <AiOutlineClose size={20} />
            </button>

            {/* Image */}
            {event.image && (
              <div className="relative h-64 md:h-96 bg-gray-100">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/800x400?text=Event+Image";
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Status Badge Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <EventStatusBadge status={event.eventStatus} />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Organizer Info */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <div>
                  {/* Title Overlay */}
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-2">
                      {event.title}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500">Organized by</p>
                  <p className="text-sm font-medium text-gray-900">
                    {event.createdBy?.organizationName ||
                      "Unknown Organization"}
                  </p>
                </div>
              </div>

              {/* Event Type and Date Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <EventTypeBadge type={event.eventType} />
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FaRegCalendarAlt />
                    <span>{formatDate(event)}</span>
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
                <h3 className="font-semibold mb-2 text-lg">About This Event</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Location Details */}
              {event.eventType !== "online" && event.location && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-lg">Location</h3>
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

              {/* Online/Hybrid Links - Only show if event is active and has meeting link */}
              {(event.eventType === "online" || event.eventType === "hybrid") &&
                event.meetingLink &&
                isEventActive() && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-lg">Join Online</h3>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0067b8] text-white rounded-lg hover:bg-[#005599] transition-colors font-medium"
                    >
                      <FaVideo />
                      Acess Details
                    </a>
                  </div>
                )}

              {/* Show message for past events with meeting links */}
              {(event.eventType === "online" || event.eventType === "hybrid") &&
                event.meetingLink &&
                !isEventActive() && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-lg">
                      Meeting Information
                    </h3>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-gray-600">
                        This event has{" "}
                        {event.eventStatus === "past"
                          ? "ended"
                          : "been cancelled"}
                        . The meeting link is no longer available.
                      </p>
                    </div>
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
                        className="flex items-center gap-2 text-[#0067b8] hover:underline"
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
                        className="flex items-center gap-2 text-[#0067b8] hover:underline"
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
                  <h3 className="font-semibold mb-2 text-lg">
                    More Information
                  </h3>
                  <a
                    href={event.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#0067b8] hover:underline"
                  >
                    <AiOutlineLink />
                    Visit Event Page
                  </a>
                </div>
              )}

              {/* Hashtags */}
              {event.hashtags && event.hashtags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-lg">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: "#e6f0fa", color: "#0067b8" }}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventsCarousel;

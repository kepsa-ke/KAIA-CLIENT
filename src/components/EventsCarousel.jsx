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
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "../axios";

const EventsCarousel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
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

              {/* Description */}
              <p className="text-gray-600 mb-6 line-clamp-2">
                {currentEvent.description}
              </p>

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
                {currentEvent.location && (
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
    </div>
  );
};

export default EventsCarousel;

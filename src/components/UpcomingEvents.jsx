import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaVideo,
  FaUserFriends,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaHashtag,
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

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/events/upcoming");
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-[#1FA85C]";
      case "upcoming":
        return "bg-[#1b12e8]";
      case "past":
        return "bg-[#2A2A3D]";
      case "cancelled":
        return "bg-[#E0182B]";
      default:
        return "bg-[#2A2A3D]";
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
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        {/* <h2
          className="  mb-3  text-center blueHeaderText"
          style={{
            lineHeight: "1.4em",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Upcoming Events
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Don't miss out on these exciting upcoming events
        </p> */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FaCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Upcoming Events
          </h3>
          <p className="text-gray-500 mb-6">
            There are no upcoming events scheduled at this time. Please check
            back later for new events.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-[#1b12e8]  font-medium"
          >
            View All Events
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* <h2
        className="  mb-3  text-center text-[#1b12e8] text-[30px] font-semibold"
        style={{ lineHeight: "1.4em", fontFamily: "Space Grotesk, sans-serif" }}
      >
        Upcoming Events
      </h2>
      <p className="text-center text-[#2A2A3D] mb-8">
        Don't miss out on these exciting upcoming events
      </p> */}

      {/* View All Events Button */}
      {/* <div className="flex justify-center mb-8">
        <Link
          to="/events"
          className="bg-[#1b12e8] text-white py-2 px-6 rounded-lg transition-colors inline-flex items-center"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          View All Events
        </Link>
      </div> */}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            onClick={() => setSelectedEvent(event)}
          >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = "/api/placeholder/400/300";
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`${getStatusColor(event.eventStatus)} px-3 py-1 rounded-full text-white text-xs font-medium shadow-lg`}
                >
                  {event.eventStatus?.charAt(0).toUpperCase() +
                    event.eventStatus?.slice(1)}
                </span>
              </div>

              {/* Days Until Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                  {getDaysUntil(event.startDate) <= 0
                    ? "Today"
                    : `${getDaysUntil(event.startDate)} days left`}
                </span>
              </div>

              {/* Event Type Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[#1b12e8] text-xs font-medium shadow-lg flex items-center gap-1">
                  {getEventTypeIcon(event.eventType)}
                  <span>{event.eventType}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Title */}
              <h3
                className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {event.title.length > 38
                  ? event.title.substring(0, 38) + "..."
                  : event.title}
              </h3>

              {/* Read More Button */}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                }}
                className="text-[#1b12e8] font-semibold  hover:underline text-sm mb-3"
              >
                Read More
              </button> */}

              {/* Basic Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendar
                    className="text-[#1b12e8] flex-shrink-0"
                    size={12}
                  />
                  <span className="text-xs line-clamp-1">
                    {formatEventDate(event)}
                  </span>
                </div>

                {event.eventType !== "online" && event.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt
                      className="text-[#1b12e8] flex-shrink-0"
                      size={12}
                    />
                    <span className="text-xs line-clamp-1">
                      {event.location.venue || event.location.city}
                    </span>
                  </div>
                )}

                {event.hashtags?.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaHashtag
                      className="text-[#1b12e8] flex-shrink-0"
                      size={12}
                    />
                    <div className="flex flex-wrap gap-1">
                      {event.hashtags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                      {event.hashtags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{event.hashtags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
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
        return "bg-[#1FA85C]";
      case "upcoming":
        return "bg-[#1b12e8]";
      case "past":
        return "bg-[#2A2A3D]";
      case "cancelled":
        return "bg-[#E0182B]";
      default:
        return "bg-[#2A2A3D]";
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
  useEffect(() => {
    if (event) {
      const trackClick = async () => {
        try {
          await axios.post(`/events/${event._id}/click`);
        } catch (error) {
          console.error("Error tracking click:", error);
        }
      };
      trackClick();
    }
  }, [event]);

  if (!event) return null;

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
                  className="w-full h-full object-contain"
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
                    <h2
                      className="text-2xl md:text-4xl font-bold text-black mb-2"
                      style={{
                        lineHeight: "1.4em",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
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
                <h3
                  className="font-semibold mb-2 text-lg"
                  style={{
                    lineHeight: "1.4em",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  About This Event
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Location Details */}
              {event.eventType !== "online" && event.location && (
                <div className="mb-6">
                  <h3
                    className="font-semibold mb-2 text-lg"
                    style={{
                      lineHeight: "1.4em",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    Location
                  </h3>
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
                    <h3
                      className="font-semibold mb-2 text-lg"
                      style={{
                        lineHeight: "1.4em",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      Join Online
                    </h3>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b12e8] text-white rounded-lg  transition-colors font-medium"
                    >
                      <FaVideo />
                      Access Details
                    </a>
                  </div>
                )}

              {/* Show message for past events with meeting links */}
              {(event.eventType === "online" || event.eventType === "hybrid") &&
                event.meetingLink &&
                !isEventActive() && (
                  <div className="mb-6">
                    <h3
                      className="font-semibold mb-2 text-lg"
                      style={{
                        lineHeight: "1.4em",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
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
                  <h3
                    className="font-semibold mb-2 text-lg"
                    style={{
                      lineHeight: "1.4em",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
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
                  <h3
                    className="font-semibold mb-2 text-lg"
                    style={{
                      lineHeight: "1.4em",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
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
                  <h3
                    className="font-semibold mb-2 text-lg"
                    style={{
                      lineHeight: "1.4em",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    Hashtags
                  </h3>
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpcomingEvents;

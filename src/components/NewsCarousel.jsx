import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaLink,
  FaHashtag,
  FaTimes,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "../axios";
import { Link } from "react-router-dom";

const NewsCarousel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [selectedNews, setSelectedNews] = useState(null);
  const autoPlayRef = useRef(null);

  const AUTO_PLAY_DELAY = 10000;

  useEffect(() => {
    fetchRecentNews();
    return () => clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    if (news.length > 1) startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [news.length]);

  const fetchRecentNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/news/recent");
      setNews(res.data.data);
      preloadImages(res.data.data);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  const preloadImages = (items) => {
    items.forEach((item, index) => {
      const img = new Image();
      img.src = getImageUrl(item);
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
      if (next < 0) return news.length - 1;
      if (next >= news.length) return 0;
      return next;
    });
  };

  const handleDotClick = (idx) => {
    pauseAutoPlay();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
    setTimeout(startAutoPlay, 8000);
  };

  const getImageUrl = (item) =>
    item.imageUrl || item.image || "/api/placeholder/800/400";

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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

  if (!news.length) {
    return (
      <div className="w-full py-12 text-center text-gray-500">
        No recent news available
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h2
        className="  mb-3  text-center blueHeaderText"
        style={{ lineHeight: "1.4em" }}
      >
        News & Updates
      </h2>

      {/* animated button to view all news */}
      <div className="flex justify-center mt-6 mb-8">
        <button className="bg-[#0067b8] text-white py-2 px-4 rounded-lg hover:bg-[#005599] transition-colors">
          <Link to="/news">View All News</Link>
        </button>
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
            className="bg-gradient-to-br from-white to-gray-50 min-h-[520px]"
          >
            {/* IMAGE */}
            <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gray-100 overflow-hidden">
              <img
                src={getImageUrl(news[currentIndex])}
                alt={news[currentIndex].title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* CONTENT */}
            <div className="p-6 md:p-8 flex flex-col min-h-[320px]">
              {/* META */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaCalendar className="mr-2" />
                  <span className="text-sm">
                    {formatDate(news[currentIndex].publishedAt)}
                  </span>
                </div>

                {news[currentIndex].hashtags?.length > 0 && (
                  <div className="flex items-center text-[#0067b8]">
                    <FaHashtag className="mr-2" />
                    {news[currentIndex].hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-sm mr-2">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* TITLE */}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 line-clamp-2">
                {news[currentIndex].title}
              </h2>

              {/* CONTENT */}
              <p className="text-gray-600 mb-4 flex-grow">
                {news[currentIndex].body.length > 120
                  ? news[currentIndex].body.substring(0, 120) + "..."
                  : news[currentIndex].body}{" "}
                {/* READ MORE BUTTON */}
                <button
                  onClick={() => setSelectedNews(news[currentIndex])}
                  className="text-[#0067b8] font-semibold hover:text-[#005599] hover:underline mb-4 text-left"
                >
                  Read More
                </button>
              </p>

              {/* FOOTER */}
              <div className="flex justify-between items-center border-t pt-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {news[currentIndex].createdBy?.organizationName ||
                        "Unknown Organization"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ARROWS */}
        {news.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg"
            >
              <FaChevronLeft />
            </button>

            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* DOTS */}
        <div className="flex justify-center mt-6 gap-2 ">
          {news.map((_, idx) => (
            <button key={idx} onClick={() => handleDotClick(idx)}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-[#0067b8]" : "w-2 bg-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* NEWS DETAIL MODAL */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header with Image */}
              <div className="relative h-64 w-full bg-gray-100">
                <img
                  src={getImageUrl(selectedNews)}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>

                {/* Title Overlay */}
                {/* <div className="absolute bottom-0 left-0 right-0 p-6">
                  
                </div> */}
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Organization Info */}
                <div className="flex items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                      {selectedNews.title}
                    </h2>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-black">
                      <div className="flex items-center">
                        <FaCalendar className="mr-2" size={14} />
                        <span className="text-sm">
                          {formatDate(selectedNews.publishedAt)}
                        </span>
                      </div>

                      {selectedNews.hashtags?.length > 0 && (
                        <div className="flex items-center ">
                          {/* <FaHashtag className="mr-2" size={14} /> */}
                          {selectedNews.hashtags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="text-sm mr-2">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      Posted by:{" "}
                      {selectedNews.createdBy?.organizationName ||
                        "Unknown Organization"}
                    </p>
                  </div>
                </div>

                {/* Full Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.body}
                  </p>
                </div>

                {/* External Link if available */}
                {selectedNews.externalLink && (
                  <div className="mt-6 pt-4 border-t">
                    <a
                      href={selectedNews.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#0067b8] hover:text-[#005599] font-semibold"
                    >
                      Read original article
                      <FaExternalLinkAlt className="ml-2" size={14} />
                    </a>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsCarousel;

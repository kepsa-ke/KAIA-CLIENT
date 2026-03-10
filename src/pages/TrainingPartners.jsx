import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineLink,
  AiOutlineStar,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import {
  BiCalendar,
  BiHash,
  BiReset,
  BiMap,
  BiWorld,
  BiLink,
} from "react-icons/bi";
import {
  MdOutlineDateRange,
  MdVerified,
  MdLocationOn,
  MdAttachEmail,
  MdPhone,
} from "react-icons/md";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaRegCalendarAlt,
  FaHashtag,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaGlobe,
  FaStar,
} from "react-icons/fa";
import { HiOutlinePhotograph, HiOutlineOfficeBuilding } from "react-icons/hi";
import { TfiLocationPin } from "react-icons/tfi";
import { GrLocation } from "react-icons/gr";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import Navbar from "../components/Navbar";

// Verification Badge Component
const VerificationBadge = ({ verified }) => {
  if (!verified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-blue-600"
      title="Verified Partner"
    >
      <MdVerified size={16} />
    </span>
  );
};

// Featured Badge Component
const FeaturedBadge = ({ featured }) => {
  if (!featured) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-yellow-600"
      title="Featured Partner"
    >
      <FaStar size={16} />
    </span>
  );
};

// Partner Modal Component
const PartnerModal = ({ partner, onClose }) => {
  if (!partner) return null;

  // Track view when modal is opened
  useEffect(() => {
    const trackView = async () => {
      try {
        // This endpoint would increment view count
        await axios.get(`/training-partners/${partner._id}`);
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };
    trackView();
  }, [partner._id]);

  // Track website click
  const handleWebsiteClick = async () => {
    try {
      await axios.post(`/training-partners/${partner._id}/track-click`);
      window.open(partner.website, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
      window.open(partner.website, "_blank", "noopener,noreferrer");
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
        {/* Cover Image */}
        {partner.coverImage && (
          <div className="relative h-48 md:h-64 bg-gray-100">
            <img
              src={partner.coverImage}
              alt={partner.organizationName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/1200x400?text=Cover+Image";
              }}
            />
          </div>
        )}
        <div className="my-[4em]" />

        {/* Header with Logo */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 mb-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.organizationName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/200?text=Logo";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <HiOutlineOfficeBuilding
                    size={40}
                    className="text-gray-400"
                  />
                </div>
              )}
            </div>

            {/* Organization Name and Badges */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: "#0067b8" }}
                >
                  {partner.organizationName}
                </h2>
                <VerificationBadge verified={partner.verified} />
                <FeaturedBadge featured={partner.featured} />
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {partner.headquarters?.city && (
                  <span className="flex items-center gap-1">
                    <TfiLocationPin className="text-gray-400" />
                    {partner.headquarters.city}
                    {partner.headquarters.country &&
                      `, ${partner.headquarters.country}`}
                  </span>
                )}
                {partner.founded && (
                  <span className="flex items-center gap-1">
                    <FaRegCalendarAlt className="text-gray-400" />
                    Est. {partner.founded}
                  </span>
                )}
                {partner.teamSize && (
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-gray-400" />
                    {partner.teamSize} employees
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: "#0067b8" }}
                >
                  About
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {partner.about}
                </div>
              </div>

              {/* Impact */}
              <div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: "#0067b8" }}
                >
                  Impact So Far
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {partner.impact}
                </div>
              </div>

              {/* Courses */}
              {partner.courses?.length > 0 && (
                <div>
                  <h3
                    className="font-semibold text-lg mb-3"
                    style={{ color: "#0067b8" }}
                  >
                    Featured Courses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partner.courses.map((course, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition"
                      >
                        {course.image && (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/300x150?text=Course";
                            }}
                          />
                        )}
                        <div className="p-3">
                          <h4 className="font-medium mb-1">{course.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {course.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            {course.duration && (
                              <span className="text-gray-500">
                                {course.duration}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {course.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details & Contact */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: "#0067b8" }}>
                  More Information
                </h3>
                <div className="space-y-3">
                  {/* Website - PROMINENT BUTTON */}
                  {partner.website && (
                    <button
                      onClick={handleWebsiteClick}
                      className="w-full bg-[#0067b8] text-white py-3 px-4 rounded-lg hover:bg-[#005299] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                      <FaGlobe size={18} />
                      Visit Website
                      <AiOutlineLink size={18} />
                    </button>
                  )}

                  {/* Email */}
                  {/* {partner.email && (
                    <a
                      href={`mailto:${partner.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MdAttachEmail className="flex-shrink-0" />
                      <span className="text-sm truncate">{partner.email}</span>
                    </a>
                  )} */}

                  {/* Phone */}
                  {/* {partner.phone && (
                    <a
                      href={`tel:${partner.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MdPhone className="flex-shrink-0" />
                      <span className="text-sm">{partner.phone}</span>
                    </a>
                  )} */}
                </div>
              </div>

              {/* Specialties */}
              {partner.specialties?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#0067b8" }}
                  >
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.specialties.map((specialty, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Regions */}
              {partner.regions?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#0067b8" }}
                  >
                    Regions Served
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.regions.map((region, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {Object.values(partner.socialLinks || {}).some(Boolean) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#0067b8" }}
                  >
                    Connect With Us
                  </h3>
                  <div className="flex gap-3">
                    {partner.socialLinks?.linkedin && (
                      <a
                        href={partner.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:scale-110 transition"
                      >
                        <FaLinkedin size={24} />
                      </a>
                    )}
                    {partner.socialLinks?.twitter && (
                      <a
                        href={partner.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:scale-110 transition"
                      >
                        <FaTwitter size={24} />
                      </a>
                    )}
                    {partner.socialLinks?.facebook && (
                      <a
                        href={partner.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:scale-110 transition"
                      >
                        <FaFacebook size={24} />
                      </a>
                    )}
                    {partner.socialLinks?.instagram && (
                      <a
                        href={partner.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:scale-110 transition"
                      >
                        <FaInstagram size={24} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {partner.hashtags?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#0067b8" }}
                  >
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.hashtags.map((tag, i) => (
                      <span key={i} className="text-sm text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span className="flex items-center gap-1">
                  <FaEye size={14} />
                  {partner.viewCount || 0} profile views
                </span>
              </div>
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
    </div>
  );
};

// Partner Card Component
const PartnerCard = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full group"
    >
      {/* Cover/Logo Area */}
      <div className="relative h-32 bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.organizationName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x150?text=Cover";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineOfficeBuilding size={40} className="text-gray-400" />
          </div>
        )}

        {/* Logo Overlay */}
        <div className="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.organizationName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100?text=Logo";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <FaBuilding size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.verified && (
            <span className="bg-blue-600 text-white p-1 rounded-full">
              <MdVerified size={14} />
            </span>
          )}
          {item.featured && (
            <span className="bg-yellow-500 text-white p-1 rounded-full">
              <FaStar size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 flex-1 flex flex-col">
        {/* Organization Name */}
        <h3
          className="font-semibold text-lg mb-1 line-clamp-1"
          style={{ color: "#0067b8" }}
        >
          {item.organizationName}
        </h3>

        {/* Location */}
        {item.headquarters?.city && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <TfiLocationPin size={12} />
            <span className="line-clamp-1">
              {item.headquarters.city}
              {item.headquarters.country && `, ${item.headquarters.country}`}
            </span>
          </div>
        )}

        {/* About Excerpt */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {item.about || "No description available."}
        </p>

        {/* Specialties */}
        {item.specialties && item.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.specialties.slice(0, 2).map((specialty, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
              >
                {specialty}
              </span>
            ))}
            {item.specialties.length > 2 && (
              <span className="text-xs text-gray-500">
                +{item.specialties.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <FaUsers size={12} />
            {item.teamSize || "N/A"}
          </span>
          <span className="flex items-center gap-1">
            <FaEye size={12} />
            {item.viewCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Training Partners Component
const TrainingPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Refs for search debounce
  const searchTimeout = useRef(null);

  // Fetch partners with filters
  const fetchPartners = async (pageNum = 1, isNewSearch = false) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (selectedSpecialty) {
        params.append("specialty", selectedSpecialty);
      }

      if (selectedRegion) {
        params.append("region", selectedRegion);
      }

      if (selectedHashtag) {
        params.append("hashtag", selectedHashtag);
      }

      if (verifiedOnly) {
        params.append("verified", "true");
      }

      const { data } = await axios.get(
        `/training-partners?${params.toString()}`,
      );

      if (isNewSearch) {
        setPartners(data.data || []);
      } else {
        setPartners((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setLoading(false);

      // Fetch filter options (only once)
      if (availableSpecialties.length === 0) {
        fetchFilterOptions();
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load training partners");
      setLoading(false);
    }
  };

  // Fetch all filter options
  const fetchFilterOptions = async () => {
    try {
      const { data } = await axios.get("/training-partners/filters/options");
      setAvailableSpecialties(data.data.specialties || []);
      setAvailableRegions(data.data.regions || []);
      setAvailableHashtags(data.data.hashtags || []);
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
      fetchPartners(1, true);
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
    fetchPartners(1, true);
  }, [
    selectedSpecialty,
    selectedRegion,
    selectedHashtag,
    debouncedSearch,
    verifiedOnly,
    featuredOnly,
  ]);

  // Load more for infinite scroll
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPartners(nextPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedSpecialty("");
    setSelectedRegion("");
    setSelectedHashtag("");
    setVerifiedOnly(false);
    setFeaturedOnly(false);
    setPage(1);
    fetchPartners(1, true);
  };

  // Handle card click
  const handleCardClick = (item) => {
    setSelectedPartner(item);
    setShowModal(true);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchText) count++;
    if (selectedSpecialty) count++;
    if (selectedRegion) count++;
    if (selectedHashtag) count++;
    if (verifiedOnly) count++;
    if (featuredOnly) count++;
    return count;
  };

  // Filter featured partners for display
  const featuredPartners = partners.filter((p) => p.featured).slice(0, 3);

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
            Training Partners
          </h1>
          <p className="text-gray-600">
            Discover leading training organizations and their programs
          </p>
        </div>
      </div>

      {/* Featured Partners Section */}
      {featuredPartners.length > 0 && (
        <div className="container mx-auto max-w-7xl px-4 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Featured Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPartners.map((partner) => (
              <div
                key={partner._id}
                onClick={() => handleCardClick(partner)}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.organizationName}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  ) : (
                    <FaBuilding size={24} className="text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {partner.organizationName}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {partner.specialties?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  placeholder="Search training partners by name, specialties, or hashtags..."
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
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Specialties</option>
                    {availableSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Regions</option>
                    {availableRegions.map((region) => (
                      <option key={region} value={region}>
                        {region.charAt(0).toUpperCase() + region.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hashtag Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Hashtag
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

                {/* Status Filters */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                    />
                    <span className="text-sm text-gray-700">
                      Verified Partners Only
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                    />
                    <span className="text-sm text-gray-700">
                      Featured Partners Only
                    </span>
                  </label>
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
            Showing <span className="font-semibold">{partners.length}</span>{" "}
            training partners
          </p>
        </div>

        {/* Partners Grid with Infinite Scroll */}
        <InfiniteScroll
          dataLength={partners.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-8">
              <Spinner message="Loading more partners..." />
            </div>
          }
          endMessage={
            partners.length > 0 && (
              <p className="text-center text-gray-500 py-8">
                You've reached the end! No more partners to load.
              </p>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((item) => (
              <PartnerCard
                key={item._id}
                item={item}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </InfiniteScroll>

        {/* Loading State */}
        {loading && partners.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <Spinner message="Loading training partners..." />
          </div>
        )}

        {/* No Results */}
        {!loading && partners.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <HiOutlineOfficeBuilding
              size={64}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Partners Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {getActiveFilterCount() > 0
                ? "No training partners match your filters. Try adjusting your search criteria."
                : "There are no training partners available at the moment."}
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

        {/* Partner Modal */}
        {showModal && selectedPartner && (
          <PartnerModal
            partner={selectedPartner}
            onClose={() => {
              setShowModal(false);
              setSelectedPartner(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrainingPartners;

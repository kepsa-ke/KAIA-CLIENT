import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { PiHandsClappingDuotone } from "react-icons/pi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaGlobe,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaHandshake,
  FaUsers,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import Navbar from "./Navbar";

const JoinForm = () => {
  const [firstName, setFirstName] = useState("");
  const [surName, setsurName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      if (
        !firstName ||
        !surName ||
        !role ||
        !email ||
        !phone ||
        !organizationName ||
        !website ||
        !category
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
      setLoading(true);
      let dataToSend = {
        firstName: firstName.trim(),
        surName: surName.trim(),
        role: role.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        organizationName: organizationName.trim(),
        website: website.trim(),
        category: category.trim(),
      };
      const response = await axios.post("/members", dataToSend);
      if (response.data) {
        setLoading(false);
        setSubmitted(true);
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      setLoading(false);
      let errorMessage = "Failed to submit application";

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 400) {
          if (error.response.data.message?.includes("email")) {
            errorMessage = "Email address is already registered";
          } else if (error.response.data.message?.includes("organization")) {
            errorMessage = "Organization name is already registered";
          } else if (error.response.data.message?.includes("Invalid email")) {
            errorMessage = "Please enter a valid email address";
          }
        } else if (error.response.status === 409) {
          errorMessage = "This member already exists";
        }
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ECONNABORTED"
      ) {
        errorMessage = "Network error. Please check your internet connection";
      } else if (error.request) {
        errorMessage = "No response from server. Please try again";
      }

      toast.error(errorMessage);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <PiHandsClappingDuotone className="text-5xl text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
          Application Submitted!
        </h2>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Thank you for your interest in joining the Kenya AI Skilling Alliance.
          Our team will review your application and reach out soon.
        </p>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
          <FaCheckCircle />
          <span className="text-sm font-medium">Under Review</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendRequest} className="space-y-5">
      {/* Organization Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
          <FaBuilding className="text-[#0067b8]" size={14} />
          Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Your organization name"
          required
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
      </div>

      {/* Website */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
          <FaGlobe className="text-[#0067b8]" size={14} />
          Organization Website <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          placeholder="https://your-organization.com"
          required
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
            <FaUserTie className="text-[#0067b8]" size={14} />
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="First name"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
            <FaUserTie className="text-[#0067b8]" size={14} />
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Surname"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
            value={surName}
            onChange={(e) => setsurName(e.target.value)}
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
          <FaUserTie className="text-[#0067b8]" size={14} />
          Role / Position <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. CEO, Program Manager"
          required
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      {/* Contact Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
            <FaEnvelope className="text-[#0067b8]" size={14} />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="email@organization.com"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
            <FaPhone className="text-[#0067b8]" size={14} />
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="+254 7XX XXX XXX"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
          <FaHandshake className="text-[#0067b8]" size={14} />
          Membership Category <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] outline-none transition-all bg-gray-50/50 hover:bg-white cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category...</option>
          <option value="trainer">AI Trainer</option>
          <option value="partner">AI Partner</option>
        </select>
      </div>

      {/* Submit */}
      <div className="pt-2">
        {loading ? (
          <div className="flex justify-center py-3">
            <Spinner message="Submitting application..." />
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-[#0067b8] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#005a9e] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#0067b8]/20 hover:shadow-xl hover:shadow-[#0067b8]/30 hover:-translate-y-0.5"
          >
            Submit Application
            <FaArrowRight size={16} />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our membership terms and conditions.
      </p>
    </form>
  );
};

const PartnersCarousel = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const scrollRef = useRef(null);
  const intervalRef = useRef(null);
  const userInteractedRef = useRef(false);

  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/members/approved");
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMembers();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (members.length === 0 || !scrollRef.current) return;
    const container = scrollRef.current;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (userInteractedRef.current) return;
        const cardWidth =
          container.querySelector(".member-card")?.offsetWidth + 24 || 264;
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();
    return () => clearInterval(intervalRef.current);
  }, [members]);

  const handleUserInteraction = () => {
    userInteractedRef.current = true;
    clearInterval(intervalRef.current);
    setTimeout(() => {
      userInteractedRef.current = false;
    }, 10000);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const atStart = container.scrollLeft <= 5;
    const atEnd =
      Math.ceil(container.scrollLeft + container.clientWidth) >=
      container.scrollWidth - 5;
    setShowPrev(!atStart);
    setShowNext(!atEnd);
  };

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth =
      container.querySelector(".member-card")?.offsetWidth + 24 || 264;
    container.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
    handleUserInteraction();
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const checkOverflow = () => {
      const hasOverflow = container.scrollWidth > container.clientWidth + 5;
      setShowNext(hasOverflow);
      setShowPrev(false);
    };
    checkOverflow();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkOverflow);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [members]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#0067b8]/10 rounded-xl flex items-center justify-center">
          <FaUsers className="text-[#0067b8] text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Our Partners</h3>
          <p className="text-xs text-gray-500">
            {members.length} organization{members.length !== 1 ? "s" : ""}{" "}
            joined
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner message="Loading partners..." />
        </div>
      ) : members.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
          <FaUsers size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No partners yet. Be the first to join!</p>
        </div>
      ) : (
        <div className="relative flex-1">
          {/* Scrollable container */}
          <div
            ref={scrollRef}
            onTouchStart={handleUserInteraction}
            onWheel={handleUserInteraction}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {members.map((member, index) => (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="flex-shrink-0 snap-start member-card group"
              >
                <div className="w-56 h-32 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-[#0067b8]/20 flex items-center justify-center text-center p-4 transition-all duration-300 group-hover:-translate-y-1">
                  <div>
                    <div className="w-10 h-10 bg-[#0067b8]/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#0067b8] transition-colors">
                      <FaBuilding className="text-[#0067b8] group-hover:text-white text-sm transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 line-clamp-2 leading-tight">
                      {member.organizationName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                      {member.category}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Navigation Arrows */}
          {showPrev && (
            <button
              onClick={() => scrollByAmount("prev")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-white text-gray-600 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-[#0067b8] hover:text-white hover:border-[#0067b8] transition-all z-10"
            >
              <FaChevronLeft size={12} />
            </button>
          )}
          {showNext && (
            <button
              onClick={() => scrollByAmount("next")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-white text-gray-600 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-[#0067b8] hover:text-white hover:border-[#0067b8] transition-all z-10"
            >
              <FaChevronRight size={12} />
            </button>
          )}

          {/* Scroll indicator dots */}
          {members.length > 3 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {members.slice(0, Math.min(members.length, 6)).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Membership = () => {
  return (
    <div className="">
      <Navbar />
      <div className="my-[6em]" />
      {/* Hero Banner */}
      {/* <div className="bg-[#0067b8] text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                Kenya AI Skilling Alliance
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Join the Alliance
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Partner with us to shape the future of AI skills in Kenya.
              Membership is free and open to organizations, associations, and
              business networks.
            </p>
          </div>
        </div>
      </div> */}

      {/* Two Column Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT COLUMN - Join Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0067b8]/10 rounded-xl flex items-center justify-center">
                    <FaHandshake className="text-[#0067b8] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Apply to Join
                    </h2>
                    <p className="text-sm text-gray-500">
                      Fill in your organization details
                    </p>
                  </div>
                </div>
                <JoinForm />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Partners */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="p-6 md:p-8 h-full">
                <PartnersCarousel />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <FaCheckCircle className="text-green-600 text-sm" />
                </div>
                <p className="text-2xl font-bold text-gray-800">Free</p>
                <p className="text-xs text-gray-500">Membership Cost</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-[#0067b8]/10 rounded-lg flex items-center justify-center mb-2">
                  <FaUsers className="text-[#0067b8] text-sm" />
                </div>
                <p className="text-2xl font-bold text-gray-800">Growing</p>
                <p className="text-xs text-gray-500">Community</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mt-6">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                Membership Benefits
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Access to AI training resources",
                  "Networking with industry leaders",
                  "Priority event invitations",
                  "Collaboration opportunities",
                ].map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <FaCheckCircle
                      className="text-green-500 mt-0.5 flex-shrink-0"
                      size={14}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;

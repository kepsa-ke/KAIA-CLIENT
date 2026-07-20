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
  FaTimes,
  FaSearch,
  FaUniversity,
  FaLandmark,
  FaIndustry,
  FaHands,
  FaLightbulb,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { MicrosoftColors } from "../data";
import Footer from "../components/Footer";
import ImageUpload from "../components/common/ImageUpload";
import { allCountiesKenya } from "../data";

// Membership Form Modal Component
const MembershipFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [surName, setsurName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [companyCounty, setCompanyCounty] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFirstName("");
      setsurName("");
      setRole("");
      setEmail("");
      setPhone("");
      setOrganizationName("");
      setWebsite("");
      setCategory("");
      setCompanyLogo("");
      setMembershipType("");
      setCompanyCounty("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleLogoUpload = (imageUrl) => {
    setCompanyLogo(imageUrl);
  };

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
        !category ||
        !membershipType ||
        !companyCounty ||
        !companyLogo
      ) {
        toast.error("Please fill in all required fields and upload a logo");
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
        companyLogo: companyLogo.trim(),
        membershipType: membershipType.trim(),
        companyCounty: companyCounty.trim(),
      };
      const response = await axios.post("/members", dataToSend);
      if (response.data) {
        setLoading(false);
        setSubmitted(true);
        toast.success("Application submitted successfully!");
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error details:", error);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-zinc-400 opacity-95 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <FaTimes size={24} />
          </button>

          <div className="p-6 md:p-8">
            {submitted ? (
              <div className="py-8">
                <div className="flex justify-center mb-6">
                  <PiHandsClappingDuotone className="text-center text-6xl text-[#1B12E8]" />
                </div>
                <h2 className="text-center text-2xl font-bold mb-4">
                  Submitted Successfully!
                </h2>
                <p className="text-center text-gray-600">
                  Thank you for applying. Someone will reach out soon.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Join The Alliance
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Membership is free and open to organizations, associations,
                    and business networks.
                  </p>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-4">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Logo <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      onImageUpload={handleLogoUpload}
                      folder="member-logos"
                      buttonText="Upload Company Logo"
                      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                      maxSize={5}
                      id="membership-logo-upload"
                    />
                    {companyLogo && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Logo uploaded successfully
                      </p>
                    )}
                  </div>

                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter organization name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Organization Website{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  {/* Contact Person Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="First name"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Surname"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                        value={surName}
                        onChange={(e) => setsurName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Role/Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CEO, Director, Manager"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+254 700 000 000"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Membership Category{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition bg-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="consumer">AI Consumer</option>
                      <option value="trainer">AI Trainer</option>
                      <option value="partner">AI Partner</option>
                    </select>
                  </div>

                  {/* Membership Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Membership Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition bg-white"
                      value={membershipType}
                      onChange={(e) => setMembershipType(e.target.value)}
                      required
                    >
                      <option value="">Select Membership Type</option>
                      <option value="government">Government</option>
                      <option value="academia">
                        Academia/Training institutions
                      </option>
                      <option value="developmentPartners">
                        Development partners
                      </option>
                      <option value="civilSociety">Civil society</option>
                      <option value="innovationHubs">Innovation hubs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Company County */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      County <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1B12E8] focus:border-transparent outline-none transition bg-white"
                      value={companyCounty}
                      onChange={(e) => setCompanyCounty(e.target.value)}
                      required
                    >
                      <option value="">Select County</option>
                      {allCountiesKenya.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1B12E8] text-white py-3 rounded-lg font-semibold hover:bg-[#1610b5] transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Spinner message="Submitting..." />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated Partners Section Component
const PartnersSection = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh the members list by changing the key
    handleFetchMembers();
    toast.success("Membership application submitted successfully!");
  };

  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/members/approved");
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMembers();
  }, []);

  // Group members by membership type
  const getMembersByType = () => {
    const grouped = {
      government: [],
      academia: [],
      developmentPartners: [],
      civilSociety: [],
      innovationHubs: [],
      other: [],
    };

    members.forEach((member) => {
      const type = member.membershipType || "other";
      if (grouped[type]) {
        grouped[type].push(member);
      } else {
        grouped.other.push(member);
      }
    });

    return grouped;
  };

  // Filter members based on search term
  const filterMembers = (memberList) => {
    if (!searchTerm.trim()) return memberList;

    const search = searchTerm.toLowerCase().trim();
    return memberList.filter(
      (member) =>
        member.organizationName?.toLowerCase().includes(search) ||
        member.category?.toLowerCase().includes(search) ||
        member.firstName?.toLowerCase().includes(search) ||
        member.surName?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search),
    );
  };

  const groupedMembers = getMembersByType();

  // Define the display order and their icons/colors
  const typeConfigs = [
    {
      key: "government",
      label: "Government",
      icon: FaLandmark,
      color: "blue",
      description: "Ministries, agencies & county governments",
    },
    {
      key: "academia",
      label: "Academia",
      icon: FaUniversity,
      color: "purple",
      description: "Universities, TVETs & research centres",
    },
    {
      key: "developmentPartners",
      label: "Development Partners",
      icon: FaHandshake,
      color: "green",
      description: "International development organizations",
    },
    {
      key: "civilSociety",
      label: "Civil Society",
      icon: FaHands,
      color: "orange",
      description: "NGOs & community organizations",
    },
    {
      key: "innovationHubs",
      label: "Innovation Hubs",
      icon: FaLightbulb,
      color: "yellow",
      description: "Tech hubs & innovation centres",
    },
    {
      key: "other",
      label: "Others",
      icon: FaBuilding,
      color: "gray",
      description: "Other organizations",
    },
  ];

  // Get color classes based on type
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        tagBg: "bg-blue-100",
        tagText: "text-blue-700",
        hover: "hover:border-blue-300",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        tagBg: "bg-purple-100",
        tagText: "text-purple-700",
        hover: "hover:border-purple-300",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
        tagBg: "bg-green-100",
        tagText: "text-green-700",
        hover: "hover:border-green-300",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
        tagBg: "bg-orange-100",
        tagText: "text-orange-700",
        hover: "hover:border-orange-300",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
        tagBg: "bg-yellow-100",
        tagText: "text-yellow-700",
        hover: "hover:border-yellow-300",
      },
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        iconBg: "bg-gray-100",
        iconText: "text-gray-600",
        tagBg: "bg-gray-100",
        tagText: "text-gray-700",
        hover: "hover:border-gray-300",
      },
    };
    return colors[color] || colors.gray;
  };

  // Render member cards in a grid
  const renderMemberGrid = (members, config) => {
    const filtered = filterMembers(members);

    if (filtered.length === 0) return null;

    const colors = getColorClasses(config.color);

    return (
      <div key={config.key} className="mb-10">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* <div className={`p-3 rounded-xl ${colors.iconBg}`}>
            <config.icon className={`text-xl ${colors.iconText}`} />
          </div> */}
          <div className="flex items-baseline gap-4">
            <h3 className="text-lg font-bold text-gray-800">{config.label}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
          {/* <div
            className={`ml-auto px-3 py-1 rounded-full ${colors.tagBg} ${colors.tagText} text-xs font-medium`}
          >
            {filtered.length} {filtered.length === 1 ? "member" : "members"}
          </div> */}
        </div>

        {/* Grid of member cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((member) => (
            <a
              key={member._id}
              href={member.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative bg-white border ${colors.border} rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${colors.hover}`}
            >
              <div className="p-4 flex flex-col items-center text-center">
                {/* Logo */}
                {member.companyLogo ? (
                  <div className="w-16 h-16 mb-3 flex items-center justify-center">
                    <img
                      src={member.companyLogo}
                      alt={member.organizationName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 mb-3 rounded-xl ${colors.iconBg} flex items-center justify-center`}
                  >
                    <FaBuilding className={`text-2xl ${colors.iconText}`} />
                  </div>
                )}

                {/* Organization Name */}
                <h4 className="text-sm font-semibold text-gray-700 line-clamp-2 leading-tight mb-1">
                  {member.organizationName}
                </h4>

                {/* type Tag */}
                {member.membershipType && (
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {member.membershipType}
                  </span>
                )}
                {/* Category Tag */}
                {/* {member.category && (
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {member.category}
                  </span>
                )} */}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative w-full border border-gray-300 rounded-3xl p-2 flex items-center gap-5">
            <div className=" flex-[0.6] md:flex-[0.8] relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 " />
              <input
                type="text"
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-xl   outline-none transition bg-gray-200"
              />
            </div>
            <div className="flex-[0.4] md:flex-[0.2]">
              <button
                className="bg-[#1B12E8] text-white p-2 rounded-lg hover:bg-[#1B12E8]/80 transition"
                onClick={() => setIsModalOpen(true)}
              >
                Be a Member
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner message="Loading partners..." />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">
              No partners yet
            </h3>
            <p className="text-gray-400 mt-1">
              Be the first organization to join our alliance
            </p>
          </div>
        ) : (
          <>
            {/* Render each section */}
            {typeConfigs.map((config) => {
              const membersOfType = groupedMembers[config.key] || [];
              const filtered = filterMembers(membersOfType);

              // Only render if there are members (or if search is active and matches)
              if (filtered.length > 0) {
                return renderMemberGrid(membersOfType, config);
              }
              return null;
            })}

            {/* No search results message */}
            {searchTerm && (
              <div className="text-center py-12">
                <FaSearch className="text-4xl text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600">
                  No results found
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  We couldn't find any members matching "{searchTerm}"
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {/* Membership Form Modal */}
      <MembershipFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

// Recent Members Component
const RecentMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentMembers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/members/approved?limit=12");
        setMembers(data);
      } catch (err) {
        console.error("Error fetching recent members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner message="Loading members..." />
      </div>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <div className=" border-t border-gray-200 sm:pt-12">
      <div className="grid grid-cols-2 sm:grid-cols-3  gap-4">
        {members.map((member) => (
          <a
            key={member._id}
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[#1B12E8]/30 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
          >
            {/* Logo Container */}
            <div className="w-20 h-20 mb-3 flex items-center justify-center p-2">
              {member.companyLogo ? (
                <img
                  src={member.companyLogo}
                  alt={member.organizationName}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-3xl text-gray-400" />
                </div>
              )}
            </div>

            {/* Organization Name */}
            <h4 className="text-xs font-medium text-gray-700 line-clamp-2 leading-tight">
              {member.organizationName}
            </h4>

            {/* Category Badge */}
            {/* {member.category && (
              <span className="mt-1 text-[8px] text-gray-400 uppercase tracking-wider">
                {member.category}
              </span>
            )} */}

            {/* Hover Overlay Effect */}
            <div className="absolute inset-0 bg-[#1B12E8]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none" />
          </a>
        ))}
      </div>
    </div>
  );
};

const Membership = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Refresh the members list by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <Navbar />
      <div className=" mt-[1em] sm:mt-[4em]" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center text-center gap-2 sm:gap-8 p-7">
        <div className=" py-16 md:py-20">
          <div className="">
            <div className="text-start max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#1B12E8]/10 text-[#1B12E8] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <span className="font-bold">OUR MEMBERS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 mt-4">
                An Alliance Of Many. <br />
                <span className="">One Mission.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join organisations across government, industry, academia and
                civil society united behind one ambition: every Kenyan AI-ready
                by 2027.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#1B12E8] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#1610b5] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Join Our Alliance</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-[#1B12E8]">50+</div>
                <div className="text-sm text-gray-600 mt-1">
                  Member organisations
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-[#1B12E8]">47</div>
                <div className="text-sm text-gray-600 mt-1">
                  Counties represented
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-[#1B12E8]">5+</div>
                <div className="text-sm text-gray-600 mt-1">
                  Sectors included
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* box shadow */}
        <div className="shadow-lg p-4">
          {/* Recent Members Section */}
          <RecentMembers />
        </div>
      </div>

      {/* Partners Section */}
      <PartnersSection key={refreshKey} />

      {/* call to action */}
      <div
        className="max-w-6xl m-auto p-[3em] rounded-2xl text-white mb-14 flex flex-col md:flex-row gap-12 md:gap-4  items-center "
        style={{
          // background: "#1B12E8",
          background:
            "linear-gradient(80deg, rgba(27, 18, 232, 1) 0%, rgba(19, 12, 168, 1) 50%, rgba(12, 8, 102, 1) 100%)",
        }}
      >
        <div className="flex-[0.5]">
          <h2
            style={{
              lineHeight: "1.4em",
              fontFamily: "Space Grotesk, sans-serif",
            }}
            className="text-4xl mb-5"
          >
            Join The Alliance.
          </h2>
          <p className="text-lg">
            Hire certified talent, co-design curriculum, host learners, or
            sponsor a county cohort. There's a role for every organisation.
          </p>
        </div>
        <div className="flex-[0.5] flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#E0A200] p-4  text-black px-8 py-3.5 rounded-xl font-semibold  transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Become A Member </span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* Membership Form Modal */}
      <MembershipFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <Footer />
    </div>
  );
};

export default Membership;

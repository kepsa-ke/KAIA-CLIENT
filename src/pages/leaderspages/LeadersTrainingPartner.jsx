import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import {
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlinePlus,
  AiOutlineClose,
  AiOutlineLink,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import {
  IoBusinessOutline,
  IoLocationOutline,
  IoGlobeOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoShareSocialOutline,
  IoImageOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaUsers,
  FaCalendarAlt,
  FaHashtag,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaCheckCircle,
  FaRegEdit,
  FaEye,
} from "react-icons/fa";
import { MdVerified, MdOutlineVerified } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiWorld } from "react-icons/bi";
import { TfiLocationPin } from "react-icons/tfi";
import { BsBuilding, BsGraphUp, BsPeople } from "react-icons/bs";
import moment from "moment";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import ImageUpload from "../../components/common/ImageUpload";
import AdminLayout from "../../components/adminComponents/AdminLayout";

const LeadersTrainingPartner = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, courses, social

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    about: "",
    impact: "",
    logo: "",
    coverImage: "",
    website: "",

    // Specialties & Tags
    specialties: "",
    hashtags: "",

    // Location
    headquarters: {
      city: "",
      country: "",
      address: "",
    },
    regions: "",

    // Organization Details
    founded: "",
    teamSize: "",

    // Social Links
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },

    // Courses (max 4)
    courses: [
      {
        title: "",
        description: "",
        image: "",
        duration: "",
        level: "all-levels",
      },
    ],
  });

  // Stats state
  const [stats, setStats] = useState({
    viewCount: 0,
    websiteClicks: 0,
    completionPercentage: 0,
    verified: false,
    featured: false,
    published: false,
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get(
        "/training-partners/my-profile/details",
        config,
      );

      if (response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        setHasProfile(true);

        // Populate form with existing data
        setFormData({
          about: profileData.about || "",
          impact: profileData.impact || "",
          logo: profileData.logo || "",
          website: profileData.website || "",
          coverImage: profileData.coverImage || "",
          specialties: profileData.specialties?.join(", ") || "",
          hashtags: profileData.hashtags?.join(", ") || "",
          headquarters: profileData.headquarters || {
            city: "",
            country: "",
            address: "",
          },
          regions: profileData.regions?.join(", ") || "",
          founded: profileData.founded || "",
          teamSize: profileData.teamSize || "",
          socialLinks: profileData.socialLinks || {
            linkedin: "",
            twitter: "",
            facebook: "",
            instagram: "",
          },
          courses:
            profileData.courses?.length > 0
              ? profileData.courses
              : [
                  {
                    title: "",
                    description: "",
                    image: "",
                    duration: "",
                    level: "all-levels",
                  },
                ],
        });

        // Set stats
        setStats({
          viewCount: profileData.viewCount || 0,
          websiteClicks: profileData.websiteClicks || 0,
          completionPercentage: profileData.completionPercentage || 0,
          verified: profileData.verified || false,
          featured: profileData.featured || false,
          published: profileData.published || false,
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setHasProfile(false);
        setEditMode(true); // Auto-enable edit mode for new profiles
      } else {
        toast.error("Error fetching profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Handle courses
  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setFormData((prev) => ({ ...prev, courses: updatedCourses }));
  };

  const addCourse = () => {
    if (formData.courses.length < 4) {
      setFormData((prev) => ({
        ...prev,
        courses: [
          ...prev.courses,
          {
            title: "",
            description: "",
            image: "",
            duration: "",
            level: "all-levels",
          },
        ],
      }));
    } else {
      toast.warning("Maximum 4 courses allowed");
    }
  };

  const removeCourse = (index) => {
    if (formData.courses.length > 1) {
      const updatedCourses = formData.courses.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, courses: updatedCourses }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Process form data
      const profileData = {
        ...formData,
        specialties: formData.specialties
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        hashtags: formData.hashtags
          .split(",")
          .map((h) => h.trim().toLowerCase())
          .filter((h) => h),
        regions: formData.regions
          .split(",")
          .map((r) => r.trim().toLowerCase())
          .filter((r) => r),
        courses: formData.courses.filter((c) => c.title && c.description), // Only save courses with titles
      };

      await axios.post("/training-partners/profile", profileData, config);

      toast.success(
        hasProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!",
      );
      setEditMode(false);
      fetchProfile(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    if (hasProfile) {
      // Revert to original data
      setFormData({
        about: profile.about || "",
        impact: profile.impact || "",
        logo: profile.logo || "",
        website: profile.website || "",
        coverImage: profile.coverImage || "",
        specialties: profile.specialties?.join(", ") || "",
        hashtags: profile.hashtags?.join(", ") || "",
        headquarters: profile.headquarters || {
          city: "",
          country: "",
          address: "",
        },
        regions: profile.regions?.join(", ") || "",
        founded: profile.founded || "",
        teamSize: profile.teamSize || "",
        socialLinks: profile.socialLinks || {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: "",
        },
        courses:
          profile.courses?.length > 0
            ? profile.courses
            : [
                {
                  title: "",
                  description: "",
                  image: "",
                  duration: "",
                  level: "all-levels",
                },
              ],
      });
      setEditMode(false);
    } else {
      // Reset to empty for new profile
      setFormData({
        about: "",
        impact: "",
        logo: "",
        website: "",
        coverImage: "",
        specialties: "",
        hashtags: "",
        headquarters: { city: "", country: "", address: "" },
        regions: "",
        founded: "",
        teamSize: "",
        socialLinks: { linkedin: "", twitter: "", facebook: "", instagram: "" },
        courses: [
          {
            title: "",
            description: "",
            image: "",
            duration: "",
            level: "all-levels",
          },
        ],
      });
    }
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let total = 0;
    let completed = 0;

    if (formData.about) completed++;
    total++;
    if (formData.impact) completed++;
    total++;
    if (formData.logo) completed++;
    total++;
    if (formData.specialties) completed++;
    total++;
    if (formData.headquarters.city) completed++;
    total++;
    if (formData.founded) completed++;
    total++;
    if (formData.teamSize) completed++;
    total++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminNavbar />
        <div className="flex justify-center items-center h-[80vh]">
          <Spinner message="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="">
        <div className="pt-2 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: "#0067b8" }}
                >
                  Training Partner Profile
                </h1>
                <p className="text-gray-600">
                  {hasProfile
                    ? "Manage your organization profile and showcase your training programs"
                    : "Register as a training partner and showcase your organization"}
                </p>
              </div>

              {hasProfile && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition-all shadow-lg hover:shadow-xl"
                >
                  <FaRegEdit size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Stats Cards */}
            {hasProfile && !editMode && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#146C94" }}
                  >
                    {stats.viewCount}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600 mb-1">Website Clicks</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#0b5e42" }}
                  >
                    {stats.websiteClicks}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600 mb-1">
                    Profile Completion
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#6b21a8" }}
                    >
                      {stats.completionPercentage}%
                    </p>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-purple-600"
                        style={{ width: `${stats.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex gap-2">
                    {stats.verified && (
                      <span className="flex items-center gap-1 text-blue-600 text-sm">
                        <MdVerified /> Verified
                      </span>
                    )}
                    {stats.featured && (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        ⭐ Featured
                      </span>
                    )}
                    {!stats.verified && !stats.featured && (
                      <span className="text-gray-500 text-sm">Active</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            {!hasProfile && !editMode ? (
              // Welcome Screen for New Users
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaBuilding size={40} style={{ color: "#146C94" }} />
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Become a Training Partner
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Showcase your organization, share your impact, and connect
                  with learners worldwide.
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-8 py-3 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition-all inline-flex items-center gap-2"
                >
                  <AiOutlinePlus size={20} />
                  Create Your Profile
                </button>
              </div>
            ) : editMode ? (
              // Edit/Create Form
              <form onSubmit={handleSubmit} className="p-6">
                {/* Tab Navigation */}
                <div className="flex border-b mb-6 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === "basic"
                        ? "border-b-2 text-[#146C94] border-[#146C94]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("courses")}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === "courses"
                        ? "border-b-2 text-[#146C94] border-[#146C94]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Courses ({formData.courses.length}/4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === "details"
                        ? "border-b-2 text-[#146C94] border-[#146C94]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Details & Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("social")}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === "social"
                        ? "border-b-2 text-[#146C94] border-[#146C94]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Social Links
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Completion</span>
                    <span className="font-medium" style={{ color: "#146C94" }}>
                      {calculateCompletion()}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${calculateCompletion()}%`,
                        backgroundColor: "#146C94",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Basic Info Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-4">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Organization Logo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <ImageUpload
                          id="tp-logo-upload" // Unique ID for logo
                          onImageUpload={(url) =>
                            setFormData({ ...formData, logo: url })
                          }
                          defaultImage={formData.logo}
                          folder="training-partners/logos"
                          buttonText="Upload Logo"
                          maxSize={2}
                          acceptedTypes={[
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                          ]}
                        />
                        {!formData.logo && (
                          <p className="text-xs text-red-500 mt-1">
                            Logo is required
                          </p>
                        )}
                      </div>

                      {/* Cover Image Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cover Image
                        </label>
                        <ImageUpload
                          id="to-cover-upload" // Unique ID for cover
                          onImageUpload={(url) =>
                            setFormData({ ...formData, coverImage: url })
                          }
                          defaultImage={formData.coverImage}
                          folder="training-partners/covers"
                          buttonText="Upload Cover Image"
                          maxSize={5}
                          acceptedTypes={[
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                          ]}
                          showPreview={true}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended size: 1200x400 pixels
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          About Organization{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.about}
                          onChange={(e) =>
                            setFormData({ ...formData, about: e.target.value })
                          }
                          rows="5"
                          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="Tell us about your organization, mission, vision, and values..."
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Line breaks and paragraphs will be preserved
                        </p>
                      </div>

                      {/* website */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Website URL (When users click 'Visit Website', they
                          will be directed here){" "}
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              website: e.target.value,
                            })
                          }
                          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="https://yourorganization.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Impact So Far <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.impact}
                          onChange={(e) =>
                            setFormData({ ...formData, impact: e.target.value })
                          }
                          rows="4"
                          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="Share your achievements, success stories, and impact metrics..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Specialties
                          </label>
                          <input
                            type="text"
                            value={formData.specialties}
                            onChange={handleInputChange}
                            name="specialties"
                            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="AI, Data Science, Web Dev"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Hashtags
                          </label>
                          <input
                            type="text"
                            value={formData.hashtags}
                            onChange={handleInputChange}
                            name="hashtags"
                            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="tech, education, innovation"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Courses Tab */}
                  {activeTab === "courses" && (
                    <div className="space-y-6">
                      {formData.courses.map((course, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 relative"
                        >
                          {formData.courses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCourse(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <AiOutlineClose size={18} />
                            </button>
                          )}
                          <h3 className="font-medium mb-3">
                            Course {index + 1}
                          </h3>

                          {/* Course Image Upload */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">
                              Course Image
                            </label>
                            <ImageUpload
                              id={`course-image-upload-${index}`} // Unique ID for each course image
                              onImageUpload={(url) =>
                                handleCourseChange(index, "image", url)
                              }
                              defaultImage={course.image}
                              folder={`training-partners/courses`}
                              buttonText="Upload Course Image"
                              maxSize={2}
                              acceptedTypes={[
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ]}
                            />
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={course.title}
                              onChange={(e) =>
                                handleCourseChange(
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Course Title"
                              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            <textarea
                              value={course.description}
                              onChange={(e) =>
                                handleCourseChange(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Course Description"
                              rows="2"
                              maxLength={198}
                              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* <input
                                type="text"
                                value={course.image}
                                onChange={(e) =>
                                  handleCourseChange(
                                    index,
                                    "image",
                                    e.target.value,
                                  )
                                }
                                placeholder="Image URL"
                                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                              /> */}
                              <input
                                type="text"
                                value={course.duration}
                                onChange={(e) =>
                                  handleCourseChange(
                                    index,
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                placeholder="Duration (e.g., 8 weeks)"
                                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                              />
                              <select
                                value={course.level}
                                onChange={(e) =>
                                  handleCourseChange(
                                    index,
                                    "level",
                                    e.target.value,
                                  )
                                }
                                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">
                                  Intermediate
                                </option>
                                <option value="advanced">Advanced</option>
                                <option value="all-levels">All Levels</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.courses.length < 4 && (
                        <button
                          type="button"
                          onClick={addCourse}
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#146C94] hover:text-[#146C94] transition-all flex items-center justify-center gap-2"
                        >
                          <AiOutlinePlus />
                          Add Another Course
                        </button>
                      )}
                    </div>
                  )}

                  {/* Details & Location Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Founded Year
                          </label>
                          <input
                            type="number"
                            value={formData.founded}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                founded: e.target.value,
                              })
                            }
                            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="2020"
                            min="1800"
                            max={new Date().getFullYear()}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Team Size
                          </label>
                          <select
                            value={formData.teamSize}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                teamSize: e.target.value,
                              })
                            }
                            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          >
                            <option value="">Select team size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="501-1000">501-1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Regions Served
                        </label>
                        <input
                          type="text"
                          value={formData.regions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              regions: e.target.value,
                            })
                          }
                          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="africa, europe, asia, global"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-3">Headquarters</h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={formData.headquarters.address}
                            onChange={(e) =>
                              handleNestedChange(
                                "headquarters",
                                "address",
                                e.target.value,
                              )
                            }
                            placeholder="Street Address"
                            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={formData.headquarters.city}
                              onChange={(e) =>
                                handleNestedChange(
                                  "headquarters",
                                  "city",
                                  e.target.value,
                                )
                              }
                              placeholder="City"
                              className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            <input
                              type="text"
                              value={formData.headquarters.country}
                              onChange={(e) =>
                                handleNestedChange(
                                  "headquarters",
                                  "country",
                                  e.target.value,
                                )
                              }
                              placeholder="Country"
                              className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Links Tab */}
                  {activeTab === "social" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          LinkedIn
                        </label>
                        <div className="flex items-center gap-2">
                          <FaLinkedin className="text-blue-600" size={20} />
                          <input
                            type="url"
                            value={formData.socialLinks.linkedin}
                            onChange={(e) =>
                              handleNestedChange(
                                "socialLinks",
                                "linkedin",
                                e.target.value,
                              )
                            }
                            className="flex-1 border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="https://linkedin.com/company/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Twitter
                        </label>
                        <div className="flex items-center gap-2">
                          <FaTwitter className="text-blue-400" size={20} />
                          <input
                            type="url"
                            value={formData.socialLinks.twitter}
                            onChange={(e) =>
                              handleNestedChange(
                                "socialLinks",
                                "twitter",
                                e.target.value,
                              )
                            }
                            className="flex-1 border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Facebook
                        </label>
                        <div className="flex items-center gap-2">
                          <FaFacebook className="text-blue-800" size={20} />
                          <input
                            type="url"
                            value={formData.socialLinks.facebook}
                            onChange={(e) =>
                              handleNestedChange(
                                "socialLinks",
                                "facebook",
                                e.target.value,
                              )
                            }
                            className="flex-1 border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Instagram
                        </label>
                        <div className="flex items-center gap-2">
                          <FaInstagram className="text-pink-600" size={20} />
                          <input
                            type="url"
                            value={formData.socialLinks.instagram}
                            onChange={(e) =>
                              handleNestedChange(
                                "socialLinks",
                                "instagram",
                                e.target.value,
                              )
                            }
                            className="flex-1 border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <AiOutlineSave size={18} />
                        {hasProfile ? "Update Profile" : "Create Profile"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="p-6">
                {/* Profile Header */}
                <div className="relative mb-8">
                  {profile?.coverImage && (
                    <div className="h-48 rounded-lg overflow-hidden mb-4">
                      <img
                        src={profile.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                    {profile?.logo ? (
                      <img
                        src={profile.logo}
                        alt={profile.organizationName}
                        className="w-24 h-24 object-cover rounded-lg border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg border-4 border-white shadow-lg flex items-center justify-center">
                        <FaBuilding size={40} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">
                          {profile?.organizationName}
                        </h2>
                        {profile?.verified && (
                          <MdVerified className="text-blue-600" size={20} />
                        )}
                        {profile?.featured && (
                          <span className="text-yellow-600">⭐</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {profile?.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <BiLink />
                            Website
                          </a>
                        )}
                        {profile?.headquarters?.city && (
                          <span className="flex items-center gap-1">
                            <TfiLocationPin />
                            {profile.headquarters.city}
                            {profile.headquarters.country &&
                              `, ${profile.headquarters.country}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {profile?.about}
                  </p>
                </div>

                {/* Impact Section */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Impact So Far</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {profile?.impact}
                  </p>
                </div>

                {/* Courses */}
                {profile?.courses?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Top Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.courses.map((course, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 flex gap-3"
                        >
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {course.description}
                            </p>
                            {course.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                {course.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties & Hashtags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {profile?.specialties?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.hashtags?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Hashtags</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.hashtags.map((h, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                          >
                            #{h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {profile?.founded && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Founded</p>
                      <p className="font-medium">{profile.founded}</p>
                    </div>
                  )}
                  {profile?.teamSize && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Team Size</p>
                      <p className="font-medium">
                        {profile.teamSize} employees
                      </p>
                    </div>
                  )}
                  {profile?.regions?.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Regions</p>
                      <p className="font-medium">
                        {profile.regions.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {Object.values(profile?.socialLinks || {}).some(Boolean) && (
                  <div>
                    <h3 className="font-semibold mb-2">Connect With Us</h3>
                    <div className="flex gap-4">
                      {profile.socialLinks?.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {profile.socialLinks?.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LeadersTrainingPartner;

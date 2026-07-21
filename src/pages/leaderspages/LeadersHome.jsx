// pages/leaders/LeadersHome.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import {
  AiOutlineTeam,
  AiOutlineBook,
  AiOutlineFileText,
  AiOutlineAppstore,
  AiOutlineBarChart,
  AiOutlineBell,
  AiOutlineArrowRight,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineCalendar,
  AiOutlineBehance,
  AiOutlineEnvironment,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { FaBuilding } from "react-icons/fa";
import { allCountiesKenya } from "../../data";
import ImageUpload from "../../components/common/ImageUpload";

const LeadersHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    news: [],
    blogs: [],
    events: [],
    jobs: [],
    recentActivity: [],
  });

  const [formModal, setFormModal] = useState({ show: false, member: null });
  const [formData, setFormData] = useState({
    firstName: "",
    surName: "",
    email: "",
    organizationName: "",
    website: "",
    phone: "",
    role: "",
    category: "",
    // New fields
    companyLogo: "",
    membershipType: "",
    companyCounty: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isTokenExpired(user?.token)) {
      toast.error("Your session has expired. Please login again.");
      dispatch(logout());
      navigate("/login");
    }
  }, [user, navigate, dispatch]);

  // API call handler - FIXED VERSION
  const handleApiCall = async (apiFunction, errorMessage, key) => {
    try {
      if (isTokenExpired(user?.token)) {
        toast.error("Your session has expired. Please login again.");
        dispatch(logout());
        navigate("/login");
        return null;
      }

      const token = user?.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await apiFunction(config);

      // Handle different response formats
      let data = [];
      if (response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          data = response.data;
        }
        // Check if response.data has a data property that's an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
        // Check if response.data has a news/blogs/etc property that's an array
        else if (response.data[key] && Array.isArray(response.data[key])) {
          data = response.data[key];
        }
        // If it's an object but not what we expect, log warning
        else if (typeof response.data === "object") {
          console.warn(`Unexpected data format for ${key}:`, response.data);
          data = [];
        }
      }

      setStats((prev) => ({ ...prev, [key]: data }));
      return data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }
      // Ensure we set empty array on error
      setStats((prev) => ({ ...prev, [key]: [] }));
      return [];
    }
  };

  // Fetch all leader-specific data
  const fetchAllData = async () => {
    if (!user || isTokenExpired(user?.token)) return;

    setLoading(true);
    try {
      await Promise.all([
        handleApiCall(
          (config) => axios.get("/news/my-news", config),
          "Error Fetching News",
          "news",
        ),
        handleApiCall(
          (config) => axios.get("/blog-ads/my-ads", config),
          "Error Fetching Blogs",
          "blogs",
        ),
        handleApiCall(
          (config) => axios.get("/events/my-events", config),
          "Error Fetching Events",
          "events",
        ),
        handleApiCall(
          (config) => axios.get("/jobs/my-jobs", config),
          "Error Fetching Jobs",
          "jobs",
        ),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch current member data on mount
  const [yourMemberDetails, setYourMemberDetails] = useState(null);
  const fetchCurrentMemberDetails = async () => {
    if (!user || isTokenExpired(user?.token)) return;

    try {
      const token = user?.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`/members/mine`, config);
      setYourMemberDetails(response.data);
    } catch (error) {
      console.error("Error fetching current member data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchCurrentMemberDetails();
  }, []);

  // Calculate stats - FIXED with safe array checks
  const getStats = () => {
    // Ensure we're working with arrays
    const newsArray = Array.isArray(stats?.news) ? stats.news : [];
    const blogsArray = Array.isArray(stats?.blogs) ? stats.blogs : [];
    const eventsArray = Array.isArray(stats?.events) ? stats.events : [];
    const jobsArray = Array.isArray(stats?.jobs) ? stats.jobs : [];

    // Calculate totals
    const totalNews = newsArray.length;
    const totalBlogs = blogsArray.length;
    const totalEvents = eventsArray.length;
    const totalJobs = jobsArray.length;

    // Calculate published vs draft counts for news and blogs
    const publishedNews = newsArray.filter(
      (item) => item?.published === true,
    ).length;
    const draftNews = newsArray.filter(
      (item) => item?.published === false,
    ).length;

    const publishedBlogs = blogsArray.filter(
      (item) => item?.published === true,
    ).length;
    const draftBlogs = blogsArray.filter(
      (item) => item?.published === false,
    ).length;

    // Events can have different statuses based on your schema
    const upcomingEvents = eventsArray.filter(
      (item) => item?.eventStatus === "upcoming",
    ).length;
    const ongoingEvents = eventsArray.filter(
      (item) => item?.eventStatus === "ongoing",
    ).length;
    const pastEvents = eventsArray.filter(
      (item) => item?.eventStatus === "past",
    ).length;

    // Jobs stats - by type, work mode, etc.
    const fullTimeJobs = jobsArray.filter(
      (item) => item?.type === "full-time",
    ).length;
    const remoteJobs = jobsArray.filter(
      (item) => item?.workMode === "remote",
    ).length;
    const activeJobs = jobsArray.filter(
      (item) =>
        item?.published === true &&
        (!item?.applicationDeadline ||
          new Date(item.applicationDeadline) > new Date()),
    ).length;

    return {
      totalNews,
      totalBlogs,
      totalEvents,
      totalJobs,
      publishedNews,
      publishedBlogs,
      draftNews,
      draftBlogs,
      upcomingEvents,
      ongoingEvents,
      pastEvents,
      fullTimeJobs,
      remoteJobs,
      activeJobs,
    };
  };

  // Get recent items for display - FIXED with safe array checks
  const getRecentItems = () => {
    const newsArray = Array.isArray(stats?.news) ? stats.news : [];
    const blogsArray = Array.isArray(stats?.blogs) ? stats.blogs : [];
    const eventsArray = Array.isArray(stats?.events) ? stats.events : [];
    const jobsArray = Array.isArray(stats?.jobs) ? stats.jobs : [];

    const recentNews = newsArray.slice(0, 3);
    const recentBlogs = blogsArray.slice(0, 3);
    const recentEvents = eventsArray.slice(0, 3);
    const recentJobs = jobsArray.slice(0, 3);

    return {
      recentNews,
      recentBlogs,
      recentEvents,
      recentJobs,
    };
  };

  // Handle form open
  const handleOpenForm = (member = null) => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        surName: member.surName || "",
        email: member.email || "",
        organizationName: member.organizationName || "",
        website: member.website || "",
        phone: member.phone || "",
        role: member.role || "",
        category: member.category || "",
        // New fields
        companyLogo: member.companyLogo || "",
        membershipType: member.membershipType || "",
        companyCounty: member.companyCounty || "",
      });
    } else {
      setFormData({
        firstName: "",
        surName: "",
        email: "",
        organizationName: "",
        website: "",
        phone: "",
        role: "",
        category: "",
        companyLogo: "",
        membershipType: "",
        companyCounty: "",
      });
    }
    setFormModal({ show: true, member });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.companyLogo) {
        toast.error("Please upload a company logo");
        return;
      }

      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (formModal.member) {
        await axios.put(`/members/${formModal.member._id}`, formData, config);
        toast.success("Member updated successfully");
      } else {
        // await axios.post("/members", formData, config);
        // toast.success("Member created successfully");
        console.log(
          "Form submission is currently disabled for creating new members.",
        );
      }
      setFormModal({ show: false, member: null });
      fetchCurrentMemberDetails(); // Refresh member details after submission
    } catch (err) {
      toast.error("Error saving member");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (imageUrl) => {
    setFormData({
      ...formData,
      companyLogo: imageUrl,
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminNavbar />
        <div className="flex-1 lg:ml-20 xl:ml-64 flex items-center justify-center">
          <Spinner message="Loading Dashboard" />
        </div>
      </div>
    );
  }

  const stats_data = getStats();
  const { recentNews, recentBlogs, recentEvents, recentJobs } =
    getRecentItems();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNavbar />

      <main className="flex-1 overflow-y-auto lg:ml-20 xl:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, {user?.organizationName || "Leader"}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your organization's content and track performance.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* member details */}
        <div className="p-6 bg-white shadow-sm border border-gray-200 mb-8 mt-8">
          <div className="flex items-center gap-5 mb-4 ">
            <h2 className="text-xl font-bold text-gray-800 ">
              Your Organization Details
            </h2>
          </div>
          {yourMemberDetails &&
            yourMemberDetails.map((member, index) => (
              <div key={index}>
                {/* compare logged in email with contact email */}
                {user?.email === member?.email && (
                  <div>
                    {/* <p className="text-sm text-green-600 mb-2">
                      You are the primary contact for this organization.
                    </p> */}
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg cursor-pointer my-3"
                      onClick={() => handleOpenForm(member)}
                    >
                      Edit Details
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Organization Name</p>
                    <p className="font-medium">{member?.organizationName}</p>

                    <p className="text-sm text-gray-600 mt-6">Status</p>
                    <p className="font-medium">
                      {member?.approved ? "Approved" : "Not Approved"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organization Logo</p>

                    {/* Display the logo if it exists, otherwise show a placeholder */}
                    {member?.companyLogo ? (
                      <img
                        src={member?.companyLogo}
                        alt={`${member?.organizationName} Logo`}
                        className="w-24 h-24 object-contain mt-2"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <FaBuilding className="text-3xl text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-medium">{member?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-medium">{member?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Membership Type</p>
                    <p className="font-medium">{member?.membershipType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a
                      href={member?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {member?.website}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">County</p>
                    <p className="font-medium">{member?.companyCounty}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* News Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">News</p>
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  <AiOutlineFileText className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats_data.totalNews}
                </h3>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <AiOutlineCheckCircle /> {stats_data.publishedNews}{" "}
                    Published
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AiOutlineClockCircle /> {stats_data.draftNews} Drafts
                  </span>
                </div>
              </div>
              <Link
                to="/leaders-news"
                className="mt-4 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                Manage news
                <AiOutlineArrowRight className="ml-1" />
              </Link>
            </div>

            {/* Blogs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Blogs</p>
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600">
                  <AiOutlineAppstore className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats_data.totalBlogs}
                </h3>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <AiOutlineCheckCircle /> {stats_data.publishedBlogs}{" "}
                    Published
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AiOutlineClockCircle /> {stats_data.draftBlogs} Drafts
                  </span>
                </div>
              </div>
              <Link
                to="/leaders-blogs"
                className="mt-4 inline-flex items-center text-sm text-pink-600 hover:text-pink-700"
              >
                Manage blogs
                <AiOutlineArrowRight className="ml-1" />
              </Link>
            </div>

            {/* Events Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Events</p>
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                  <AiOutlineCalendar className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats_data.totalEvents}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-blue-600">
                    <AiOutlineClockCircle /> {stats_data.upcomingEvents}{" "}
                    Upcoming
                  </span>
                  <span className="flex items-center gap-1 text-green-600">
                    <AiOutlineCheckCircle /> {stats_data.ongoingEvents} Ongoing
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    {stats_data.pastEvents} Past
                  </span>
                </div>
              </div>
              <Link
                to="/leaders-events"
                className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-700"
              >
                Manage events
                <AiOutlineArrowRight className="ml-1" />
              </Link>
            </div>

            {/* Jobs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Jobs</p>
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <AiOutlineBehance className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats_data.totalJobs}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <AiOutlineCheckCircle /> {stats_data.activeJobs} Active
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <AiOutlineBehance /> {stats_data.fullTimeJobs} Full-time
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <AiOutlineEnvironment /> {stats_data.remoteJobs} Remote
                  </span>
                </div>
              </div>
              <Link
                to="/leaders-jobs"
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                Manage jobs
                <AiOutlineArrowRight className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent News */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent News From You
                </h2>
                <Link
                  to="/leaders-news"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all <AiOutlineArrowRight className="ml-1" />
                </Link>
              </div>

              {recentNews.length > 0 ? (
                <div className="space-y-4">
                  {recentNews.map((news, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {news.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <AiOutlineClockCircle />
                            {new Date(news.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              news.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {news.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No news items yet
                </p>
              )}
            </div>

            {/* Recent Blogs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Blogs From You
                </h2>
                <Link
                  to="/leaders-blogs"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all <AiOutlineArrowRight className="ml-1" />
                </Link>
              </div>

              {recentBlogs.length > 0 ? (
                <div className="space-y-4">
                  {recentBlogs.map((blog, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <AiOutlineClockCircle />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              blog.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No blog items yet
                </p>
              )}
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Events From You
                </h2>
                <Link
                  to="/leaders-events"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all <AiOutlineArrowRight className="ml-1" />
                </Link>
              </div>

              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <AiOutlineCalendar />
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <AiOutlineEnvironment />
                            {event.location?.city ||
                              event.location?.venue ||
                              "TBD"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              event.eventStatus === "upcoming"
                                ? "bg-blue-100 text-blue-700"
                                : event.eventStatus === "ongoing"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {event.eventStatus || "Upcoming"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No events created yet
                </p>
              )}
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Jobs From You
                </h2>
                <Link
                  to="/leaders-jobs"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View all <AiOutlineArrowRight className="ml-1" />
                </Link>
              </div>

              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <AiOutlineBehance />
                            {job.type?.replace("-", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <AiOutlineEnvironment />
                            {job.location || "Remote"}
                          </span>
                          {job.salaryRange?.min && (
                            <span className="flex items-center gap-1">
                              <AiOutlineDollarCircle />
                              {job.salaryRange.currency} {job.salaryRange.min}k
                              - {job.salaryRange.max}k
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              job.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {job.published ? "Active" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No jobs posted yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* {console.log(user)} */}
        {/* {console.log(yourMemberDetails)} */}
      </main>

      {/* Create/Update Form Modal - Updated with ImageUpload */}
      {formModal.show && (
        <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold mb-4">
                {formModal.member ? "Update Details" : "Add New Member"}
              </h2>
              <button
                type="button"
                onClick={() => setFormModal({ show: false, member: null })}
                className="px-4 py-2 bg-orange-300 rounded-md cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-3">
              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Logo <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  onImageUpload={handleLogoUpload}
                  defaultImage={formData.companyLogo || ""}
                  folder="member-logos"
                  buttonText="Upload Company Logo"
                  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                  maxSize={5}
                  id="admin-company-logo-upload"
                />
                {formData.companyLogo && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Logo uploaded successfully
                  </p>
                )}
              </div>

              {[
                {
                  name: "organizationName",
                  label: "Organization Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "website",
                  label: "Website Link or LinkedIn",
                  type: "url",
                  required: true,
                },
                {
                  name: "firstName",
                  label: "First Name of the contact person",
                  type: "text",
                  required: true,
                },
                {
                  name: "surName",
                  label: "Surname of the contact person",
                  type: "text",
                  required: true,
                },
                {
                  name: "role",
                  label: "Role of the contact person",
                  type: "text",
                  required: true,
                },
                {
                  name: "email",
                  label: "Email of the contact person",
                  type: "email",
                  required: true,
                },
                {
                  name: "phone",
                  label: "Phone of the contact person",
                  type: "tel",
                  required: true,
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    required={field.required || false}
                    placeholder={field.placeholder || ""}
                    className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>
              ))}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Membership Category{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  required
                  className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="consumer">AI Consumer</option>
                  <option value="trainer">AI Trainer</option>
                  <option value="partner">AI Partner</option>
                </select>
              </div>

              {/* Membership Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Membership Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="membershipType"
                  value={formData.membershipType || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membershipType: e.target.value,
                    })
                  }
                  required
                  className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
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
                <label className="block text-sm font-medium mb-1">
                  Company County <span className="text-red-500">*</span>
                </label>
                <select
                  name="companyCounty"
                  value={formData.companyCounty || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyCounty: e.target.value,
                    })
                  }
                  required
                  className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                >
                  <option value="">Select County</option>
                  {allCountiesKenya.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setFormModal({ show: false, member: null })}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : formModal.member
                      ? "Update Details"
                      : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadersHome;

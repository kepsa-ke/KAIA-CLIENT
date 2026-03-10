// pages/admin/AdminHome.jsx
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
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineDashboard,
  AiOutlineFileText,
  AiOutlineAppstore,
  AiOutlineBell,
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineAim,
  AiOutlineShake,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineEnvironment,
} from "react-icons/ai";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: [],
    courses: [],
    members: [],
    requests: [],
    news: [],
    blogs: [],
    events: [],
    jobs: [],
    trainingPartners: [],
  });

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

  // API call handler with improved data extraction
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
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data[key] && Array.isArray(response.data[key])) {
          data = response.data[key];
        } else if (typeof response.data === "object") {
          // If it's a single object, wrap in array
          data = [response.data];
        }
      }

      setStats((prev) => ({ ...prev, [key]: data }));
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }
      // Set empty array on error
      setStats((prev) => ({ ...prev, [key]: [] }));
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!user || isTokenExpired(user?.token)) return;

    setLoading(true);
    try {
      await Promise.all([
        handleApiCall(
          (config) => axios.get("/users", config),
          "Error Fetching Users",
          "users",
        ),
        handleApiCall(
          (config) => axios.get("/courses", config),
          "Error Fetching Courses",
          "courses",
        ),
        handleApiCall(
          (config) => axios.get("/members", config),
          "Error Fetching Members",
          "members",
        ),
        handleApiCall(
          (config) => axios.get("/requests", config),
          "Error Fetching Requests",
          "requests",
        ),
        handleApiCall(
          (config) => axios.get("/news/admin/all", config),
          "Error Fetching News",
          "news",
        ),
        handleApiCall(
          (config) => axios.get("/blog-ads/admin/all", config),
          "Error Fetching Blogs",
          "blogs",
        ),
        handleApiCall(
          (config) => axios.get("/events/admin/all", config),
          "Error Fetching Events",
          "events",
        ),
        handleApiCall(
          (config) => axios.get("/jobs/admin/all", config),
          "Error Fetching Jobs",
          "jobs",
        ),
        handleApiCall(
          (config) => axios.get("/training-partners/admin/all", config),
          "Error Fetching Training Partners",
          "trainingPartners",
        ),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate additional stats for events and jobs
  const getAdditionalStats = () => {
    const eventsArray = Array.isArray(stats?.events) ? stats.events : [];
    const jobsArray = Array.isArray(stats?.jobs) ? stats.jobs : [];
    const partnersArray = Array.isArray(stats?.trainingPartners)
      ? stats.trainingPartners
      : [];

    // Event stats
    const upcomingEvents = eventsArray.filter(
      (event) =>
        event?.eventStatus === "upcoming" ||
        (event?.startDate && new Date(event.startDate) > new Date()),
    ).length;

    const ongoingEvents = eventsArray.filter(
      (event) =>
        event?.eventStatus === "ongoing" ||
        (event?.startDate &&
          event?.endDate &&
          new Date(event.startDate) <= new Date() &&
          new Date(event.endDate) >= new Date()),
    ).length;

    // Job stats
    const activeJobs = jobsArray.filter(
      (job) =>
        job?.published === true &&
        (!job?.applicationDeadline ||
          new Date(job.applicationDeadline) > new Date()),
    ).length;

    const remoteJobs = jobsArray.filter(
      (job) => job?.workMode === "remote",
    ).length;

    // Partner stats
    const verifiedPartners = partnersArray.filter(
      (partner) => partner?.verified === true || partner?.status === "verified",
    ).length;

    return {
      upcomingEvents,
      ongoingEvents,
      activeJobs,
      remoteJobs,
      verifiedPartners,
      totalPartners: partnersArray.length,
    };
  };

  // Dashboard cards configuration
  const getCards = () => {
    const additionalStats = getAdditionalStats();

    const baseCards = [
      {
        title: "Members",
        value: stats?.members?.length || 0,
        icon: AiOutlineTeam,
        link: "/admin-members",
        bgColor: "from-blue-500 to-blue-600",
        description: "Registered KAISA members",
      },
      {
        title: "Courses",
        value: stats?.courses?.length || 0,
        icon: AiOutlineBook,
        link: "/admin-courses",
        bgColor: "from-green-500 to-green-600",
        description: "All courses under AI learning",
      },
      {
        title: "News",
        value: stats?.news?.length || 0,
        icon: AiOutlineFileText,
        link: "/admin-news",
        bgColor: "from-purple-500 to-purple-600",
        description: "All news articles",
      },
      {
        title: "Blogs",
        value: stats?.blogs?.length || 0,
        icon: AiOutlineAppstore,
        link: "/admin-blogs",
        bgColor: "from-pink-500 to-pink-600",
        description: "All blog posts",
      },
      {
        title: "Events",
        value: stats?.events?.length || 0,
        icon: AiOutlineCalendar,
        link: "/admin-events",
        bgColor: "from-orange-500 to-orange-600",
        description: "All events",
        subStats: [
          {
            label: "Upcoming",
            value: additionalStats.upcomingEvents,
            color: "text-blue-600",
          },
          {
            label: "Ongoing",
            value: additionalStats.ongoingEvents,
            color: "text-green-600",
          },
        ],
      },
      {
        title: "Jobs",
        value: stats?.jobs?.length || 0,
        icon: AiOutlineAim,
        link: "/admin-jobs",
        bgColor: "from-indigo-500 to-indigo-600",
        description: "All job listings",
        subStats: [
          {
            label: "Active",
            value: additionalStats.activeJobs,
            color: "text-green-600",
          },
          {
            label: "Remote",
            value: additionalStats.remoteJobs,
            color: "text-purple-600",
          },
        ],
      },
      {
        title: "Training Partners",
        value: stats?.trainingPartners?.length || 0,
        icon: AiOutlineShake,
        link: "/admin/training-partners",
        bgColor: "from-teal-500 to-teal-600",
        description: "All training partners",
        subStats: [
          {
            label: "Verified",
            value: additionalStats.verifiedPartners,
            color: "text-green-600",
          },
        ],
      },
    ];

    if (user?.isAdmin) {
      // Insert admin-specific cards at the beginning
      baseCards.unshift(
        {
          title: "Users",
          value: stats?.users?.length || 0,
          icon: AiOutlineUser,
          link: "/admin-users",
          bgColor: "from-orange-500 to-orange-600",
          description: "Users managing organizations",
        },
        {
          title: "Requests",
          value: stats?.requests?.length || 0,
          icon: AiOutlineDashboard,
          link: "/admin-requests",
          bgColor: "from-red-500 to-red-600",
          description: "Total requests so far",
        },
      );
    }

    return baseCards;
  };

  // Show spinner while loading
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

  const cards = getCards();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNavbar />
      <main className="flex-1 overflow-y-auto lg:ml-20 xl:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.organizationName || "Admin"}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.isAdmin
                ? "Here's what's happening with your platform today."
                : "Manage your organization's content and members."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:scale-105 duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${card.bgColor}`}
                      >
                        <Icon className="text-white text-2xl" />
                      </div>
                      <span className="text-3xl font-bold text-gray-800">
                        {card.value?.toLocaleString() || "0"}
                      </span>
                    </div>

                    <h3 className="text-gray-800 font-semibold mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {card.description}
                    </p>

                    {/* Sub-stats if available */}
                    {card.subStats && (
                      <div className="flex flex-wrap gap-3 mb-3 text-xs">
                        {card.subStats.map((stat, idx) => (
                          <span
                            key={idx}
                            className={`flex items-center gap-1 ${stat.color}`}
                          >
                            <AiOutlineCheckCircle className="text-xs" />
                            {stat.label}: {stat.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {card.link && (
                      <Link
                        to={card.link}
                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 group"
                      >
                        View all
                        <AiOutlineArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Content Overview
              </h4>
              <div className="space-y-1">
                <p className="text-xs text-blue-600">
                  Total Content Items:{" "}
                  {(stats?.news?.length || 0) +
                    (stats?.blogs?.length || 0) +
                    (stats?.events?.length || 0) +
                    (stats?.jobs?.length || 0)}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="text-purple-600">
                    News: {stats?.news?.length || 0}
                  </span>
                  <span className="text-pink-600">
                    Blogs: {stats?.blogs?.length || 0}
                  </span>
                  <span className="text-orange-600">
                    Events: {stats?.events?.length || 0}
                  </span>
                  <span className="text-indigo-600">
                    Jobs: {stats?.jobs?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Community Stats
              </h4>
              <div className="space-y-1">
                <p className="text-xs text-green-600">
                  Total Users: {stats?.users?.length || 0}
                </p>
                <p className="text-xs text-green-600">
                  Total Members: {stats?.members?.length || 0}
                </p>
                <p className="text-xs text-green-600">
                  Training Partners: {stats?.trainingPartners?.length || 0}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-2">
                Engagement
              </h4>
              <div className="space-y-1">
                <p className="text-xs text-purple-600">
                  Pending Requests: {stats?.requests?.length || 0}
                </p>
                <p className="text-xs text-purple-600">
                  Active Jobs: {getAdditionalStats().activeJobs}
                </p>
                <p className="text-xs text-purple-600">
                  Upcoming Events: {getAdditionalStats().upcomingEvents}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;

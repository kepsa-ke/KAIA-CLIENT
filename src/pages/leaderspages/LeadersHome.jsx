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

  useEffect(() => {
    fetchAllData();
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
      </main>
    </div>
  );
};

export default LeadersHome;

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import moment from "moment";
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
} from "react-icons/ai";
import {
  IoBookOutline,
  IoStatsChartOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";
import {
  FaRegCalendarAlt,
  FaEye,
  FaThumbsUp,
  FaChartLine,
  FaUserGraduate,
} from "react-icons/fa";
import {
  MdOutlineCategory,
  MdOutlineEmail,
  MdOutlineLink,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { HiOutlinePhotograph, HiOutlineTag } from "react-icons/hi";
import { BiReset } from "react-icons/bi";
import ImageUpload from "../../components/common/ImageUpload";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { CourseCategories } from "../../data";

const COLORS = ["#146C94", "#19A7CE", "#AFD3E2", "#F6F1F1", "#FF8042"];

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, bgColor, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3
          className="text-3xl font-bold"
          style={{ color: color || "#146C94" }}
        >
          {value}
        </h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.direction === "up" ? (
              <MdTrendingUp className="text-green-600" />
            ) : (
              <MdTrendingDown className="text-red-600" />
            )}
            <span
              className={`text-xs ${
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}% from last month
            </span>
          </div>
        )}
      </div>
      <div
        className="p-3 rounded-lg"
        style={{ backgroundColor: bgColor || "#e6f0fa" }}
      >
        <Icon className="text-2xl" style={{ color: color || "#146C94" }} />
      </div>
    </div>
  </div>
);

// Course Card Component for Mobile
const CourseCard = ({ course, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/80?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
              <HiOutlinePhotograph size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>

          {/* Organization and Category */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <IoPeopleOutline size={12} />
              {course.organization}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {course.category}
            </span>
            {course.tag && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                #{course.tag}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div
              className="flex items-center gap-1"
              style={{ color: "#146C94" }}
            >
              <FaEye size={12} />
              <span className="font-semibold">{course.views || 0}</span>
              <span className="text-gray-500 text-xs">views</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <FaThumbsUp size={12} />
              <span className="font-semibold">{course.enrollments || 0}</span>
              <span className="text-gray-500 text-xs">enrolled</span>
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-2">
            {course.approved ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                <IoCheckmarkCircle size={12} />
                Approved
              </span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                <IoTimeOutline size={12} />
                Pending Approval
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-3">
            <AiOutlineEye
              size={18}
              className="text-[#146C94] cursor-pointer hover:scale-110"
              onClick={() => onView(course)}
              title="View"
            />
            <AiOutlineEdit
              size={18}
              className="text-blue-600 cursor-pointer hover:scale-110"
              title="Edit"
              onClick={() => onEdit(course)}
            />
            <AiOutlineDelete
              size={18}
              className="text-red-600 cursor-pointer hover:scale-110"
              onClick={() => onDelete(course)}
              title="Delete"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesTable = ({ data, onView, onEdit, onDelete }) => (
  <table className="w-full border border-gray-300 text-sm hidden md:table">
    <thead className="bg-gray-100 border-b border-gray-300">
      <tr>
        <th className="p-2 text-left font-semibold border-r">Image</th>
        <th className="p-2 text-left font-semibold border-r">Title</th>
        <th className="p-2 text-left font-semibold border-r">Organization</th>
        <th className="p-2 text-left font-semibold border-r">Category</th>
        <th className="p-2 text-left font-semibold border-r">Tags</th>
        <th className="p-2 text-left font-semibold border-r">Status</th>

        <th className="p-2 text-left font-semibold border-r">Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map((course) => (
        <tr key={course._id} className="even:bg-gray-50 hover:bg-gray-100">
          <td className="p-2 border-r">
            {course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/48?text=No+Image";
                }}
              />
            ) : (
              <HiOutlinePhotograph size={24} className="text-gray-400" />
            )}
          </td>
          <td className="p-2 border-r font-medium max-w-xs">
            <div className="line-clamp-2">{course.title}</div>
          </td>
          <td className="p-2 border-r">{course.organization}</td>
          <td className="p-2 border-r">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {course.category}
            </span>
          </td>
          <td className="p-2 border-r">
            {course.tag && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                #{course.tag}
              </span>
            )}
          </td>
          <td className="p-2 border-r">
            {course.approved ? (
              <span className="flex items-center gap-1 text-green-600">
                <IoCheckmarkCircle /> Approved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600">
                <IoTimeOutline /> Pending
              </span>
            )}
          </td>

          <td className="p-2">
            <div className="flex gap-2 items-center">
              <AiOutlineEye
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onView(course)} // Make sure this calls onView
                title="View"
              />
              <AiOutlineEdit
                size={18}
                className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                title="Edit"
                onClick={() => onEdit(course)} // Make sure this calls onEdit
              />
              <AiOutlineDelete
                size={18}
                className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onDelete(course)} // Make sure this calls onDelete
                title="Delete"
              />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LeadersCourses = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModal, setViewModal] = useState({ show: false, course: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, course: null });
  const [formModal, setFormModal] = useState({ show: false, course: null });

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    link: "",
    organization: "",
    tag: "",
    category: "",
    email: "",
    image: "",
  });

  const recordsPerPage = 10;

  // Fetch leader's courses
  const handleFetchMyCourses = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/courses/my-courses", config);

      let coursesData = [];
      if (Array.isArray(data)) {
        coursesData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        coursesData = data.data;
      } else if (data?.courses && Array.isArray(data.courses)) {
        coursesData = data.courses;
      }

      setCourses(coursesData);

      // Extract unique categories for filter
      const categories = [
        ...new Set(coursesData.map((course) => course.category)),
      ];
      setAvailableCategories(categories);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error(err.response?.data?.error || "Error fetching your courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyCourses();
    }
  }, [user]);

  // Calculate comprehensive stats
  const stats = {
    total: courses.length,
    approved: courses.filter((c) => c.approved).length,
    pending: courses.filter((c) => !c.approved).length,
    totalViews: courses.reduce((sum, c) => sum + (c.views || 0), 0),
    totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollments || 0), 0),
    avgViewsPerCourse:
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + (c.views || 0), 0) /
              courses.length,
          )
        : 0,
    mostViewedCourse:
      courses.length > 0
        ? courses.reduce(
            (max, c) => ((c.views || 0) > (max.views || 0) ? c : max),
            courses[0],
          )
        : null,
    categories: [...new Set(courses.map((c) => c.category))].length,
  };

  // Get monthly trends
  const getMonthlyTrends = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, "months").format("MMM YYYY");
      last6Months.push({ month, courses: 0, views: 0, enrollments: 0 });
    }

    courses.forEach((course) => {
      const courseMonth = moment(course.createdAt).format("MMM YYYY");
      const monthData = last6Months.find((m) => m.month === courseMonth);
      if (monthData) {
        monthData.courses++;
        monthData.views += course.views || 0;
        monthData.enrollments += course.enrollments || 0;
      }
    });

    return last6Months;
  };

  // Get category distribution
  const getCategoryDistribution = () => {
    const categoryMap = new Map();
    courses.forEach((course) => {
      categoryMap.set(
        course.category,
        (categoryMap.get(course.category) || 0) + 1,
      );
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Get approval distribution
  const getApprovalDistribution = () => {
    return [
      { name: "Approved", value: stats.approved },
      { name: "Pending", value: stats.pending },
    ];
  };

  // Get top performing courses
  const topCourses = [...courses]
    .filter((c) => c.approved)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    if (!course) return false;

    const matchesSearch =
      course.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      course.desc?.toLowerCase().includes(searchText.toLowerCase()) ||
      course.organization?.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && course.approved) ||
      (statusFilter === "pending" && !course.approved);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedCourses = sortedCourses.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedCourses.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // Delete Course
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteCourse = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/courses/${deleteModal.course._id}`, config);
      toast.success("Course deleted successfully");
      setDeleteModal({ show: false, course: null });
      handleFetchMyCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error deleting course");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle form open
  const handleOpenForm = (courseItem = null) => {
    if (courseItem) {
      setFormData({
        title: courseItem.title || "",
        desc: courseItem.desc || "",
        link: courseItem.link || "",
        organization: courseItem.organization || "",
        tag: courseItem.tag || "",
        category: courseItem.category || "",
        email: courseItem.email || "",
        image: courseItem.image || "",
      });
    } else {
      setFormData({
        title: "",
        desc: "",
        link: "",
        organization: "",
        tag: "",
        category: "",
        email: "",
        image: "",
      });
    }
    setFormModal({ show: true, course: courseItem });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      if (formModal.course) {
        await axios.put(`/courses/${formModal.course._id}`, formData, config);
        toast.success("Course updated successfully");
      } else {
        await axios.post("/courses", formData, config);
        toast.success("Course created successfully");
      }
      setFormModal({ show: false, course: null });
      handleFetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 mb-8 mt-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">My Courses</h2>
              <p className="text-gray-600">
                Create and manage your courses, track engagement and enrollments
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
            >
              <AiOutlinePlus size={18} />
              Create Course
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Courses"
              value={stats.total}
              icon={IoBookOutline}
              color="#146C94"
              bgColor="#e6f0fa"
            />
            {/* <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={FaEye}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`Avg ${stats.avgViewsPerCourse} per course`}
            />
            <StatsCard
              title="Total Enrollments"
              value={stats.totalEnrollments}
              icon={FaUserGraduate}
              color="#856404"
              bgColor="#fff3cd"
            /> */}
            <StatsCard
              title="Approval Rate"
              value={`${Math.round((stats.approved / stats.total) * 100) || 0}%`}
              icon={IoCheckmarkCircle}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`${stats.approved} approved, ${stats.pending} pending`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Engagement Trend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2">
              <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getMonthlyTrends()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="courses"
                      stroke="#146C94"
                      fill="#146C94"
                      fillOpacity={0.3}
                      name="Courses Added"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="views"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Total Views"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Enrollments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="space-y-4">
              {/* Category Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">
                  Courses by Category
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        dataKey="value"
                      >
                        {getCategoryDistribution().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Approval Status */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getApprovalDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Courses */}
          {topCourses.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Performing Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topCourses.map((course, index) => (
                  <div
                    key={course._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </div>
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/48?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaEye size={10} /> {course.views || 0} views
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <FaUserGraduate size={10} /> {course.enrollments || 0}{" "}
                          enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or organization..."
                  className="bg-transparent outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
              >
                <option value="all">All Categories</option>
                {CourseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                {/* Also show any custom categories from existing courses */}
                {availableCategories
                  .filter((cat) => !CourseCategories.includes(cat))
                  .map((category) => (
                    <option key={category} value={category}>
                      {category} (Custom)
                    </option>
                  ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>

              {(searchText ||
                categoryFilter !== "all" ||
                statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                >
                  <BiReset /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Showing {sortedCourses.length} of {stats.total} courses
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching your courses..." />
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onView={(course) => setViewModal({ show: true, course })}
                      onEdit={(course) => handleOpenForm(course)}
                      onDelete={(course) =>
                        setDeleteModal({ show: true, course })
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No courses found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first course
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedCourses.length > 0 ? (
                  <CoursesTable
                    data={paginatedCourses}
                    onView={(course) => setViewModal({ show: true, course })} // Make sure this is correct
                    onEdit={(course) => handleOpenForm(course)} // Make sure this is correct
                    onDelete={(course) =>
                      setDeleteModal({ show: true, course })
                    } // Make sure this is correct
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No courses found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first course
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* View Modal */}
          {/* View Modal */}
          {viewModal.show && viewModal.course && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#146C94" }}
                  >
                    Course Details
                  </h2>
                  <button
                    onClick={() => setViewModal({ show: false, course: null })}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Course Image */}
                {viewModal.course.image && (
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={viewModal.course.image}
                      alt={viewModal.course.title}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 right-4">
                      {viewModal.course.approved ? (
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm flex items-center gap-1">
                          <IoCheckmarkCircle size={14} />
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm flex items-center gap-1">
                          <IoTimeOutline size={14} />
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-3">
                    {viewModal.course.title}
                  </h2>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IoPeopleOutline className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Organization</p>
                        <p className="font-medium">
                          {viewModal.course.organization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdOutlineCategory className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium">
                          {viewModal.course.category}
                        </p>
                      </div>
                    </div>
                    {viewModal.course.tag && (
                      <div className="flex items-center gap-2">
                        <HiOutlineTag className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Tag</p>
                          <p className="font-medium">#{viewModal.course.tag}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FaRegCalendarAlt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium">
                          {moment(viewModal.course.createdAt).format(
                            "MMM DD, YYYY",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewModal.course.desc}
                    </p>
                  </div>

                  {/* Course Link */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Course Link</h3>
                    <a
                      href={viewModal.course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                    >
                      <MdOutlineLink />
                      {viewModal.course.link}
                    </a>
                  </div>

                  {/* Contact Email */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Contact Email</h3>
                    <div className="flex items-center gap-2">
                      <MdOutlineEmail className="text-gray-500" />
                      <a
                        href={`mailto:${viewModal.course.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {viewModal.course.email}
                      </a>
                    </div>
                  </div>

                  {/* Analytics */}
                  {/* <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Engagement Analytics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Total Views</p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#146C94" }}
                        >
                          {viewModal.course.views || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Enrollments</p>
                        <p className="text-2xl font-bold text-green-600">
                          {viewModal.course.enrollments || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {viewModal.course.views &&
                          viewModal.course.enrollments
                            ? Math.round(
                                (viewModal.course.enrollments /
                                  viewModal.course.views) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setViewModal({ show: false, course: null })}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Update Form Modal */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      {formModal.course ? "Edit Course" : "Create New Course"}
                    </h2>
                    <button
                      onClick={() =>
                        setFormModal({ show: false, course: null })
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitForm} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Course Image <span className="text-red-500">*</span>
                      </label>
                      <ImageUpload
                        onImageUpload={(url) =>
                          setFormData({ ...formData, image: url })
                        }
                        defaultImage={formData.image}
                        folder="courses"
                        buttonText="Upload Course Image"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Enter course title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.desc}
                        onChange={(e) =>
                          setFormData({ ...formData, desc: e.target.value })
                        }
                        required
                        rows="4"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Describe your course..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Organization <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500">
                          This will be automatically filled with your
                          organization's name.
                        </p>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            })
                          }
                          required
                          disabled
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none cursor-not-allowed bg-gray-100"
                          placeholder={
                            user?.organizationName || "Your organization name"
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                        >
                          <option value="">Select a category</option>
                          {CourseCategories?.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tags for better search (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.tag}
                          onChange={(e) =>
                            setFormData({ ...formData, tag: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="e.g., beginner, advanced"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Course Contact Email{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-1">
                          This will be automatically filled with your account's
                          email.
                        </p>
                        <input
                          type="email"
                          value={formData.email || user?.email || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none cursor-not-allowed bg-gray-100"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Course Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.link}
                        onChange={(e) =>
                          setFormData({ ...formData, link: e.target.value })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="https://example.com/course"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormModal({ show: false, course: null })
                        }
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {formModal.course ? "Updating..." : "Creating..."}
                          </>
                        ) : formModal.course ? (
                          "Update Course"
                        ) : (
                          "Create Course"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && deleteModal.course && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AiOutlineDelete className="text-red-600 text-2xl" />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-center mb-3">
                    Confirm Delete
                  </h2>

                  <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      "{deleteModal.course.title}"
                    </span>
                    ? This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setDeleteModal({ show: false, course: null })
                      }
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleDeleteCourse}
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingAction ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LeadersCourses;

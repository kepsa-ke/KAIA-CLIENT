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
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";
import {
  FaRegCalendarAlt,
  FaEye,
  FaThumbsUp,
  FaChartLine,
  FaLink,
} from "react-icons/fa";
import {
  MdOutlineCategory,
  MdOutlineEmail,
  MdOutlineLink,
  MdTrendingUp,
  MdTrendingDown,
  MdOutlineDescription,
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
} from "recharts";

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

// Insight Card Component for Mobile
const InsightCard = ({ insight, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {insight.image ? (
            <img
              src={insight.image}
              alt={insight.title}
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
          <h3 className="font-semibold text-lg line-clamp-1">
            {insight.title}
          </h3>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {insight.tags &&
              insight.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div
              className="flex items-center gap-1"
              style={{ color: "#146C94" }}
            >
              <FaEye size={12} />
              <span className="font-semibold">{insight.views || 0}</span>
              <span className="text-gray-500 text-xs">views</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <FaLink size={12} />
              <span className="font-semibold">{insight.clicks || 0}</span>
              <span className="text-gray-500 text-xs">clicks</span>
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-2">
            {insight.approved ? (
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
              onClick={() => onView(insight)}
              title="View"
            />
            <AiOutlineEdit
              size={18}
              className="text-blue-600 cursor-pointer hover:scale-110"
              title="Edit"
              onClick={() => onEdit(insight)}
            />
            <AiOutlineDelete
              size={18}
              className="text-red-600 cursor-pointer hover:scale-110"
              onClick={() => onDelete(insight)}
              title="Delete"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop Table Component
const InsightsTable = ({ data, onView, onEdit, onDelete }) => (
  <table className="w-full border border-gray-300 text-sm hidden md:table">
    <thead className="bg-gray-100 border-b border-gray-300">
      <tr>
        <th className="p-2 text-left font-semibold border-r">Image</th>
        <th className="p-2 text-left font-semibold border-r">Title</th>
        <th className="p-2 text-left font-semibold border-r">
          Date of Insight
        </th>
        <th className="p-2 text-left font-semibold border-r">Tags</th>
        <th className="p-2 text-left font-semibold border-r">Status</th>
        <th className="p-2 text-left font-semibold border-r">Stats</th>
        <th className="p-2 text-left font-semibold border-r">Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map((insight) => (
        <tr key={insight._id} className="even:bg-gray-50 hover:bg-gray-100">
          <td className="p-2 border-r">
            {insight.image ? (
              <img
                src={insight.image}
                alt={insight.title}
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
            <div className="line-clamp-2">{insight.title}</div>
          </td>
          <td className="p-2 border-r">
            {moment(insight.dateOfInsight).format("MMM DD, YYYY")}
          </td>
          <td className="p-2 border-r">
            <div className="flex flex-wrap gap-1">
              {insight.tags &&
                insight.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </td>
          <td className="p-2 border-r">
            {insight.approved ? (
              <span className="flex items-center gap-1 text-green-600">
                <IoCheckmarkCircle /> Approved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600">
                <IoTimeOutline /> Pending
              </span>
            )}
          </td>
          <td className="p-2 border-r">
            <div className="flex gap-2 text-xs">
              <span className="text-[#146C94]">👁️ {insight.views || 0}</span>
              <span className="text-green-600">🔗 {insight.clicks || 0}</span>
            </div>
          </td>
          <td className="p-2">
            <div className="flex gap-2 items-center">
              <AiOutlineEye
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onView(insight)}
                title="View"
              />
              <AiOutlineEdit
                size={18}
                className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                title="Edit"
                onClick={() => onEdit(insight)}
              />
              <AiOutlineDelete
                size={18}
                className="text-red-600 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onDelete(insight)}
                title="Delete"
              />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LeadersInsight = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModal, setViewModal] = useState({ show: false, insight: null });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    insight: null,
  });
  const [formModal, setFormModal] = useState({ show: false, insight: null });

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    dateOfInsight: "",
    insightSummary: "",
    linkToFullReport: "",
    methodologyInBrief: "",
    tags: "",
  });

  const recordsPerPage = 10;

  // Fetch organization's insights
  const handleFetchMyInsights = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/insights/my-reports", config);

      let insightsData = [];
      if (data?.data && Array.isArray(data.data)) {
        insightsData = data.data;
      } else if (Array.isArray(data)) {
        insightsData = data;
      }

      setInsights(insightsData);
    } catch (err) {
      console.error("Error fetching insights:", err);
      toast.error(
        err.response?.data?.message || "Error fetching your insights",
      );
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyInsights();
    }
  }, [user]);

  // Calculate statistics
  const stats = {
    total: insights.length,
    approved: insights.filter((i) => i.approved).length,
    pending: insights.filter((i) => !i.approved).length,
    totalViews: insights.reduce((sum, i) => sum + (i.views || 0), 0),
    totalClicks: insights.reduce((sum, i) => sum + (i.clicks || 0), 0),
    avgViewsPerInsight:
      insights.length > 0
        ? Math.round(
            insights.reduce((sum, i) => sum + (i.views || 0), 0) /
              insights.length,
          )
        : 0,
    uniqueTags: [...new Set(insights.flatMap((i) => i.tags || []))].length,
  };

  // Get monthly trends
  const getMonthlyTrends = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, "months").format("MMM YYYY");
      last6Months.push({ month, insights: 0, views: 0, clicks: 0 });
    }

    insights.forEach((insight) => {
      const insightMonth = moment(insight.createdAt).format("MMM YYYY");
      const monthData = last6Months.find((m) => m.month === insightMonth);
      if (monthData) {
        monthData.insights++;
        monthData.views += insight.views || 0;
        monthData.clicks += insight.clicks || 0;
      }
    });

    return last6Months;
  };

  // Get approval distribution
  const getApprovalDistribution = () => {
    return [
      { name: "Approved", value: stats.approved },
      { name: "Pending", value: stats.pending },
    ];
  };

  // Get top performing insights
  const topInsights = [...insights]
    .filter((i) => i.approved)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Filter insights
  const filteredInsights = insights.filter((insight) => {
    if (!insight) return false;

    const matchesSearch =
      insight.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      insight.insightSummary
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      insight.tags?.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && insight.approved) ||
      (statusFilter === "pending" && !insight.approved);

    return matchesSearch && matchesStatus;
  });

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedInsights = sortedInsights.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedInsights.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
  };

  // Delete Insight
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteInsight = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/insights/${deleteModal.insight._id}`, config);
      toast.success("Insight deleted successfully");
      setDeleteModal({ show: false, insight: null });
      handleFetchMyInsights();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting insight");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle form open
  const handleOpenForm = (insightItem = null) => {
    if (insightItem) {
      setFormData({
        title: insightItem.title || "",
        image: insightItem.image || "",
        dateOfInsight: insightItem.dateOfInsight
          ? moment(insightItem.dateOfInsight).format("YYYY-MM-DD")
          : "",
        insightSummary: insightItem.insightSummary || "",
        linkToFullReport: insightItem.linkToFullReport || "",
        methodologyInBrief: insightItem.methodologyInBrief || "",
        tags: insightItem.tags ? insightItem.tags.join(", ") : "",
      });
    } else {
      setFormData({
        title: "",
        image: "",
        dateOfInsight: "",
        insightSummary: "",
        linkToFullReport: "",
        methodologyInBrief: "",
        tags: "",
      });
    }
    setFormModal({ show: true, insight: insightItem });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      if (formModal.insight) {
        await axios.put(`/insights/${formModal.insight._id}`, payload, config);
        toast.success("Insight updated successfully and pending re-approval");
      } else {
        await axios.post("/insights", payload, config);
        toast.success("Insight submitted for admin approval");
      }
      setFormModal({ show: false, insight: null });
      handleFetchMyInsights();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving insight");
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
              <h2 className="text-2xl font-bold mb-1">My Insights</h2>
              <p className="text-gray-600">
                Create and manage your tech & AI insights, track engagement
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
            >
              <AiOutlinePlus size={18} />
              Create Insight
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Insights"
              value={stats.total}
              icon={IoBookOutline}
              color="#146C94"
              bgColor="#e6f0fa"
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={FaEye}
              color="#0b5e42"
              bgColor="#e0f2e9"
            />
            <StatsCard
              title="Total Clicks"
              value={stats.totalClicks}
              icon={FaLink}
              color="#856404"
              bgColor="#fff3cd"
            />
            <StatsCard
              title="Approval Rate"
              value={`${Math.round((stats.approved / stats.total) * 100) || 0}%`}
              icon={IoCheckmarkCircle}
              color="#0b5e42"
              bgColor="#e0f2e9"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Trend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
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
                      dataKey="insights"
                      stroke="#146C94"
                      fill="#146C94"
                      fillOpacity={0.3}
                      name="Insights Added"
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
                      dataKey="clicks"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Total Clicks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
              <div className="h-64">
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
                      outerRadius={80}
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

          {/* Top Performing Insights */}
          {topInsights.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Performing Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topInsights.map((insight, index) => (
                  <div
                    key={insight._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </div>
                    <img
                      src={insight.image}
                      alt={insight.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/48?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaEye size={10} /> {insight.views || 0} views
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <FaLink size={10} /> {insight.clicks || 0} clicks
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
                  placeholder="Search insights by title, summary, or tags..."
                  className="bg-transparent outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>

              {(searchText || statusFilter !== "all") && (
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
              Showing {sortedInsights.length} of {stats.total} insights
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching your insights..." />
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {paginatedInsights.length > 0 ? (
                  paginatedInsights.map((insight) => (
                    <InsightCard
                      key={insight._id}
                      insight={insight}
                      onView={(insight) =>
                        setViewModal({ show: true, insight })
                      }
                      onEdit={(insight) => handleOpenForm(insight)}
                      onDelete={(insight) =>
                        setDeleteModal({ show: true, insight })
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No insights found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first insight
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedInsights.length > 0 ? (
                  <InsightsTable
                    data={paginatedInsights}
                    onView={(insight) => setViewModal({ show: true, insight })}
                    onEdit={(insight) => handleOpenForm(insight)}
                    onDelete={(insight) =>
                      setDeleteModal({ show: true, insight })
                    }
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No insights found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first insight
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
          {viewModal.show && viewModal.insight && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#146C94" }}
                  >
                    Insight Details
                  </h2>
                  <button
                    onClick={() => setViewModal({ show: false, insight: null })}
                    className="text-gray-500 hover:text-gray-700"
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

                {/* Insight Image */}
                {viewModal.insight.image && (
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={viewModal.insight.image}
                      alt={viewModal.insight.title}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 right-4">
                      {viewModal.insight.approved ? (
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

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-3">
                    {viewModal.insight.title}
                  </h2>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaRegCalendarAlt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Date of Insight</p>
                        <p className="font-medium">
                          {moment(viewModal.insight.dateOfInsight).format(
                            "MMM DD, YYYY",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineTag className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Tags</p>
                        <p className="font-medium">
                          {viewModal.insight.tags?.join(", ") || "No tags"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewModal.insight.insightSummary}
                    </p>
                  </div>

                  {/* Methodology */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Methodology</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewModal.insight.methodologyInBrief}
                    </p>
                  </div>

                  {/* Full Report Link */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Full Report</h3>
                    <a
                      href={viewModal.insight.linkToFullReport}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                    >
                      <MdOutlineLink />
                      {viewModal.insight.linkToFullReport}
                    </a>
                  </div>

                  {/* Analytics */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Engagement Analytics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Total Views</p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#146C94" }}
                        >
                          {viewModal.insight.views || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Link Clicks</p>
                        <p className="text-2xl font-bold text-green-600">
                          {viewModal.insight.clicks || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setViewModal({ show: false, insight: null })}
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
                      {formModal.insight
                        ? "Edit Insight"
                        : "Create New Insight"}
                    </h2>
                    <button
                      onClick={() =>
                        setFormModal({ show: false, insight: null })
                      }
                      className="text-gray-500 hover:text-gray-700"
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
                  <form onSubmit={handleSubmitForm} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Image <span className="text-red-500">*</span>
                      </label>
                      <ImageUpload
                        onImageUpload={(url) =>
                          setFormData({ ...formData, image: url })
                        }
                        defaultImage={formData.image}
                        folder="insights"
                        buttonText="Upload Insight Image"
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
                        placeholder="Enter insight title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date of Insight <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfInsight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfInsight: e.target.value,
                          })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Insight Summary <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.insightSummary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            insightSummary: e.target.value,
                          })
                        }
                        required
                        rows="4"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Summarize the key insight..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Methodology (Brief){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.methodologyInBrief}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            methodologyInBrief: e.target.value,
                          })
                        }
                        required
                        rows="3"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Briefly describe how this insight was derived..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Link to Full Report{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.linkToFullReport}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            linkToFullReport: e.target.value,
                          })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="https://example.com/full-report"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="LLM, Computer Vision, NLP, MLOps, etc."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate tags with commas (e.g., "AI, Machine Learning,
                        Ethics")
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormModal({ show: false, insight: null })
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
                            {formModal.insight ? "Updating..." : "Creating..."}
                          </>
                        ) : formModal.insight ? (
                          "Update Insight"
                        ) : (
                          "Create Insight"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && deleteModal.insight && (
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
                      "{deleteModal.insight.title}"
                    </span>
                    ? This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setDeleteModal({ show: false, insight: null })
                      }
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleDeleteInsight}
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

export default LeadersInsight;

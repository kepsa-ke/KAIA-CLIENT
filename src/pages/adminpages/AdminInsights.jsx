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
  AiOutlineClose,
  AiOutlineCheck,
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
  IoEyeOutline,
  IoCreateOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import {
  FaRegCalendarAlt,
  FaEye,
  FaThumbsUp,
  FaChartLine,
  FaLink,
  FaCheckCircle,
} from "react-icons/fa";
import {
  MdOutlineCategory,
  MdOutlineEmail,
  MdOutlineLink,
  MdTrendingUp,
  MdTrendingDown,
  MdOutlineCancel,
  MdOutlineDescription,
} from "react-icons/md";
import { HiOutlinePhotograph, HiOutlineTag } from "react-icons/hi";
import { BiReset } from "react-icons/bi";
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
import ImageUpload from "../../components/common/ImageUpload";

const COLORS = [
  "#146C94",
  "#19A7CE",
  "#AFD3E2",
  "#F6F1F1",
  "#FF8042",
  "#00C49F",
  "#10B981",
  "#F59E0B",
];

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
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
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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

// Approval Badge Component
const ApprovalBadge = ({ approved }) => {
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
        <IoCheckmarkCircle size={12} />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
      <IoTimeOutline size={12} />
      Pending
    </span>
  );
};

// Insights Table Component (Desktop)
const InsightsTable = ({
  data,
  onView,
  onEdit,
  onDelete,
  onToggleApproval,
  onToggleFeatured,
  loadingApproval,
}) => (
  <table className="w-full border border-gray-300 text-sm">
    <thead className="bg-gray-100 border-b border-gray-300">
      <tr>
        <th className="p-2 text-left font-semibold border-r">Image</th>
        <th className="p-2 text-left font-semibold border-r">Title</th>
        <th className="p-2 text-left font-semibold border-r">Organization</th>
        <th className="p-2 text-left font-semibold border-r">Date</th>
        <th className="p-2 text-left font-semibold border-r">Tags</th>
        <th className="p-2 text-left font-semibold border-r">Status</th>
        <th className="p-2 text-left font-semibold border-r">Featured</th>
        <th className="p-2 text-left font-semibold border-r">Stats</th>
        <th className="p-2 text-left font-semibold border-r">Created By</th>
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
          <td className="p-2 border-r">{insight.organizationName}</td>
          <td className="p-2 border-r text-xs">
            {moment(insight.dateOfInsight).format("MMM DD, YYYY")}
          </td>
          <td className="p-2 border-r">
            <div className="flex flex-wrap gap-1">
              {insight.tags &&
                insight.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </td>
          <td className="p-2 border-r">
            <ApprovalBadge approved={insight.approved} />
          </td>
          <td className="p-2 border-r">
            {insight.isFeatured ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                ⭐ Featured
              </span>
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </td>
          <td className="p-2 border-r">
            <div className="flex gap-2 text-xs">
              <span className="text-[#146C94]">👁️ {insight.views || 0}</span>
              <span className="text-green-600">🔗 {insight.clicks || 0}</span>
            </div>
          </td>
          <td className="p-2 border-r">
            <div>
              <div className="font-medium text-xs">
                {insight.createdBy?.organizationName ||
                  insight.organizationName}
              </div>
              <div className="text-xs text-gray-500">
                {insight.createdBy?.email?.split("@")[0] || ""}
              </div>
            </div>
          </td>
          <td className="p-2">
            <div className="flex gap-2 items-center flex-wrap">
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
              {loadingApproval === insight._id ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {insight.approved ? (
                    <FaCheckCircle
                      size={18}
                      className="text-green-600 cursor-pointer hover:scale-110 transition-transform"
                      title="Revoke Approval"
                      onClick={() => onToggleApproval(insight)}
                    />
                  ) : (
                    <MdOutlineCancel
                      size={18}
                      className="text-orange-500 cursor-pointer hover:scale-110 transition-transform"
                      title="Approve"
                      onClick={() => onToggleApproval(insight)}
                    />
                  )}
                  <button
                    onClick={() => onToggleFeatured(insight)}
                    title={
                      insight.isFeatured ? "Remove Featured" : "Make Featured"
                    }
                    className={`cursor-pointer hover:scale-110 transition-transform ${
                      insight.isFeatured ? "text-purple-600" : "text-gray-400"
                    }`}
                  >
                    ⭐
                  </button>
                </>
              )}
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

// Insight Card Component (Mobile)
const InsightCard = ({
  insight,
  onView,
  onEdit,
  onDelete,
  onToggleApproval,
  onToggleFeatured,
  loadingApproval,
}) => (
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
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1 flex-1">
            {insight.title}
          </h3>
          {insight.isFeatured && (
            <span className="text-purple-600 text-sm ml-2">⭐</span>
          )}
        </div>

        {/* Organization */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <IoPeopleOutline size={12} />
            {insight.organizationName}
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {insight.tags &&
            insight.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-sm">
          <div className="flex items-center gap-1" style={{ color: "#146C94" }}>
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
          <ApprovalBadge approved={insight.approved} />
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
          {loadingApproval === insight._id ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {insight.approved ? (
                <MdOutlineCancel
                  size={18}
                  className="text-orange-500 cursor-pointer hover:scale-110"
                  title="Revoke Approval"
                  onClick={() => onToggleApproval(insight)}
                />
              ) : (
                <FaCheckCircle
                  size={18}
                  className="text-green-600 cursor-pointer hover:scale-110"
                  title="Approve"
                  onClick={() => onToggleApproval(insight)}
                />
              )}
              <button
                onClick={() => onToggleFeatured(insight)}
                className={`cursor-pointer hover:scale-110 ${
                  insight.isFeatured ? "text-purple-600" : "text-gray-400"
                }`}
                title={insight.isFeatured ? "Remove Featured" : "Make Featured"}
              >
                ⭐
              </button>
            </>
          )}
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

const AdminInsights = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, insight: null });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    insight: null,
  });
  const [formModal, setFormModal] = useState({ show: false, insight: null });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [availableOrganizations, setAvailableOrganizations] = useState([]);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);

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

  // Fetch all insights (admin)
  const handleFetchInsights = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/insights/", config);

      let insightsData = response.data.data || response.data || [];
      setInsights(insightsData);

      // Extract unique organizations
      const orgs = [
        ...new Set(insightsData.map((insight) => insight.organizationName)),
      ];
      setAvailableOrganizations(orgs);

      // Extract organization stats
      const orgStats = {};
      insightsData.forEach((insight) => {
        const orgName = insight.organizationName;
        if (!orgStats[orgName]) {
          orgStats[orgName] = {
            name: orgName,
            insightCount: 0,
            totalViews: 0,
            totalClicks: 0,
            approvedCount: 0,
          };
        }
        orgStats[orgName].insightCount++;
        orgStats[orgName].totalViews += insight.views || 0;
        orgStats[orgName].totalClicks += insight.clicks || 0;
        if (insight.approved) orgStats[orgName].approvedCount++;
      });
      setOrganizations(Object.values(orgStats));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching insights");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token && user?.isAdmin) {
      handleFetchInsights();
    }
  }, [user]);

  // Calculate comprehensive stats
  const stats = {
    total: insights.length,
    approved: insights.filter((i) => i.approved).length,
    pending: insights.filter((i) => !i.approved).length,
    featured: insights.filter((i) => i.isFeatured).length,
    totalViews: insights.reduce((sum, i) => sum + (i.views || 0), 0),
    totalClicks: insights.reduce((sum, i) => sum + (i.clicks || 0), 0),
    totalOrganizations: organizations.length,
    avgViewsPerInsight:
      insights.length > 0
        ? Math.round(
            insights.reduce((sum, i) => sum + (i.views || 0), 0) /
              insights.length,
          )
        : 0,
    totalTags: [...new Set(insights.flatMap((i) => i.tags || []))].length,
  };

  // Get monthly trends
  const getMonthlyTrends = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, "months").format("MMM YYYY");
      last6Months.push({
        month,
        insights: 0,
        views: 0,
        clicks: 0,
        approved: 0,
      });
    }

    insights.forEach((insight) => {
      const insightMonth = moment(insight.createdAt).format("MMM YYYY");
      const monthData = last6Months.find((m) => m.month === insightMonth);
      if (monthData) {
        monthData.insights++;
        monthData.views += insight.views || 0;
        monthData.clicks += insight.clicks || 0;
        if (insight.approved) monthData.approved++;
      }
    });

    return last6Months;
  };

  // Get tag distribution
  const getTagDistribution = () => {
    const tagMap = new Map();
    insights.forEach((insight) => {
      (insight.tags || []).forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  };

  // Get approval distribution
  const getApprovalDistribution = () => {
    return [
      { name: "Approved", value: stats.approved },
      { name: "Pending", value: stats.pending },
    ];
  };

  // Get popular insights (top 5 by views)
  const popularInsights = [...insights]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Get top organizations
  const topOrganizations = [...organizations]
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5);

  // Filter insights
  const filteredInsights = insights.filter((insight) => {
    const matchesSearch =
      insight.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      insight.insightSummary
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      insight.methodologyInBrief
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      insight.tags?.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase()),
      );

    const matchesOrganization =
      organizationFilter === "all" ||
      insight.organizationName === organizationFilter;

    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && insight.approved) ||
      (approvalFilter === "pending" && !insight.approved);

    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange =
        matchesDateRange &&
        moment(insight.createdAt).isSameOrAfter(moment(dateRange.start), "day");
    }
    if (dateRange.end) {
      matchesDateRange =
        matchesDateRange &&
        moment(insight.createdAt).isSameOrBefore(moment(dateRange.end), "day");
    }

    return (
      matchesSearch &&
      matchesOrganization &&
      matchesApproval &&
      matchesDateRange
    );
  });

  const sortedInsights = [...filteredInsights].sort(
    (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
  );

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedInsights = sortedInsights.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedInsights.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, organizationFilter, approvalFilter, dateRange]);

  const clearFilters = () => {
    setSearchText("");
    setOrganizationFilter("all");
    setApprovalFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Toggle Approval
  const handleToggleApproval = async (insight) => {
    try {
      setLoadingApproval(insight._id);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(`/insights/${insight._id}/toggle-approval`, {}, config);
      toast.success(
        `Insight ${insight.approved ? "unapproved" : "approved"} successfully`,
      );
      handleFetchInsights();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update approval status",
      );
    } finally {
      setLoadingApproval(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (insight) => {
    try {
      setLoadingFeatured(insight._id);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(`/insights/${insight._id}/toggle-featured`, {}, config);
      toast.success(
        `Insight ${insight.isFeatured ? "removed from featured" : "featured"} successfully`,
      );
      handleFetchInsights();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update featured status",
      );
    } finally {
      setLoadingFeatured(null);
    }
  };

  // Delete Insight
  const handleDeleteInsight = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/insights/${deleteModal.insight._id}`, config);
      toast.success("Insight deleted successfully");
      setDeleteModal({ show: false, insight: null });
      handleFetchInsights();
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
        toast.success("Insight updated successfully");
      } else {
        await axios.post("/insights", payload, config);
        toast.success("Insight created successfully");
      }
      setFormModal({ show: false, insight: null });
      handleFetchInsights();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving insight");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 mb-8 mt-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Insights Management</h2>
              <p className="text-gray-600">
                Manage all tech & AI insights, approve content, and track
                performance
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
              subtitle={`${stats.approved} approved, ${stats.pending} pending`}
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={FaEye}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`Avg ${stats.avgViewsPerInsight} per insight`}
            />
            <StatsCard
              title="Total Clicks"
              value={stats.totalClicks}
              icon={FaLink}
              color="#856404"
              bgColor="#fff3cd"
            />
            <StatsCard
              title="Organizations"
              value={stats.totalOrganizations}
              icon={IoPeopleOutline}
              color="#6b21a8"
              bgColor="#f3e8ff"
              subtitle={`${stats.featured} featured insights`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Performance Trends */}
            <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Insight Performance Trends
              </h3>
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
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="approved"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Approved"
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

            {/* Approval & Tag Distribution */}
            <div className="space-y-4">
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

              {/* Tag Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTagDistribution()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#146C94" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Insights & Top Organizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Popular Insights */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🔥 Most Viewed Insights
              </h3>
              <div className="space-y-3">
                {popularInsights.map((insight, index) => (
                  <div
                    key={insight._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index % COLORS.length] }}
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
                        <span>{insight.organizationName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaEye size={10} /> {insight.views || 0} views
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <FaLink size={10} /> {insight.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                    <ApprovalBadge approved={insight.approved} />
                  </div>
                ))}
                {popularInsights.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No insights yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Organizations */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Contributing Organizations
              </h3>
              <div className="space-y-3">
                {topOrganizations.map((org, index) => (
                  <div
                    key={org.name}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span
                        className="text-lg font-semibold"
                        style={{ color: "#146C94" }}
                      >
                        {org.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{org.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>{org.insightCount} insights</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaEye size={10} /> {org.totalViews} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <FaLink size={10} /> {org.totalClicks} clicks
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {Math.round((org.approvedCount / org.insightCount) * 100)}
                      % approved
                    </span>
                  </div>
                ))}
                {topOrganizations.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No organizations yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search insights by title, summary, methodology, or tags..."
                    className="bg-transparent outline-none w-full"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FaChartLine />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <select
                    value={organizationFilter}
                    onChange={(e) => setOrganizationFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                  >
                    <option value="all">All Organizations</option>
                    {availableOrganizations.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>

                  <select
                    value={approvalFilter}
                    onChange={(e) => setApprovalFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved Only</option>
                    <option value="pending">Pending Only</option>
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              )}

              {(searchText ||
                organizationFilter !== "all" ||
                approvalFilter !== "all" ||
                dateRange.start ||
                dateRange.end) && (
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {searchText && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Search: {searchText}
                      </span>
                    )}
                    {organizationFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Org: {organizationFilter}
                      </span>
                    )}
                    {approvalFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Status:{" "}
                        {approvalFilter === "approved" ? "Approved" : "Pending"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <BiReset /> Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Showing {sortedInsights.length} of {stats.total} insights
            </h3>
          </div>

          {/* Insights Table/Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching insights..." />
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
                      onEdit={handleOpenForm}
                      onDelete={(insight) =>
                        setDeleteModal({ show: true, insight })
                      }
                      onToggleApproval={handleToggleApproval}
                      onToggleFeatured={handleToggleFeatured}
                      loadingApproval={loadingApproval || loadingFeatured}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No insights found</p>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border">
                {paginatedInsights.length > 0 ? (
                  <InsightsTable
                    data={paginatedInsights}
                    onView={(insight) => setViewModal({ show: true, insight })}
                    onEdit={handleOpenForm}
                    onDelete={(insight) =>
                      setDeleteModal({ show: true, insight })
                    }
                    onToggleApproval={handleToggleApproval}
                    onToggleFeatured={handleToggleFeatured}
                    loadingApproval={loadingApproval || loadingFeatured}
                  />
                ) : (
                  <div className="text-center py-12">
                    <IoBookOutline
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No insights found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 gap-2">
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
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                {viewModal.insight.image && (
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={viewModal.insight.image}
                      alt={viewModal.insight.title}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 right-4">
                      <ApprovalBadge approved={viewModal.insight.approved} />
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#0067b8" }}
                    >
                      {viewModal.insight.title}
                    </h2>
                    {viewModal.insight.isFeatured && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IoPeopleOutline className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Organization</p>
                        <p className="font-medium">
                          {viewModal.insight.organizationName}
                        </p>
                      </div>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <FaRegCalendarAlt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium">
                          {moment(viewModal.insight.createdAt).format(
                            "MMM DD, YYYY",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <IoPeopleOutline className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Created By</p>
                        <p className="font-medium">
                          {viewModal.insight.createdBy?.organizationName ||
                            "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {viewModal.insight.createdBy?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {viewModal.insight.insightSummary}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Methodology</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {viewModal.insight.methodologyInBrief}
                      </p>
                    </div>

                    <div>
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

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">
                        Engagement Analytics
                      </h3>
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

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() =>
                        setViewModal({ show: false, insight: null })
                      }
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create/Update Form Modal */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mb-4">
                      {formModal.insight
                        ? "Edit Insight"
                        : "Create New Insight"}
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setFormModal({ show: false, insight: null })
                      }
                      className="px-4 py-2 bg-[#E0A200] rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
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
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationName: e.target.value,
                          })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Organization name"
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
                        className="px-4 py-2 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
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
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInsights;

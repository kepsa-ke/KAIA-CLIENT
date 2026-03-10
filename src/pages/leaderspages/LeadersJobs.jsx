// pages/leaders/LeadersJobs.jsx
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineLink,
  AiOutlineClose,
} from "react-icons/ai";
import {
  IoTrashBinOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoBriefcaseOutline,
  IoCashOutline,
} from "react-icons/io5";
import {
  FaCheckCircle,
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaRegCalendarAlt,
  FaEye,
  FaBuilding,
  FaClock,
  FaLevelUpAlt,
  FaDollarSign,
} from "react-icons/fa";
import {
  MdPrivateConnectivity,
  MdOutlineDateRange,
  MdOnlinePrediction,
  MdLocationOn,
  MdAttachEmail,
  MdPhone,
  MdTrendingUp,
  MdTrendingDown,
  MdWork,
  MdAttachMoney,
} from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiReset, BiTime, BiCalendar, BiWorld } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import { TfiLocationPin } from "react-icons/tfi";
import {
  BsBriefcase,
  BsCalendarEvent,
  BsCalendarCheck,
  BsCalendarX,
  BsPeople,
  BsGraphUp,
  BsCashStack,
} from "react-icons/bs";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import ImageUpload from "../../components/common/ImageUpload";
import AdminLayout from "../../components/adminComponents/AdminLayout";

const COLORS = [
  "#146C94",
  "#19A7CE",
  "#AFD3E2",
  "#F6F1F1",
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#FF6B6B",
];

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  subtitle,
  trend,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3
          className="text-3xl font-bold"
          style={{ color: color || "#146C94" }}
        >
          {value.toLocaleString()}
        </h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.direction === "up" ? (
              <MdTrendingUp className="text-green-600" />
            ) : (
              <MdTrendingDown className="text-red-600" />
            )}
            <span
              className={`text-xs ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {trend.value}% from last month
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-lg`}
        style={{ backgroundColor: bgColor || "#e6f0fa" }}
      >
        <Icon className="text-2xl" style={{ color: color || "#146C94" }} />
      </div>
    </div>
  </div>
);

// Work Mode Badge Component
const WorkModeBadge = ({ mode }) => {
  const config = {
    remote: { bg: "#e6f0fa", text: "#0067b8", icon: FaVideo, label: "Remote" },
    onsite: {
      bg: "#fee2e2",
      text: "#991b1b",
      icon: FaMapMarkerAlt,
      label: "On-site",
    },
    hybrid: {
      bg: "#f3e8ff",
      text: "#6b21a8",
      icon: MdOnlinePrediction,
      label: "Hybrid",
    },
  };

  const { bg, text, icon: Icon, label } = config[mode] || config.onsite;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
};

// Experience Level Badge
const ExperienceBadge = ({ level }) => {
  const config = {
    entry: { bg: "#e6f0fa", text: "#0067b8", label: "Entry Level" },
    mid: { bg: "#e0f2e9", text: "#0b5e42", label: "Mid Level" },
    senior: { bg: "#fee2e2", text: "#991b1b", label: "Senior Level" },
    lead: { bg: "#f3e8ff", text: "#6b21a8", label: "Lead" },
    executive: { bg: "#fff3cd", text: "#856404", label: "Executive" },
  };

  const { bg, text, label } = config[level] || config.mid;

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

// Job Type Badge
const JobTypeBadge = ({ type }) => {
  const config = {
    "full-time": { bg: "#e0f2e9", text: "#0b5e42", label: "Full Time" },
    "part-time": { bg: "#fff3cd", text: "#856404", label: "Part Time" },
    contract: { bg: "#e6f0fa", text: "#0067b8", label: "Contract" },
    internship: { bg: "#f3e8ff", text: "#6b21a8", label: "Internship" },
    freelance: { bg: "#fee2e2", text: "#991b1b", label: "Freelance" },
  };

  const { bg, text, label } = config[type] || config["full-time"];

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

const LeadersJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, job: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
  const [formModal, setFormModal] = useState({ show: false, job: null });
  const [formData, setFormData] = useState({
    title: "",
    about: "",
    type: "full-time",
    workMode: "remote",
    location: "",
    requirements: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    isNegotiable: false,
    applyLink: "",
    applicationDeadline: "",
    companyName: "",
    companyLogo: "",
    companyWebsite: "",
    category: "",
    tags: "",
    experienceLevel: "mid",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);

  const recordsPerPage = 10;

  // Fetch leader's jobs
  const handleFetchMyJobs = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/jobs/my-jobs", config);

      // Handle different response formats
      let jobsData = [];
      if (Array.isArray(data)) {
        jobsData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        jobsData = data.data;
      } else if (data?.jobs && Array.isArray(data.jobs)) {
        jobsData = data.jobs;
      }

      setJobs(jobsData);

      // Extract unique categories for filter
      const categories = [
        ...new Set(jobsData.map((item) => item.category).filter(Boolean)),
      ];
      setAvailableCategories(categories);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error(err.response?.data?.error || "Error fetching your jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyJobs();
    }
  }, [user]);

  // Calculate comprehensive stats
  const stats = {
    total: jobs.length,
    published: jobs.filter((j) => j.published).length,
    unpublished: jobs.filter((j) => !j.published).length,
    totalViews: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0),
    totalApplications: jobs.reduce(
      (sum, j) => sum + (j.applicationClicks || 0),
      0,
    ),

    // Job type breakdown
    fullTime: jobs.filter((j) => j.type === "full-time").length,
    partTime: jobs.filter((j) => j.type === "part-time").length,
    contract: jobs.filter((j) => j.type === "contract").length,
    internship: jobs.filter((j) => j.type === "internship").length,
    freelance: jobs.filter((j) => j.type === "freelance").length,

    // Work mode breakdown
    remote: jobs.filter((j) => j.workMode === "remote").length,
    onsite: jobs.filter((j) => j.workMode === "onsite").length,
    hybrid: jobs.filter((j) => j.workMode === "hybrid").length,

    // Experience breakdown
    entry: jobs.filter((j) => j.experienceLevel === "entry").length,
    mid: jobs.filter((j) => j.experienceLevel === "mid").length,
    senior: jobs.filter((j) => j.experienceLevel === "senior").length,
    lead: jobs.filter((j) => j.experienceLevel === "lead").length,
    executive: jobs.filter((j) => j.experienceLevel === "executive").length,

    avgViewsPerJob:
      jobs.length > 0
        ? Math.round(
            jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0) / jobs.length,
          )
        : 0,
    applicationRate:
      jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0) > 0
        ? Math.round(
            (jobs.reduce((sum, j) => sum + (j.applicationClicks || 0), 0) /
              jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0)) *
              100,
          )
        : 0,
    mostViewedJob:
      jobs.length > 0
        ? jobs.reduce(
            (max, j) => ((j.viewCount || 0) > (max.viewCount || 0) ? j : max),
            jobs[0],
          )
        : null,
  };

  // Get engagement trend data for last 30 days
  const getEngagementTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({ date, views: 0, applications: 0, posted: 0 });
    }

    jobs.forEach((job) => {
      const jobDate = moment(job.createdAt).format("MMM DD");
      const dayData = last30Days.find((day) => day.date === jobDate);
      if (dayData) {
        dayData.posted++;
        dayData.views += job.viewCount || 0;
        dayData.applications += job.applicationClicks || 0;
      }
    });

    return last30Days;
  };

  // Get job type distribution
  const getTypeDistribution = () => {
    return [
      { name: "Full Time", value: stats.fullTime },
      { name: "Part Time", value: stats.partTime },
      { name: "Contract", value: stats.contract },
      { name: "Internship", value: stats.internship },
      { name: "Freelance", value: stats.freelance },
    ].filter((item) => item.value > 0);
  };

  // Get work mode distribution
  const getWorkModeDistribution = () => {
    return [
      { name: "Remote", value: stats.remote },
      { name: "On-site", value: stats.onsite },
      { name: "Hybrid", value: stats.hybrid },
    ].filter((item) => item.value > 0);
  };

  // Get experience distribution
  const getExperienceDistribution = () => {
    return [
      { name: "Entry", value: stats.entry },
      { name: "Mid", value: stats.mid },
      { name: "Senior", value: stats.senior },
      { name: "Lead", value: stats.lead },
      { name: "Executive", value: stats.executive },
    ].filter((item) => item.value > 0);
  };

  // Get top performing jobs
  const topJobs = [...jobs]
    .filter((j) => j.published)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // Filter jobs
  const filteredJobs = jobs.filter((item) => {
    if (!item) return false;

    // Search filter
    const searchFields = [
      item.title,
      item.about,
      item.companyName,
      item.location,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ].filter((field) => field != null);

    const matchesSearch = searchFields.some((f) =>
      f?.toString().toLowerCase().includes(searchText.toLowerCase()),
    );

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const itemDate = moment(item.createdAt);
      if (startDate) {
        matchesDate =
          matchesDate && itemDate.isSameOrAfter(moment(startDate), "day");
      }
      if (endDate) {
        matchesDate =
          matchesDate && itemDate.isSameOrBefore(moment(endDate), "day");
      }
    }

    // Type filter
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    // Work mode filter
    const matchesWorkMode =
      workModeFilter === "all" || item.workMode === workModeFilter;

    // Experience filter
    const matchesExperience =
      experienceFilter === "all" || item.experienceLevel === experienceFilter;

    // Category filter
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    return (
      matchesSearch &&
      matchesDate &&
      matchesType &&
      matchesWorkMode &&
      matchesExperience &&
      matchesCategory
    );
  });

  // Sort by date (newest first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = moment(a.createdAt).valueOf();
    const dateB = moment(b.createdAt).valueOf();
    return dateB - dateA;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedJobs = sortedJobs.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedJobs.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    startDate,
    endDate,
    typeFilter,
    workModeFilter,
    experienceFilter,
    selectedCategory,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setStartDate("");
    setEndDate("");
    setTypeFilter("all");
    setWorkModeFilter("all");
    setExperienceFilter("all");
    setSelectedCategory("");
    setShowDateFilter(false);
  };

  // Delete Job
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteJob = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/jobs/${deleteModal.job._id}`, config);
      setLoadingAction(false);
      toast.success("Job deleted successfully");
      setDeleteModal({ show: false, job: null });
      handleFetchMyJobs();
    } catch (error) {
      setLoadingAction(false);
      toast.error(error.response?.data?.error || "Error deleting job");
    }
  };

  // Handle form open
  const handleOpenForm = (job = null) => {
    if (job) {
      setFormData({
        title: job.title || "",
        about: job.about || "",
        type: job.type || "full-time",
        workMode: job.workMode || "remote",
        location: job.location || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : "",
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities.join("\n")
          : "",
        qualifications: Array.isArray(job.qualifications)
          ? job.qualifications.join("\n")
          : "",
        benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
        salaryMin: job.salaryRange?.min || "",
        salaryMax: job.salaryRange?.max || "",
        currency: job.salaryRange?.currency || "USD",
        isNegotiable: job.salaryRange?.isNegotiable || false,
        applyLink: job.applyLink || "",
        applicationDeadline: job.applicationDeadline
          ? moment(job.applicationDeadline).format("YYYY-MM-DD")
          : "",
        companyName: job.companyName || "",
        companyLogo: job.companyLogo || "",
        companyWebsite: job.companyWebsite || "",
        category: job.category || "",
        tags: Array.isArray(job.tags) ? job.tags.join(", ") : "",
        experienceLevel: job.experienceLevel || "mid",
      });
    } else {
      setFormData({
        title: "",
        about: "",
        type: "full-time",
        workMode: "remote",
        location: "",
        requirements: "",
        responsibilities: "",
        qualifications: "",
        benefits: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        isNegotiable: false,
        applyLink: "",
        applicationDeadline: "",
        companyName: user?.organizationName || "",
        companyLogo: "",
        companyWebsite: "",
        category: "",
        tags: "",
        experienceLevel: "mid",
      });
    }
    setFormModal({ show: true, job });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Process form data
      const jobData = {
        title: formData.title,
        about: formData.about,
        type: formData.type,
        workMode: formData.workMode,
        location: formData.location,
        requirements: formData.requirements
          .split("\n")
          .filter((item) => item.trim()),
        responsibilities: formData.responsibilities
          .split("\n")
          .filter((item) => item.trim()),
        qualifications: formData.qualifications
          .split("\n")
          .filter((item) => item.trim()),
        benefits: formData.benefits.split("\n").filter((item) => item.trim()),
        salaryRange: {
          min: formData.salaryMin ? Number(formData.salaryMin) : null,
          max: formData.salaryMax ? Number(formData.salaryMax) : null,
          currency: formData.currency,
          isNegotiable: formData.isNegotiable,
        },
        applyLink: formData.applyLink,
        applicationDeadline: formData.applicationDeadline || null,
        companyName: formData.companyName,
        companyLogo: formData.companyLogo,
        companyWebsite: formData.companyWebsite,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag),
        experienceLevel: formData.experienceLevel,
      };

      if (formModal.job) {
        await axios.put(`/jobs/${formModal.job._id}`, jobData, config);
        toast.success("Job updated successfully");
      } else {
        await axios.post("/jobs", jobData, config);
        toast.success("Job created successfully");
      }

      setFormModal({ show: false, job: null });
      handleFetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving job");
    } finally {
      setSubmitting(false);
    }
  };

  // Job Card Component for mobile
  const JobCard = ({ item }) => {
    if (!item) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="w-16 h-16 flex-shrink-0">
            {item.companyLogo ? (
              <img
                src={item.companyLogo}
                alt={item.companyName}
                className="w-full h-full object-cover rounded-lg border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/64?text=Company";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <FaBuilding size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">
              {item.title || "Untitled"}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{item.companyName}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-1">
              <WorkModeBadge mode={item.workMode} />
              <JobTypeBadge type={item.type} />
              <ExperienceBadge level={item.experienceLevel} />
            </div>

            {/* Location and Date */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <TfiLocationPin size={12} />
                {item.location || "Location TBA"}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <BiCalendar size={12} />
                Posted {moment(item.createdAt).fromNow()}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <div
                className="flex items-center gap-1"
                style={{ color: "#146C94" }}
              >
                <FaEye size={12} />
                <span className="font-semibold">{item.viewCount || 0}</span>
                <span className="text-gray-500 text-xs">views</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <AiOutlineLink size={12} />
                <span className="font-semibold">
                  {item.applicationClicks || 0}
                </span>
                <span className="text-gray-500 text-xs">applies</span>
              </div>
            </div>

            {/* Status Badge */}
            {!item.published && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                Unpublished
              </span>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, job: item })}
                title="View"
              />
              <IoCreateOutline
                size={18}
                className="text-blue-600 cursor-pointer hover:scale-110"
                title="Edit"
                onClick={() => handleOpenForm(item)}
              />
              <IoTrashBinOutline
                size={18}
                className="text-red-600 cursor-pointer hover:scale-110"
                onClick={() => setDeleteModal({ show: true, job: item })}
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Jobs Table Component for desktop
  const JobsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm hidden md:table">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          <th className="p-2 text-left font-semibold border-r">Company</th>
          <th className="p-2 text-left font-semibold border-r">Job Title</th>
          <th className="p-2 text-left font-semibold border-r">Type</th>
          <th className="p-2 text-left font-semibold border-r">Work Mode</th>
          <th className="p-2 text-left font-semibold border-r">Location</th>
          <th className="p-2 text-left font-semibold border-r">Experience</th>
          <th className="p-2 text-left font-semibold border-r">Stats</th>
          <th className="p-2 text-left font-semibold border-r">Status</th>
          <th className="p-2 text-left font-semibold border-r">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">
              <div className="flex items-center gap-2">
                {item.companyLogo ? (
                  <img
                    src={item.companyLogo}
                    alt={item.companyName}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <FaBuilding className="text-gray-400" size={20} />
                )}
                <span className="text-xs font-medium">{item.companyName}</span>
              </div>
            </td>
            <td className="p-2 border-r font-medium max-w-xs">
              <div className="line-clamp-2">{item.title || "Untitled"}</div>
            </td>
            <td className="p-2 border-r">
              <JobTypeBadge type={item.type} />
            </td>
            <td className="p-2 border-r">
              <WorkModeBadge mode={item.workMode} />
            </td>
            <td className="p-2 border-r">
              <span className="text-xs flex items-center gap-1">
                <TfiLocationPin size={10} />
                {item.location || "N/A"}
              </span>
            </td>
            <td className="p-2 border-r">
              <ExperienceBadge level={item.experienceLevel} />
            </td>
            <td className="p-2 border-r">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <AiOutlineLink size={10} className="text-gray-500" />
                  <span>{item.applicationClicks || 0} applies</span>
                </div>
              </div>
            </td>
            <td className="p-2 border-r">
              {item.published ? (
                <span className="flex items-center gap-1 text-green-600 text-xs">
                  <FaCheckCircle size={10} />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <MdPrivateConnectivity size={10} />
                  Unpublished
                </span>
              )}
            </td>
            <td className="p-2">
              <div className="flex gap-2 items-center">
                <IoEyeOutline
                  size={18}
                  className="text-[#146C94] cursor-pointer hover:scale-110"
                  onClick={() => setViewModal({ show: true, job: item })}
                  title="View"
                />
                <IoCreateOutline
                  size={18}
                  className="text-blue-600 cursor-pointer hover:scale-110"
                  title="Edit"
                  onClick={() => handleOpenForm(item)}
                />
                <IoTrashBinOutline
                  size={18}
                  className="text-red-600 cursor-pointer hover:scale-110"
                  onClick={() => setDeleteModal({ show: true, job: item })}
                  title="Delete"
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 mb-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                My Job Postings
              </h2>
              <p className="text-gray-600">
                Create and manage your job listings, track views and
                applications
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
            >
              <AiOutlinePlus size={18} />
              Post New Job
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total Jobs"
              value={stats.total}
              icon={BsBriefcase}
              color="#146C94"
              bgColor="#e6f0fa"
              subtitle={`${stats.published} active`}
            />
            {/* <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={FaEye}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`Avg ${stats.avgViewsPerJob} per job`}
            /> */}

            <StatsCard
              title="Applications"
              value={stats.totalApplications}
              icon={BsPeople}
              color="#856404"
              bgColor="#fff3cd"
              subtitle={`${stats.applicationRate}% conversion`}
            />
            <StatsCard
              title="Open Jobs"
              value={jobs.filter((j) => j.published).length}
              icon={MdWork}
              color="#6b21a8"
              bgColor="#f3e8ff"
              subtitle="Currently hiring"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Engagement Trend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Engagement Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getEngagementTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="posted"
                      stroke="#146C94"
                      fill="#146C94"
                      fillOpacity={0.3}
                      name="Jobs Posted"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="views"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="applications"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="space-y-6">
              {/* Work Mode Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-sm font-semibold mb-2">Work Mode</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getWorkModeDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {getWorkModeDistribution().map((entry, index) => (
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

              {/* Experience Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-sm font-semibold mb-2">Experience Level</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getExperienceDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {getExperienceDistribution().map((entry, index) => (
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
            </div>
          </div>

          {/* Top Performing Jobs */}
          {topJobs.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Performing Jobs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topJobs.map((job, index) => (
                  <div
                    key={job._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:shadow-md transition"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </div>
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <FaBuilding className="text-gray-500" size={16} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{job.companyName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaEye size={10} />
                          {job.viewCount || 0}
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
            <div className="flex flex-col gap-4">
              {/* Search and Filter Toggle */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, description..."
                    className="bg-transparent outline-none w-full"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <MdOutlineDateRange />
                  {showDateFilter ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              {/* Advanced Filters */}
              {showDateFilter && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Job Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>

                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Work Modes</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Experience</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2 col-span-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              )}

              {/* Active Filters and Clear Button */}
              {(searchText ||
                startDate ||
                endDate ||
                typeFilter !== "all" ||
                workModeFilter !== "all" ||
                experienceFilter !== "all" ||
                selectedCategory) && (
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
                    {typeFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Type: {typeFilter}
                      </span>
                    )}
                    {workModeFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Work: {workModeFilter}
                      </span>
                    )}
                    {experienceFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Level: {experienceFilter}
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Category: {selectedCategory}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Showing {sortedJobs.length} of {stats.total} jobs
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching your jobs..." />
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {paginatedJobs.length > 0 ? (
                  paginatedJobs.map((item) => (
                    <JobCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BsBriefcase
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No jobs found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Post your first job
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedJobs.length > 0 ? (
                  <JobsTable data={paginatedJobs} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BsBriefcase
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No jobs found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Post your first job
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
          {viewModal.show && viewModal.job && (
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="py-2 px-4  flex justify-end">
                  <button
                    onClick={() => setViewModal({ show: false, job: null })}
                    className="text-black"
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>
                {/* Company Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start gap-4">
                    {viewModal.job.companyLogo ? (
                      <img
                        src={viewModal.job.companyLogo}
                        alt={viewModal.job.companyName}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaBuilding size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2
                        className="text-2xl font-bold"
                        style={{ color: "#0067b8" }}
                      >
                        {viewModal.job.title}
                      </h2>
                      <p className="text-gray-600">
                        {viewModal.job.companyName}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <WorkModeBadge mode={viewModal.job.workMode} />
                        <JobTypeBadge type={viewModal.job.type} />
                        <ExperienceBadge
                          level={viewModal.job.experienceLevel}
                        />
                        {!viewModal.job.published && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            Unpublished
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-medium flex items-center gap-1 text-sm">
                        <TfiLocationPin size={14} />
                        {viewModal.job.location || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="font-medium capitalize text-sm">
                        {viewModal.job.category || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Salary</p>
                      {viewModal.job.salaryRange?.min ||
                      viewModal.job.salaryRange?.max ? (
                        <p className="font-medium text-sm">
                          {viewModal.job.salaryRange.currency}{" "}
                          {viewModal.job.salaryRange.min?.toLocaleString() ||
                            "0"}{" "}
                          -{" "}
                          {viewModal.job.salaryRange.max?.toLocaleString() ||
                            "∞"}
                          {viewModal.job.salaryRange.isNegotiable && " (Neg)"}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">Not specified</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Deadline</p>
                      {viewModal.job.applicationDeadline ? (
                        <p
                          className={`font-medium text-sm ${
                            moment(viewModal.job.applicationDeadline).isBefore()
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {moment(viewModal.job.applicationDeadline).format(
                            "MMM DD, YYYY",
                          )}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">No deadline</p>
                      )}
                    </div>
                  </div>

                  {/* About the Job */}
                  <div>
                    <h3 className="font-semibold mb-2">About the Job</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {viewModal.job.about}
                    </p>
                  </div>

                  {/* Requirements */}
                  {viewModal.job.requirements?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.requirements.map((req, i) => (
                          <li key={i} className="text-gray-700 text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {viewModal.job.responsibilities?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Responsibilities</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.responsibilities.map((resp, i) => (
                          <li key={i} className="text-gray-700 text-sm">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {viewModal.job.qualifications?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Qualifications</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.qualifications.map((qual, i) => (
                          <li key={i} className="text-gray-700 text-sm">
                            {qual}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {viewModal.job.benefits?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Benefits</h3>
                      <div className="flex flex-wrap gap-2">
                        {viewModal.job.benefits.map((benefit, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {viewModal.job.tags?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {viewModal.job.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply Link */}
                  {viewModal.job.applyLink && (
                    <div>
                      <h3 className="font-semibold mb-2">Application Link</h3>
                      <a
                        href={viewModal.job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                      >
                        <AiOutlineLink />
                        {viewModal.job.applyLink}
                      </a>
                    </div>
                  )}

                  {/* Posted Info */}
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <p>
                      Posted{" "}
                      {moment(viewModal.job.createdAt).format("MMMM DD, YYYY")}
                    </p>
                    {viewModal.job.updatedAt !== viewModal.job.createdAt && (
                      <p className="text-xs">
                        Last updated {moment(viewModal.job.updatedAt).fromNow()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <div className="p-6 border-t flex justify-end">
                  <button
                    onClick={() => setViewModal({ show: false, job: null })}
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
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#0067b8" }}
                  >
                    {formModal.job ? "Edit Job" : "Post a New Job"}
                  </h2>
                  <button
                    onClick={() => setFormModal({ show: false, job: null })}
                    className="p-1 hover:bg-gray-100 rounded-full"
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

                <div className="p-6">
                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Company Information
                      </h3>

                      {/* Company Logo */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Company Logo
                        </label>
                        <ImageUpload
                          onImageUpload={(url) =>
                            setFormData({ ...formData, companyLogo: url })
                          }
                          defaultImage={formData.companyLogo}
                          folder="company-logos"
                          buttonText="Upload Company Logo"
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              companyName: e.target.value,
                            })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="Enter company name"
                        />
                      </div>

                      {/* Company Website */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Company Website
                        </label>
                        <input
                          type="url"
                          value={formData.companyWebsite}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              companyWebsite: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="https://company.com"
                        />
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Job Details
                      </h3>

                      {/* Job Title */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>

                      {/* Category */}
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
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        >
                          <option value="">Select Category</option>
                          <option value="technology">Technology</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Sales</option>
                          <option value="design">Design</option>
                          <option value="finance">Finance</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="engineering">Engineering</option>
                          <option value="customer-service">
                            Customer Service
                          </option>
                          <option value="human-resources">
                            Human Resources
                          </option>
                          <option value="legal">Legal</option>
                          <option value="operations">Operations</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Job Type, Work Mode, Experience, Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Job Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                            required
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          >
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                            <option value="freelance">Freelance</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Work Mode <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.workMode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workMode: e.target.value,
                              })
                            }
                            required
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          >
                            <option value="remote">Remote</option>
                            <option value="onsite">On-site</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Experience Level{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.experienceLevel}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                experienceLevel: e.target.value,
                              })
                            }
                            required
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          >
                            <option value="entry">Entry Level</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior Level</option>
                            <option value="lead">Lead</option>
                            <option value="executive">Executive</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            required
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                            placeholder="e.g., New York, NY or Remote"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Job Description
                      </h3>

                      {/* About the Job */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          About the Job <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.about}
                          onChange={(e) =>
                            setFormData({ ...formData, about: e.target.value })
                          }
                          required
                          rows="4"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="Describe the role, company culture, etc."
                        />
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Requirements (one per line){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.requirements}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requirements: e.target.value,
                            })
                          }
                          required
                          rows="4"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none font-mono"
                          placeholder="Bachelor's degree in Computer Science&#10;5+ years of experience with React&#10;Experience with Node.js"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter each requirement on a new line
                        </p>
                      </div>

                      {/* Responsibilities */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Responsibilities (one per line){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.responsibilities}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              responsibilities: e.target.value,
                            })
                          }
                          required
                          rows="4"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none font-mono"
                          placeholder="Lead development of new features&#10;Mentor junior developers&#10;Collaborate with cross-functional teams"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter each responsibility on a new line
                        </p>
                      </div>

                      {/* Qualifications */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Qualifications (one per line){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.qualifications}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              qualifications: e.target.value,
                            })
                          }
                          required
                          rows="4"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none font-mono"
                          placeholder="Strong problem-solving skills&#10;Excellent communication abilities&#10;Team player mentality"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter each qualification on a new line
                        </p>
                      </div>

                      {/* Benefits */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Benefits (one per line)
                        </label>
                        <textarea
                          value={formData.benefits}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              benefits: e.target.value,
                            })
                          }
                          rows="3"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none font-mono"
                          placeholder="Health insurance&#10;401(k) matching&#10;Remote work stipend"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter each benefit on a new line
                        </p>
                      </div>
                    </div>

                    {/* Compensation */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Compensation
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Salary Min */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Minimum Salary
                          </label>
                          <input
                            type="number"
                            value={formData.salaryMin}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                salaryMin: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                            placeholder="50000"
                          />
                        </div>

                        {/* Salary Max */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Maximum Salary
                          </label>
                          <input
                            type="number"
                            value={formData.salaryMax}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                salaryMax: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                            placeholder="80000"
                          />
                        </div>

                        {/* Currency */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Currency
                          </label>
                          <select
                            value={formData.currency}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                currency: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="ZAR">ZAR (R)</option>
                            <option value="NGN">NGN (₦)</option>
                            <option value="KES">KES (KSh)</option>
                          </select>
                        </div>
                      </div>

                      {/* Negotiable Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isNegotiable"
                          checked={formData.isNegotiable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isNegotiable: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300 text-[#146C94] focus:ring-[#146C94]"
                        />
                        <label
                          htmlFor="isNegotiable"
                          className="text-sm text-gray-700"
                        >
                          Salary is negotiable
                        </label>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Application Details
                      </h3>

                      {/* Apply Link */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Application Link{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={formData.applyLink}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              applyLink: e.target.value,
                            })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="https://company.com/careers/job"
                        />
                      </div>

                      {/* Application Deadline */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Application Deadline
                        </label>
                        <input
                          type="date"
                          value={formData.applicationDeadline}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              applicationDeadline: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="react, node.js, remote, healthcare"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate tags with commas
                        </p>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setFormModal({ show: false, job: null })}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition disabled:opacity-50"
                      >
                        {submitting
                          ? "Saving..."
                          : formModal.job
                            ? "Update Job"
                            : "Post Job"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && deleteModal.job && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-3">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the job posting "
                  {deleteModal.job.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, job: null })}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteJob}
                    disabled={loadingAction}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {loadingAction ? "Deleting..." : "Delete"}
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

export default LeadersJobs;

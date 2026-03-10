// pages/admin/AdminJobs.jsx
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
  AiOutlineDollarCircle,
} from "react-icons/ai";
import {
  IoTrashBinOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCashOutline,
  IoBusinessOutline,
} from "react-icons/io5";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaVideo,
  FaUsers,
  FaRegCalendarAlt,
  FaBuilding,
  FaClock,
  FaLevelUpAlt,
  FaGlobe,
} from "react-icons/fa";
import {
  MdOutlineCancel,
  MdPublic,
  MdPrivateConnectivity,
  MdOnlinePrediction,
  MdLocationOn,
  MdAttachEmail,
  MdPhone,
  MdWork,
  MdTrendingUp,
  MdAttachMoney,
} from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiCalendar, BiTime, BiMap, BiWorld } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import {
  BsCalendarEvent,
  BsCalendarCheck,
  BsCalendarX,
  BsPeople,
  BsBriefcase,
  BsCashStack,
  BsGraphUp,
  BsBuilding,
} from "react-icons/bs";
import { TfiLocationPin } from "react-icons/tfi";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import ImageUpload from "../../components/common/ImageUpload";

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
const StatsCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
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

const AdminJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, job: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const recordsPerPage = 10;

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

  // Fetch all jobs (admin)
  const handleFetchJobs = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/jobs/admin/all", config);

      let jobsData = response.data.data || response.data || [];
      setJobs(jobsData);

      // Extract unique categories
      const categories = [
        ...new Set(jobsData.map((item) => item.category).filter(Boolean)),
      ];
      setAvailableCategories(categories);

      // Process company data for leaderboard
      const companyMap = {};
      jobsData.forEach((job) => {
        const companyName =
          job.companyName || job.createdBy?.organizationName || "Unknown";
        if (!companyMap[companyName]) {
          companyMap[companyName] = {
            name: companyName,
            logo: job.companyLogo,
            jobCount: 0,
            totalViews: 0,
            totalApplications: 0,
            categories: new Set(),
          };
        }
        companyMap[companyName].jobCount++;
        companyMap[companyName].totalViews += job.viewCount || 0;
        companyMap[companyName].totalApplications += job.applicationClicks || 0;
        if (job.category) companyMap[companyName].categories.add(job.category);
      });

      const companiesList = Object.values(companyMap).map((company) => ({
        ...company,
        categories: Array.from(company.categories),
        avgViewsPerJob:
          company.jobCount > 0
            ? Math.round(company.totalViews / company.jobCount)
            : 0,
      }));

      setCompanies(companiesList.sort((a, b) => b.jobCount - a.jobCount));
    } catch (err) {
      toast.error("Error fetching jobs");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchJobs();
  }, []);

  // Calculate comprehensive stats
  const stats = {
    total: jobs.length,
    published: jobs.filter((j) => j.published).length,
    unpublished: jobs.filter((j) => !j.published).length,
    featured: jobs.filter((j) => j.featured).length,
    totalViews: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0),
    totalApplications: jobs.reduce(
      (sum, j) => sum + (j.applicationClicks || 0),
      0,
    ),
    uniqueCompanies: companies.length,

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
  };

  // Get popular jobs (top 10 by views)
  const popularJobs = [...jobs]
    .filter((j) => j.published)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10);

  // Get top companies
  const topCompanies = [...companies]
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, 5);

  // Get jobs with most applications
  const mostAppliedJobs = [...jobs]
    .filter((j) => j.published)
    .sort((a, b) => (b.applicationClicks || 0) - (a.applicationClicks || 0))
    .slice(0, 5);

  // Generate trend data for last 30 days
  const getTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({
        date,
        posted: 0,
        views: 0,
        applications: 0,
      });
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

  // Get experience level distribution
  const getExperienceDistribution = () => {
    return [
      { name: "Entry", value: stats.entry },
      { name: "Mid", value: stats.mid },
      { name: "Senior", value: stats.senior },
      { name: "Lead", value: stats.lead },
      { name: "Executive", value: stats.executive },
    ].filter((item) => item.value > 0);
  };

  // Get category distribution
  const getCategoryDistribution = () => {
    const categoryCount = {};
    jobs.forEach((job) => {
      if (job.category) {
        categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
  };

  // Filter jobs
  const filteredJobs = jobs?.filter((item) => {
    // Search filter
    const matchesSearch = [
      item.title,
      item.about,
      item.companyName,
      item.location,
      ...(item.tags || []),
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    // Category filter
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    // Work mode filter
    const matchesWorkMode =
      !selectedWorkMode || item.workMode === selectedWorkMode;

    // Experience filter
    const matchesExperience =
      !selectedExperience || item.experienceLevel === selectedExperience;

    // Type filter
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    // Publish filter
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && item.published) ||
      (publishFilter === "unpublished" && !item.published) ||
      (publishFilter === "featured" && item.featured);

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange =
        matchesDateRange &&
        moment(item.createdAt).isSameOrAfter(moment(dateRange.start), "day");
    }
    if (dateRange.end) {
      matchesDateRange =
        matchesDateRange &&
        moment(item.createdAt).isSameOrBefore(moment(dateRange.end), "day");
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesWorkMode &&
      matchesExperience &&
      matchesType &&
      matchesPublish &&
      matchesDateRange
    );
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedJobs = filteredJobs.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredJobs.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    selectedCategory,
    selectedWorkMode,
    selectedExperience,
    typeFilter,
    publishFilter,
    dateRange,
  ]);

  // Toggle Publish / Unpublish
  const [loadingPublish, setLoadingPublish] = useState(false);
  const handleTogglePublish = async (job) => {
    try {
      setLoadingPublish(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/jobs/${job._id}/toggle-publish`, {}, config);
      setLoadingPublish(false);
      toast.success(
        `Job ${job.published ? "unpublished" : "published"} successfully`,
      );
      handleFetchJobs();
    } catch (error) {
      setLoadingPublish(false);
      toast.error(
        error.response?.data?.message || "Failed to update job status",
      );
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (job) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/jobs/${job._id}/toggle-featured`, {}, config);
      toast.success(
        `Job ${job.featured ? "removed from" : "added to"} featured`,
      );
      handleFetchJobs();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update featured status",
      );
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
        requirements: job.requirements?.join("\n") || "",
        responsibilities: job.responsibilities?.join("\n") || "",
        qualifications: job.qualifications?.join("\n") || "",
        benefits: job.benefits?.join("\n") || "",
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
        tags: job.tags?.join(", ") || "",
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
        companyName: "",
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
      handleFetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving job");
    } finally {
      setSubmitting(false);
    }
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
      handleFetchJobs();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting job");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSelectedWorkMode("");
    setSelectedExperience("");
    setTypeFilter("all");
    setPublishFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Jobs Table Component
  const JobsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          <th className="p-2 text-left font-semibold border-r">Company</th>
          <th className="p-2 text-left font-semibold border-r">Job Title</th>
          <th className="p-2 text-left font-semibold border-r">Category</th>
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
                <div>
                  <div className="font-medium text-xs">{item.companyName}</div>
                  {item.createdBy?.organizationName && (
                    <div className="text-xs text-gray-500">
                      by {item.createdBy.organizationName}
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td className="p-2 border-r font-medium max-w-xs">
              <div className="line-clamp-2">{item.title}</div>
              {item.featured && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded mt-1 inline-block">
                  ⭐ Featured
                </span>
              )}
            </td>
            <td className="p-2 border-r">
              <span className="text-xs capitalize">
                {item.category || "N/A"}
              </span>
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
                  <AiOutlineLink size={12} className="text-gray-500" />
                  <span>{item.applicationClicks || 0} applies</span>
                </div>
              </div>
            </td>
            <td className="p-2 border-r">
              <div className="flex flex-col gap-1">
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
                {item.applicationDeadline && (
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      moment(item.applicationDeadline).isBefore()
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    <BiCalendar size={10} />
                    Deadline:{" "}
                    {moment(item.applicationDeadline).format("MMM DD")}
                  </span>
                )}
              </div>
            </td>
            <td className="p-2">
              <div className="flex gap-2 items-center">
                <IoEyeOutline
                  size={18}
                  className="text-[#146C94] cursor-pointer hover:scale-110"
                  onClick={() => setViewModal({ show: true, job: item })}
                  title="View"
                />
                {loadingPublish ? (
                  <span className="text-xs">...</span>
                ) : (
                  <>
                    {item.published ? (
                      <MdOutlineCancel
                        size={18}
                        className="text-orange-500 cursor-pointer hover:scale-110"
                        title="Unpublish"
                        onClick={() => handleTogglePublish(item)}
                      />
                    ) : (
                      <FaCheckCircle
                        size={18}
                        className="text-green-600 cursor-pointer hover:scale-110"
                        title="Publish"
                        onClick={() => handleTogglePublish(item)}
                      />
                    )}
                  </>
                )}
                <button
                  onClick={() => handleToggleFeatured(item)}
                  className={`text-sm ${
                    item.featured ? "text-yellow-600" : "text-gray-400"
                  } hover:scale-110`}
                  title={item.featured ? "Remove Featured" : "Mark as Featured"}
                >
                  ⭐
                </button>
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
                Jobs Management
              </h2>
              <p className="text-gray-600">
                Manage all job postings, track engagement, and monitor hiring
                trends
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
              >
                <AiOutlinePlus size={18} />
                Post Job
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Jobs"
              value={stats.total}
              icon={BsBriefcase}
              color="#146C94"
              bgColor="#e6f0fa"
              subtitle={`${stats.published} active, ${stats.unpublished} draft`}
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={IoEyeOutline}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`Avg ${stats.avgViewsPerJob} per job`}
            />
            <StatsCard
              title="Applications"
              value={stats.totalApplications}
              icon={BsPeople}
              color="#856404"
              bgColor="#fff3cd"
              subtitle={`${stats.applicationRate}% conversion rate`}
            />
            <StatsCard
              title="Active Companies"
              value={stats.uniqueCompanies}
              icon={FaBuilding}
              color="#6b21a8"
              bgColor="#f3e8ff"
              subtitle={`${stats.featured} featured jobs`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Job Posting Trend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                Job Posting & Engagement Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="posted"
                      stroke="#146C94"
                      strokeWidth={2}
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
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Work Mode Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h3 className="text-sm font-semibold mb-2">Work Mode</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getWorkModeDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
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
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getExperienceDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
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

              {/* Job Type Distribution */}
              <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2">
                <h3 className="text-sm font-semibold mb-2">Job Types</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTypeDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#146C94" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Jobs & Top Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Popular Jobs */}
            <div className="bg-white p-4 rounded-xl shadow-sm border lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                🔥 Most Viewed Jobs
              </h3>
              <div className="space-y-3">
                {popularJobs.map((job, index) => (
                  <div
                    key={job._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index % COLORS.length] }}
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
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <FaBuilding className="text-gray-400" size={16} />
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
                          <IoEyeOutline size={12} />
                          {job.viewCount || 0} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <AiOutlineLink size={12} />
                          {job.applicationClicks || 0} applies
                        </span>
                      </div>
                    </div>
                    <WorkModeBadge mode={job.workMode} />
                  </div>
                ))}
                {popularJobs.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No jobs with views yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Companies */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🏢 Top Hiring Companies
              </h3>
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div
                    key={company.name}
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
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{company.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{company.jobCount} jobs</span>
                        <span>•</span>
                        <span>{company.totalViews} total views</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.categories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 px-1 py-0.5 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                        {company.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{company.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {topCompanies.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No companies yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Most Applied Jobs */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            <h3 className="text-lg font-semibold mb-4">📊 Most Applied Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {mostAppliedJobs.map((job, index) => (
                <div
                  key={job._id}
                  className="border rounded-lg p-3 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </span>
                    <h4 className="font-medium text-sm line-clamp-1">
                      {job.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {job.companyName}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1">
                      <IoEyeOutline size={12} />
                      {job.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <AiOutlineLink size={12} />
                      {job.applicationClicks || 0}
                    </span>
                    <WorkModeBadge mode={job.workMode} />
                  </div>
                </div>
              ))}
              {mostAppliedJobs.length === 0 && (
                <p className="text-center text-gray-500 py-4 col-span-5">
                  No applications yet
                </p>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col gap-4">
              {/* Search and Filter Toggle */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, description, tags..."
                    className="bg-transparent outline-none w-full"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <BsGraphUp />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
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

                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Work Modes</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Experience Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>

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
                    value={publishFilter}
                    onChange={(e) => setPublishFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Jobs</option>
                    <option value="published">Published Only</option>
                    <option value="unpublished">Unpublished Only</option>
                    <option value="featured">Featured Only</option>
                  </select>

                  <div className="flex gap-2 col-span-2">
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

              {/* Active Filters */}
              {(searchText ||
                selectedCategory ||
                selectedWorkMode ||
                selectedExperience ||
                typeFilter !== "all" ||
                publishFilter !== "all" ||
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
                    {selectedCategory && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Category: {selectedCategory}
                      </span>
                    )}
                    {selectedWorkMode && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Work: {selectedWorkMode}
                      </span>
                    )}
                    {selectedExperience && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Level: {selectedExperience}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </h3>
          </div>

          {/* Jobs Table */}
          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching jobs..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
                {paginatedJobs.length > 0 ? (
                  <JobsTable data={paginatedJobs} />
                ) : (
                  <div className="text-center py-12">
                    <BsBriefcase
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No jobs found</p>
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
          {viewModal.show && viewModal.job && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header with close button */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#0067b8" }}
                  >
                    Job Details
                  </h2>
                  <button
                    onClick={() => setViewModal({ show: false, job: null })}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>

                <div className="p-6">
                  {/* Company Header */}
                  <div className="flex items-start gap-4 mb-6">
                    {viewModal.job.companyLogo ? (
                      <img
                        src={viewModal.job.companyLogo}
                        alt={viewModal.job.companyName}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaBuilding size={40} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">
                          {viewModal.job.title}
                        </h1>
                        {viewModal.job.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {viewModal.job.companyName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <WorkModeBadge mode={viewModal.job.workMode} />
                        <JobTypeBadge type={viewModal.job.type} />
                        <ExperienceBadge
                          level={viewModal.job.experienceLevel}
                        />
                        {viewModal.job.published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Unpublished
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <TfiLocationPin size={14} />
                        {viewModal.job.location || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="font-medium capitalize">
                        {viewModal.job.category || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Salary Range</p>
                      {viewModal.job.salaryRange?.min ||
                      viewModal.job.salaryRange?.max ? (
                        <p className="font-medium">
                          {viewModal.job.salaryRange.currency || "USD"}{" "}
                          {viewModal.job.salaryRange.min?.toLocaleString() ||
                            "0"}{" "}
                          -{" "}
                          {viewModal.job.salaryRange.max?.toLocaleString() ||
                            "∞"}
                          {viewModal.job.salaryRange.isNegotiable &&
                            " (Negotiable)"}
                        </p>
                      ) : (
                        <p className="text-gray-400">Not specified</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Deadline</p>
                      {viewModal.job.applicationDeadline ? (
                        <p
                          className={`font-medium ${
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
                        <p className="text-gray-400">No deadline</p>
                      )}
                    </div>
                  </div>

                  {/* About the Job */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About the Job</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {viewModal.job.about}
                    </p>
                  </div>

                  {/* Requirements */}
                  {viewModal.job.requirements?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.requirements.map((req, i) => (
                          <li key={i} className="text-gray-700">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {viewModal.job.responsibilities?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Responsibilities</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.responsibilities.map((resp, i) => (
                          <li key={i} className="text-gray-700">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {viewModal.job.qualifications?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Qualifications</h3>
                      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-lg">
                        {viewModal.job.qualifications.map((qual, i) => (
                          <li key={i} className="text-gray-700">
                            {qual}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {viewModal.job.benefits?.length > 0 && (
                    <div className="mb-6">
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
                    <div className="mb-6">
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
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Application Link</h3>
                      <a
                        href={viewModal.job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <AiOutlineLink />
                        {viewModal.job.applyLink}
                      </a>
                    </div>
                  )}

                  {/* Analytics */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Engagement Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Views
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#146C94" }}
                        >
                          {viewModal.job.viewCount || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Applications
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#0b5e42" }}
                        >
                          {viewModal.job.applicationClicks || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          Conversion Rate
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#6b21a8" }}
                        >
                          {viewModal.job.viewCount > 0
                            ? Math.round(
                                ((viewModal.job.applicationClicks || 0) /
                                  viewModal.job.viewCount) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Posted By */}
                  <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                    <p>
                      Posted by{" "}
                      {viewModal.job.createdBy?.organizationName || "Unknown"} (
                      {viewModal.job.createdBy?.email || ""}) on{" "}
                      {moment(viewModal.job.createdAt).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Job Modal */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#0067b8" }}
                  >
                    {formModal.job ? "Edit Job" : "Create New Job"}
                  </h2>
                  <button
                    onClick={() => setFormModal({ show: false, job: null })}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Basic Information
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
                    </div>

                    {/* Job Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Job Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Job Type */}
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

                        {/* Work Mode */}
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

                        {/* Location */}
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

                        {/* Experience Level */}
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
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="ZAR">ZAR</option>
                            <option value="NGN">NGN</option>
                            <option value="KES">KES</option>
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

                    {/* Application & Tags */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">
                        Application & Tags
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
                            : "Create Job"}
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

export default AdminJobs;

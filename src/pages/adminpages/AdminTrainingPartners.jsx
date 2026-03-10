// pages/admin/AdminTrainingPartners.jsx
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
  AiOutlineCheckCircle,
  AiOutlineStar,
} from "react-icons/ai";
import {
  IoTrashBinOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUsers,
  FaRegCalendarAlt,
  FaBuilding,
  FaHashtag,
  FaRegStar,
  FaStar,
  FaRegCheckCircle,
} from "react-icons/fa";
import {
  MdOutlineCancel,
  MdPublic,
  MdPrivateConnectivity,
  MdLocationOn,
  MdAttachEmail,
  MdPhone,
  MdWork,
  MdTrendingUp,
  MdAttachMoney,
  MdVerified,
  MdOutlineVerified,
} from "react-icons/md";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { BiLink, BiCalendar, BiTime, BiMap, BiWorld } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import {
  BsCalendarEvent,
  BsCalendarCheck,
  BsCalendarX,
  BsPeople,
  BsBriefcase,
  BsGraphUp,
  BsBuilding,
  BsTrophy,
  BsEye,
  BsMouse,
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

const COLORS = [
  "#146C94",
  "#19A7CE",
  "#AFD3E2",
  "#F6F1F1",
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#FF6B6B",
  "#8B5CF6",
  "#EC4899",
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
          {value?.toLocaleString()}
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

// Status Badge Component
const StatusBadge = ({ published, verified, featured }) => (
  <div className="flex flex-wrap gap-1">
    {published ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        <FaCheckCircle size={8} />
        Published
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
        <MdPrivateConnectivity size={8} />
        Unpublished
      </span>
    )}
    {verified && (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        <MdVerified size={8} />
        Verified
      </span>
    )}
    {featured && (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        <FaStar size={8} />
        Featured
      </span>
    )}
  </div>
);

// Completion Badge
const CompletionBadge = ({ percentage }) => {
  let color = "text-red-600 bg-red-100";
  if (percentage >= 80) color = "text-green-600 bg-green-100";
  else if (percentage >= 50) color = "text-yellow-600 bg-yellow-100";
  else if (percentage >= 30) color = "text-orange-600 bg-orange-100";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {percentage}% Complete
    </span>
  );
};

const AdminTrainingPartners = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    publishedProfiles: 0,
    unpublishedProfiles: 0,
    verifiedProfiles: 0,
    featuredProfiles: 0,
    totalViews: 0,
    totalClicks: 0,
    avgCompletion: 0,
  });
  const [bySpecialty, setBySpecialty] = useState([]);
  const [byRegion, setByRegion] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, partner: null });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    partner: null,
  });
  const [formModal, setFormModal] = useState({ show: false, partner: null });
  const [formData, setFormData] = useState({
    about: "",
    impact: "",
    logo: "",
    coverImage: "",
    specialties: "",
    hashtags: "",
    headquarters: {
      city: "",
      country: "",
      address: "",
    },
    regions: [],
    founded: "",
    teamSize: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const recordsPerPage = 10;

  // Fetch all partners (admin)
  const handleFetchPartners = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/training-partners/admin/all", config);

      let partnersData = response.data.data || response.data || [];
      setPartners(partnersData);

      // Extract unique specialties and regions for filters
      const specialties = new Set();
      const regions = new Set();

      partnersData.forEach((partner) => {
        partner.specialties?.forEach((s) => specialties.add(s));
        partner.regions?.forEach((r) => regions.add(r));
      });

      setAvailableSpecialties([...specialties].sort());
      setAvailableRegions([...regions].sort());

      // Fetch stats
      fetchStats();
    } catch (err) {
      toast.error("Error fetching training partners");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get(
        "/training-partners/admin/stats",
        config,
      );

      if (response.data.success) {
        setStats(response.data.data.overview);
        setBySpecialty(response.data.data.bySpecialty || []);
        setByRegion(response.data.data.byRegion || []);
      }
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    handleFetchPartners();
  }, []);

  // Filter partners
  const filteredPartners = partners?.filter((item) => {
    // Search filter
    const matchesSearch = [
      item.organizationName,
      item.about,
      item.impact,
      ...(item.specialties || []),
      ...(item.hashtags || []),
      item.headquarters?.city,
      item.headquarters?.country,
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    // Specialty filter
    const matchesSpecialty =
      !selectedSpecialty || item.specialties?.includes(selectedSpecialty);

    // Region filter
    const matchesRegion =
      !selectedRegion || item.regions?.includes(selectedRegion);

    // Publish filter
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && item.published) ||
      (publishFilter === "unpublished" && !item.published);

    // Verification filter
    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && item.verified) ||
      (verificationFilter === "unverified" && !item.verified);

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
      matchesSpecialty &&
      matchesRegion &&
      matchesPublish &&
      matchesVerification &&
      matchesDateRange
    );
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedPartners = filteredPartners.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredPartners.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    selectedSpecialty,
    selectedRegion,
    publishFilter,
    verificationFilter,
    dateRange,
  ]);

  // Toggle Publish
  const [loadingAction, setLoadingAction] = useState(false);
  const handleTogglePublish = async (partner) => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(
        `/training-partners/${partner._id}/toggle-publish`,
        {},
        config,
      );
      toast.success(
        `Profile ${partner.published ? "unpublished" : "published"} successfully`,
      );
      handleFetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle Verified
  const handleToggleVerified = async (partner) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(
        `/training-partners/${partner._id}/toggle-verified`,
        {},
        config,
      );
      toast.success(
        `Profile ${partner.verified ? "unverified" : "verified"} successfully`,
      );
      handleFetchPartners();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update verification",
      );
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (partner) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(
        `/training-partners/${partner._id}/toggle-featured`,
        {},
        config,
      );
      toast.success(
        `Profile ${partner.featured ? "removed from" : "added to"} featured`,
      );
      handleFetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update featured");
    }
  };

  // Delete Partner
  const handleDeletePartner = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(
        `/training-partners/${deleteModal.partner._id}`,
        config,
      );
      toast.success("Profile deleted successfully");
      setDeleteModal({ show: false, partner: null });
      handleFetchPartners();
    } catch {
      toast.error("Error deleting profile");
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle form open (edit)
  const handleOpenForm = (partner = null) => {
    if (partner) {
      setFormData({
        about: partner.about || "",
        impact: partner.impact || "",
        logo: partner.logo || "",
        coverImage: partner.coverImage || "",
        specialties: partner.specialties?.join(", ") || "",
        hashtags: partner.hashtags?.join(", ") || "",
        headquarters: partner.headquarters || {
          city: "",
          country: "",
          address: "",
        },
        regions: partner.regions || [],
        founded: partner.founded || "",
        teamSize: partner.teamSize || "",
        socialLinks: partner.socialLinks || {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: "",
        },
      });
    }
    setFormModal({ show: true, partner });
  };

  // Handle form submit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

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
        regions: Array.isArray(formData.regions)
          ? formData.regions
          : formData.regions
              .split(",")
              .map((r) => r.trim())
              .filter((r) => r),
      };

      if (formModal.partner) {
        await axios.put(
          `/training-partners/${formModal.partner._id}`,
          profileData,
          config,
        );
        toast.success("Profile updated successfully");
      }

      setFormModal({ show: false, partner: null });
      handleFetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedSpecialty("");
    setSelectedRegion("");
    setPublishFilter("all");
    setVerificationFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Partners Table Component
  const PartnersTable = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="p-2 text-left font-semibold border-r">
              Organization
            </th>
            <th className="p-2 text-left font-semibold border-r">Contact</th>
            <th className="p-2 text-left font-semibold border-r">
              Specialties
            </th>
            <th className="p-2 text-left font-semibold border-r">Location</th>
            <th className="p-2 text-left font-semibold border-r">Status</th>
            <th className="p-2 text-left font-semibold border-r">Stats</th>
            <th className="p-2 text-left font-semibold border-r">Completion</th>
            <th className="p-2 text-left font-semibold border-r">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="even:bg-gray-50 hover:bg-gray-100">
              <td className="p-2 border-r">
                <div className="flex items-center gap-2">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.organizationName}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <HiOutlineBuildingOffice
                      className="text-gray-400"
                      size={20}
                    />
                  )}
                  <div>
                    <div className="font-medium text-xs">
                      {item.organizationName}
                    </div>
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <BiLink size={10} />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-2 border-r">
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    <MdAttachEmail size={10} />
                    {item.email}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MdPhone size={10} />
                    {item.phone}
                  </div>
                </div>
              </td>
              <td className="p-2 border-r">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {item.specialties?.slice(0, 2).map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                  {item.specialties?.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{item.specialties.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-2 border-r">
                <div className="text-xs">
                  {item.headquarters?.city && (
                    <div className="flex items-center gap-1">
                      <TfiLocationPin size={10} />
                      {item.headquarters.city}
                      {item.headquarters.country &&
                        `, ${item.headquarters.country}`}
                    </div>
                  )}
                  {item.regions?.length > 0 && (
                    <div className="text-gray-500 mt-1">
                      Serves: {item.regions.slice(0, 2).join(", ")}
                      {item.regions.length > 2 && "..."}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-2 border-r">
                <StatusBadge
                  published={item.published}
                  verified={item.verified}
                  featured={item.featured}
                />
              </td>
              <td className="p-2 border-r">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <BsEye size={10} className="text-gray-500" />
                    <span>{item.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BsMouse size={10} className="text-gray-500" />
                    <span>{item.websiteClicks || 0} clicks</span>
                  </div>
                </div>
              </td>
              <td className="p-2 border-r">
                <CompletionBadge percentage={item.completionPercentage || 0} />
              </td>
              <td className="p-2">
                <div className="flex gap-2 items-center">
                  <IoEyeOutline
                    size={18}
                    className="text-[#146C94] cursor-pointer hover:scale-110"
                    onClick={() => setViewModal({ show: true, partner: item })}
                    title="View"
                  />
                  <IoCreateOutline
                    size={18}
                    className="text-blue-600 cursor-pointer hover:scale-110"
                    title="Edit"
                    onClick={() => handleOpenForm(item)}
                  />
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
                  {item.verified ? (
                    <MdVerified
                      size={18}
                      className="text-blue-600 cursor-pointer hover:scale-110"
                      title="Remove Verification"
                      onClick={() => handleToggleVerified(item)}
                    />
                  ) : (
                    <MdOutlineVerified
                      size={18}
                      className="text-gray-400 cursor-pointer hover:scale-110"
                      title="Verify"
                      onClick={() => handleToggleVerified(item)}
                    />
                  )}
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`text-sm ${
                      item.featured ? "text-yellow-600" : "text-gray-400"
                    } hover:scale-110`}
                    title={
                      item.featured ? "Remove Featured" : "Mark as Featured"
                    }
                  >
                    {item.featured ? (
                      <FaStar size={16} />
                    ) : (
                      <FaRegStar size={16} />
                    )}
                  </button>
                  <IoTrashBinOutline
                    size={18}
                    className="text-red-600 cursor-pointer hover:scale-110"
                    onClick={() =>
                      setDeleteModal({ show: true, partner: item })
                    }
                    title="Delete"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 mb-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                Training Partners
              </h2>
              <p className="text-gray-600">
                Manage training partner profiles, verify authenticity, and
                monitor engagement
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Partners"
              value={stats.totalProfiles}
              icon={BsBuilding}
              color="#146C94"
              bgColor="#e6f0fa"
              subtitle={`${stats.publishedProfiles} active, ${stats.unpublishedProfiles} inactive`}
            />
            <StatsCard
              title="Verified Partners"
              value={stats.verifiedProfiles}
              icon={MdVerified}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`${stats.featuredProfiles} featured`}
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={BsEye}
              color="#856404"
              bgColor="#fff3cd"
              subtitle="Profile views"
            />
            <StatsCard
              title="Website Clicks"
              value={stats.totalClicks}
              icon={BsMouse}
              color="#6b21a8"
              bgColor="#f3e8ff"
              subtitle={`Avg completion: ${Math.round(stats.avgCompletion || 0)}%`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Specialties Distribution */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Top Specialties</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySpecialty.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="_id" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#146C94" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regions Distribution */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Partners by Region</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byRegion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {byRegion.map((entry, index) => (
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

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col gap-4">
              {/* Search and Filter Toggle */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <AiOutlineSearch className="text-lg mr-2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by organization, specialties, hashtags, location..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Specialties</option>
                    {availableSpecialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Regions</option>
                    {availableRegions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <select
                    value={publishFilter}
                    onChange={(e) => setPublishFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published Only</option>
                    <option value="unpublished">Unpublished Only</option>
                  </select>

                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
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
                selectedSpecialty ||
                selectedRegion ||
                publishFilter !== "all" ||
                verificationFilter !== "all" ||
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
                    {selectedSpecialty && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Specialty: {selectedSpecialty}
                      </span>
                    )}
                    {selectedRegion && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Region: {selectedRegion}
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
              Showing {filteredPartners.length} of {partners.length} partners
            </h3>
          </div>

          {/* Partners Table */}
          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching partners..." />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border">
                {paginatedPartners.length > 0 ? (
                  <PartnersTable data={paginatedPartners} />
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineBuildingOffice
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No training partners found</p>
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
          {viewModal.show && viewModal.partner && (
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#0067b8" }}
                  >
                    Training Partner Details
                  </h2>
                  <button
                    onClick={() => setViewModal({ show: false, partner: null })}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>

                <div className="p-6">
                  {/* Cover Image */}
                  {viewModal.partner.coverImage && (
                    <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
                      <img
                        src={viewModal.partner.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Header with Logo and Basic Info */}
                  <div className="flex items-start gap-4 mb-6">
                    {viewModal.partner.logo ? (
                      <img
                        src={viewModal.partner.logo}
                        alt={viewModal.partner.organizationName}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <HiOutlineBuildingOffice
                          size={40}
                          className="text-gray-400"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">
                          {viewModal.partner.organizationName}
                        </h1>
                        <StatusBadge
                          published={viewModal.partner.published}
                          verified={viewModal.partner.verified}
                          featured={viewModal.partner.featured}
                        />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MdAttachEmail size={14} />
                          {viewModal.partner.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MdPhone size={14} />
                          {viewModal.partner.phone}
                        </div>
                        {viewModal.partner.website && (
                          <a
                            href={viewModal.partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <BiLink size={14} />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Profile Views</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#146C94" }}
                      >
                        {viewModal.partner.viewCount || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Website Clicks</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#0b5e42" }}
                      >
                        {viewModal.partner.websiteClicks || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Completion</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: "#6b21a8" }}
                      >
                        {viewModal.partner.completionPercentage || 0}%
                      </p>
                    </div>
                  </div>

                  {/* About */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {viewModal.partner.about}
                    </p>
                  </div>

                  {/* Impact */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Impact So Far</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {viewModal.partner.impact}
                    </p>
                  </div>

                  {/* Courses */}
                  {viewModal.partner.courses?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Top Courses</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewModal.partner.courses.map((course, index) => (
                          <div
                            key={index}
                            className="flex gap-3 border rounded-lg p-3"
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
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {viewModal.partner.specialties?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewModal.partner.specialties.map((s, i) => (
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
                    {viewModal.partner.hashtags?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewModal.partner.hashtags.map((h, i) => (
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

                  {/* Location & Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {viewModal.partner.headquarters && (
                      <div>
                        <h3 className="font-semibold mb-2">Headquarters</h3>
                        <p className="text-gray-700">
                          {viewModal.partner.headquarters.address && (
                            <>
                              {viewModal.partner.headquarters.address}
                              <br />
                            </>
                          )}
                          {viewModal.partner.headquarters.city}
                          {viewModal.partner.headquarters.country &&
                            `, ${viewModal.partner.headquarters.country}`}
                        </p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="space-y-1 text-sm">
                        {viewModal.partner.founded && (
                          <p>Founded: {viewModal.partner.founded}</p>
                        )}
                        {viewModal.partner.teamSize && (
                          <p>Team Size: {viewModal.partner.teamSize}</p>
                        )}
                        {viewModal.partner.regions?.length > 0 && (
                          <p>Regions: {viewModal.partner.regions.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {Object.values(viewModal.partner.socialLinks || {}).some(
                    Boolean,
                  ) && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Social Links</h3>
                      <div className="flex gap-3">
                        {viewModal.partner.socialLinks?.linkedin && (
                          <a
                            href={viewModal.partner.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                        {viewModal.partner.socialLinks?.twitter && (
                          <a
                            href={viewModal.partner.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Twitter
                          </a>
                        )}
                        {viewModal.partner.socialLinks?.instagram && (
                          <a
                            href={viewModal.partner.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Instagram
                          </a>
                        )}
                        {viewModal.partner.socialLinks?.facebook && (
                          <a
                            href={viewModal.partner.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Facebook
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t pt-4 text-sm text-gray-500">
                    <p>
                      Created:{" "}
                      {moment(viewModal.partner.createdAt).format(
                        "MMMM DD, YYYY",
                      )}
                    </p>
                    <p>
                      Last Updated:{" "}
                      {moment(viewModal.partner.updatedAt).format(
                        "MMMM DD, YYYY",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#0067b8" }}
                  >
                    Edit Training Partner
                  </h2>
                  <button
                    onClick={() => setFormModal({ show: false, partner: null })}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    {/* Logo & Cover Image */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Logo URL
                        </label>
                        <input
                          type="text"
                          value={formData.logo}
                          onChange={(e) =>
                            setFormData({ ...formData, logo: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="https://example.com/logo.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          value={formData.coverImage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coverImage: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </div>

                    {/* About */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        About
                      </label>
                      <textarea
                        value={formData.about}
                        onChange={(e) =>
                          setFormData({ ...formData, about: e.target.value })
                        }
                        rows="4"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Tell us about your organization..."
                      />
                    </div>

                    {/* Impact */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Impact
                      </label>
                      <textarea
                        value={formData.impact}
                        onChange={(e) =>
                          setFormData({ ...formData, impact: e.target.value })
                        }
                        rows="3"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Share your impact so far..."
                      />
                    </div>

                    {/* Specialties & Hashtags */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Specialties (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.specialties}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialties: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="AI, Machine Learning, Data Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Hashtags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.hashtags}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hashtags: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="tech, education, innovation"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Headquarters</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={formData.headquarters.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headquarters: {
                                ...formData.headquarters,
                                address: e.target.value,
                              },
                            })
                          }
                          placeholder="Address"
                          className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                        <input
                          type="text"
                          value={formData.headquarters.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headquarters: {
                                ...formData.headquarters,
                                city: e.target.value,
                              },
                            })
                          }
                          placeholder="City"
                          className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                        <input
                          type="text"
                          value={formData.headquarters.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headquarters: {
                                ...formData.headquarters,
                                country: e.target.value,
                              },
                            })
                          }
                          placeholder="Country"
                          className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Regions */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Regions (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.regions}
                        onChange={(e) =>
                          setFormData({ ...formData, regions: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="africa, europe, asia"
                      />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
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
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="2020"
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
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        >
                          <option value="">Select</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="501-1000">501-1000</option>
                          <option value="1000+">1000+</option>
                        </select>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-3">
                      <h3 className="font-medium">Social Links</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="url"
                          value={formData.socialLinks.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...formData.socialLinks,
                                linkedin: e.target.value,
                              },
                            })
                          }
                          placeholder="LinkedIn URL"
                          className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                        <input
                          type="url"
                          value={formData.socialLinks.twitter}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: {
                                ...formData.socialLinks,
                                twitter: e.target.value,
                              },
                            })
                          }
                          placeholder="Twitter URL"
                          className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() =>
                          setFormModal({ show: false, partner: null })
                        }
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-[#146C94] text-white rounded-lg hover:bg-[#0d5675] transition disabled:opacity-50"
                      >
                        {submitting ? "Saving..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && deleteModal.partner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-3">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the profile for "
                  {deleteModal.partner.organizationName}"? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ show: false, partner: null })
                    }
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePartner}
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

export default AdminTrainingPartners;

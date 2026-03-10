import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch, AiOutlinePlus } from "react-icons/ai";
import {
  IoTrashBinOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import {
  FaCheckCircle,
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaRegCalendarAlt,
  FaEye,
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
} from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiReset, BiTime, BiCalendar, BiWorld } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import { TfiLocationPin } from "react-icons/tfi";
import {
  BsCalendarEvent,
  BsCalendarCheck,
  BsCalendarX,
  BsPeople,
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

// Event Status Badge Component
const EventStatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { bg: "#e6f0fa", text: "#0067b8", label: "Upcoming" },
    ongoing: { bg: "#e0f2e9", text: "#0b5e42", label: "Ongoing" },
    past: { bg: "#fee2e2", text: "#991b1b", label: "Past" },
    cancelled: { bg: "#f3f4f6", text: "#4b5563", label: "Cancelled" },
  };

  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
};

// Event Type Badge Component
const EventTypeBadge = ({ type }) => {
  const typeConfig = {
    online: { icon: FaVideo, text: "Online", bg: "#f3e8ff", color: "#6b21a8" },
    "in-person": {
      icon: FaMapMarkerAlt,
      text: "In Person",
      bg: "#dbeafe",
      color: "#1e40af",
    },
    hybrid: {
      icon: MdOnlinePrediction,
      text: "Hybrid",
      bg: "#fff3cd",
      color: "#856404",
    },
  };

  const config = typeConfig[type] || typeConfig["in-person"];
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon size={10} />
      {config.text}
    </span>
  );
};

const LeadersEvents = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, event: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, event: null });
  const [formModal, setFormModal] = useState({ show: false, event: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    eventType: "in-person",
    startDate: "",
    endDate: "",
    location: {
      venue: "",
      address: "",
      city: "",
      country: "",
    },
    meetingLink: "",
    contactEmail: "",
    contactPhone: "",
    eventLink: "",
    hashtags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);

  const recordsPerPage = 10;

  // Fetch leader's events
  const handleFetchMyEvents = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/events/my-events", config);

      // Handle different response formats
      let eventsData = [];
      if (Array.isArray(data)) {
        eventsData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        eventsData = data.data;
      } else if (data?.events && Array.isArray(data.events)) {
        eventsData = data.events;
      }

      setEvents(eventsData);

      // Extract unique hashtags for filter
      const hashtags = [
        ...new Set(eventsData.flatMap((item) => item.hashtags || [])),
      ];
      setAvailableHashtags(hashtags);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error(err.response?.data?.error || "Error fetching your events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyEvents();
    }
  }, [user]);

  // Calculate comprehensive stats
  const stats = {
    total: events.length,
    published: events.filter((e) => e.published).length,
    unpublished: events.filter((e) => !e.published).length,
    upcoming: events.filter((e) => e.eventStatus === "upcoming").length,
    ongoing: events.filter((e) => e.eventStatus === "ongoing").length,
    past: events.filter((e) => e.eventStatus === "past").length,
    online: events.filter((e) => e.eventType === "online").length,
    inPerson: events.filter((e) => e.eventType === "in-person").length,
    hybrid: events.filter((e) => e.eventType === "hybrid").length,
    totalClicks: events.reduce((sum, e) => sum + (e.clicks || 0), 0),
    avgClicksPerEvent:
      events.length > 0
        ? Math.round(
            events.reduce((sum, e) => sum + (e.clicks || 0), 0) / events.length,
          )
        : 0,
    mostClickedEvent:
      events.length > 0
        ? events.reduce(
            (max, e) => ((e.clicks || 0) > (max.clicks || 0) ? e : max),
            events[0],
          )
        : null,
  };

  // Get engagement trend data for last 30 days
  const getEngagementTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({ date, clicks: 0, events: 0 });
    }

    events.forEach((event) => {
      const eventDate = moment(event.createdAt).format("MMM DD");
      const dayData = last30Days.find((day) => day.date === eventDate);
      if (dayData) {
        dayData.events++;
        dayData.clicks += event.clicks || 0;
      }
    });

    return last30Days;
  };

  // Get event type distribution
  const getTypeDistribution = () => {
    return [
      { name: "Online", value: stats.online },
      { name: "In Person", value: stats.inPerson },
      { name: "Hybrid", value: stats.hybrid },
    ];
  };

  // Get event status distribution
  const getStatusDistribution = () => {
    return [
      { name: "Upcoming", value: stats.upcoming },
      { name: "Ongoing", value: stats.ongoing },
      { name: "Past", value: stats.past },
    ];
  };

  // Get top performing events
  const topEvents = [...events]
    .filter((e) => e.published)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  // Filter events
  const filteredEvents = events.filter((item) => {
    if (!item) return false;

    // Search filter
    const searchFields = [
      item.title,
      item.description,
      ...(Array.isArray(item.hashtags) ? item.hashtags : []),
      item.location?.city,
      item.location?.country,
    ].filter((field) => field != null);

    const matchesSearch = searchFields.some((f) =>
      f?.toString().toLowerCase().includes(searchText.toLowerCase()),
    );

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const itemDate = moment(item.startDate);
      if (startDate) {
        matchesDate =
          matchesDate && itemDate.isSameOrAfter(moment(startDate), "day");
      }
      if (endDate) {
        matchesDate =
          matchesDate && itemDate.isSameOrBefore(moment(endDate), "day");
      }
    }

    // Status filter
    const matchesStatus =
      statusFilter === "all" || item.eventStatus === statusFilter;

    // Type filter
    const matchesType = typeFilter === "all" || item.eventType === typeFilter;

    // Hashtag filter
    const matchesHashtag =
      !selectedHashtag || item.hashtags?.includes(selectedHashtag);

    return (
      matchesSearch &&
      matchesDate &&
      matchesStatus &&
      matchesType &&
      matchesHashtag
    );
  });

  // Sort by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = moment(a.startDate).valueOf();
    const dateB = moment(b.startDate).valueOf();
    return dateB - dateA;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedEvents = sortedEvents.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedEvents.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    startDate,
    endDate,
    statusFilter,
    typeFilter,
    selectedHashtag,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSelectedHashtag("");
    setShowDateFilter(false);
  };

  // Delete Event
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteEvent = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/events/${deleteModal.event._id}`, config);
      setLoadingAction(false);
      toast.success("Event deleted successfully");
      setDeleteModal({ show: false, event: null });
      handleFetchMyEvents();
    } catch (error) {
      setLoadingAction(false);
      toast.error(error.response?.data?.error || "Error deleting event");
    }
  };

  // Handle form open
  const handleOpenForm = (eventItem = null) => {
    if (eventItem) {
      setFormData({
        title: eventItem.title || "",
        description: eventItem.description || "",
        image: eventItem.image || "",
        eventType: eventItem.eventType || "in-person",
        startDate: eventItem.startDate
          ? moment(eventItem.startDate).format("YYYY-MM-DDTHH:mm")
          : "",
        endDate: eventItem.endDate
          ? moment(eventItem.endDate).format("YYYY-MM-DDTHH:mm")
          : "",
        location: eventItem.location || {
          venue: "",
          address: "",
          city: "",
          country: "",
        },
        meetingLink: eventItem.meetingLink || "",
        contactEmail: eventItem.contactEmail || "",
        contactPhone: eventItem.contactPhone || "",
        eventLink: eventItem.eventLink || "",
        hashtags: Array.isArray(eventItem.hashtags)
          ? eventItem.hashtags.join(", ")
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        image: "",
        eventType: "in-person",
        startDate: "",
        endDate: "",
        location: {
          venue: "",
          address: "",
          city: "",
          country: "",
        },
        meetingLink: "",
        contactEmail: "",
        contactPhone: "",
        eventLink: "",
        hashtags: "",
      });
    }
    setFormModal({ show: true, event: eventItem });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Process hashtags
      const eventData = {
        ...formData,
        hashtags: formData.hashtags
          ? formData.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (formModal.event) {
        await axios.put(`/events/${formModal.event._id}`, eventData, config);
        toast.success("Event updated successfully");
      } else {
        await axios.post("/events", eventData, config);
        toast.success("Event created successfully");
      }
      setFormModal({ show: false, event: null });
      handleFetchMyEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving event");
    } finally {
      setSubmitting(false);
    }
  };

  // Event Card Component for mobile
  const EventCard = ({ item }) => {
    if (!item) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title || "Event image"}
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
              {item.title || "Untitled"}
            </h3>

            {/* Status and Type */}
            <div className="flex items-center gap-2 mt-1">
              <EventStatusBadge status={item.eventStatus} />
              <EventTypeBadge type={item.eventType} />
            </div>

            {/* Date and Location */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <BiCalendar size={12} />
                {moment(item.startDate).format("MMM DD, YYYY • HH:mm")}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <TfiLocationPin size={12} />
                {item.eventType === "online"
                  ? "Online Event"
                  : item.location?.city || "Location TBA"}
              </div>
            </div>

            {/* Clicks Stats */}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <div
                className="flex items-center gap-1"
                style={{ color: "#146C94" }}
              >
                <FaEye size={12} />
                <span className="font-semibold">{item.clicks || 0}</span>
                <span className="text-gray-500 text-xs">views</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, event: item })}
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
                onClick={() => setDeleteModal({ show: true, event: item })}
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Events Table Component for desktop
  const EventsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm hidden md:table">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          <th className="p-2 text-left font-semibold border-r">Image</th>
          <th className="p-2 text-left font-semibold border-r">Title</th>
          <th className="p-2 text-left font-semibold border-r">Type</th>
          <th className="p-2 text-left font-semibold border-r">Date & Time</th>
          <th className="p-2 text-left font-semibold border-r">Location</th>
          <th className="p-2 text-left font-semibold border-r">Status</th>
          <th className="p-2 text-left font-semibold border-r">Views</th>
          <th className="p-2 text-left font-semibold border-r">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/48?text=No+Image";
                  }}
                />
              ) : (
                <HiOutlinePhotograph size={24} className="text-gray-400" />
              )}
            </td>
            <td className="p-2 border-r font-medium max-w-xs">
              <div className="line-clamp-2">{item.title || "Untitled"}</div>
            </td>
            <td className="p-2 border-r">
              <EventTypeBadge type={item.eventType} />
            </td>
            <td className="p-2 border-r">
              <div className="text-xs">
                <div>{moment(item.startDate).format("MMM DD, YYYY")}</div>
                <div className="text-gray-500">
                  {moment(item.startDate).format("HH:mm")} -{" "}
                  {moment(item.endDate).format("HH:mm")}
                </div>
              </div>
            </td>
            <td className="p-2 border-r">
              {item.eventType === "online" ? (
                <span className="flex items-center gap-1 text-xs">
                  <FaVideo /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs">
                  <TfiLocationPin /> {item.location?.city || "TBA"}
                </span>
              )}
            </td>
            <td className="p-2 border-r">
              <EventStatusBadge status={item.eventStatus} />
            </td>
            <td className="p-2 border-r">
              <span className="font-semibold" style={{ color: "#146C94" }}>
                {item.clicks || 0}
              </span>
            </td>
            <td className="p-2">
              <div className="flex gap-2 items-center">
                <IoEyeOutline
                  size={18}
                  className="text-[#146C94] cursor-pointer hover:scale-110"
                  onClick={() => setViewModal({ show: true, event: item })}
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
                  onClick={() => setDeleteModal({ show: true, event: item })}
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
      <div className="px-4 md:px-8 mb-8 mt-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">My Events</h2>
              <p className="text-gray-600">
                Create and manage your events, track engagement and views
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
            >
              <AiOutlinePlus size={18} />
              Create Event
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Events"
              value={stats.total}
              icon={BsCalendarEvent}
              color="#146C94"
              bgColor="#e6f0fa"
              subtitle={`${stats.published} published`}
            />
            <StatsCard
              title="Total Views"
              value={stats.totalClicks}
              icon={FaEye}
              color="#0b5e42"
              bgColor="#e0f2e9"
              subtitle={`Avg ${stats.avgClicksPerEvent} per event`}
            />
            <StatsCard
              title="Active Events"
              value={stats.upcoming + stats.ongoing}
              icon={FaRegCalendarAlt}
              color="#856404"
              bgColor="#fff3cd"
              subtitle={`${stats.ongoing} ongoing, ${stats.upcoming} upcoming`}
            />
            <StatsCard
              title="Past Events"
              value={stats.past}
              icon={BsCalendarX}
              color="#991b1b"
              bgColor="#fee2e2"
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
                      dataKey="events"
                      stroke="#146C94"
                      fill="#146C94"
                      fillOpacity={0.3}
                      name="Events Created"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Total Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Distribution */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Events by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getStatusDistribution().map((entry, index) => (
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

          {/* Top Performing Events */}
          {topEvents.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Performing Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topEvents.map((event, index) => (
                  <div
                    key={event._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </div>
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <EventTypeBadge type={event.eventType} />
                        <span className="flex items-center gap-1">
                          <FaEye size={10} />
                          {event.clicks || 0} views
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
                    placeholder="Search events by title, description, location..."
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="online">Online</option>
                    <option value="in-person">In Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  <select
                    value={selectedHashtag}
                    onChange={(e) => setSelectedHashtag(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">All Hashtags</option>
                    {availableHashtags.map((tag) => (
                      <option key={tag} value={tag}>
                        #{tag}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Start"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      placeholder="End"
                    />
                  </div>
                </div>
              )}

              {/* Active Filters and Clear Button */}
              {(searchText ||
                startDate ||
                endDate ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                selectedHashtag) && (
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
                    {statusFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Status: {statusFilter}
                      </span>
                    )}
                    {typeFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Type: {typeFilter}
                      </span>
                    )}
                    {selectedHashtag && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{selectedHashtag}
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
              Showing {sortedEvents.length} of {stats.total} events
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching your events..." />
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {paginatedEvents.length > 0 ? (
                  paginatedEvents.map((item) => (
                    <EventCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No events found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first event
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedEvents.length > 0 ? (
                  <EventsTable data={paginatedEvents} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No events found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first event
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
          {viewModal.show && viewModal.event && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Event Image */}
                {viewModal.event.image && (
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={viewModal.event.image}
                      alt={viewModal.event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <EventStatusBadge status={viewModal.event.eventStatus} />
                      {!viewModal.event.published && (
                        <span className="px-2 py-1 bg-gray-600 text-white rounded-full text-xs">
                          Unpublished
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Title */}
                  <h2
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#0067b8" }}
                  >
                    {viewModal.event.title}
                  </h2>

                  {/* Event Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaRegCalendarAlt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Start</p>
                        <p className="font-medium">
                          {moment(viewModal.event.startDate).format(
                            "MMM DD, YYYY • HH:mm",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BiTime className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">End</p>
                        <p className="font-medium">
                          {moment(viewModal.event.endDate).format(
                            "MMM DD, YYYY • HH:mm",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    {/* Description */}
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {viewModal.event.description}
                      </p>
                    </div>

                    {/* Location Details */}
                    {viewModal.event.eventType !== "online" && (
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {viewModal.event.location?.venue && (
                            <p className="font-medium">
                              {viewModal.event.location.venue}
                            </p>
                          )}
                          <p className="text-gray-600">
                            {viewModal.event.location?.address &&
                              `${viewModal.event.location.address}, `}
                            {viewModal.event.location?.city &&
                              `${viewModal.event.location.city}, `}
                            {viewModal.event.location?.country}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Online/Hybrid Links */}
                    {(viewModal.event.eventType === "online" ||
                      viewModal.event.eventType === "hybrid") &&
                      viewModal.event.meetingLink && (
                        <div>
                          <h3 className="font-semibold mb-2">Meeting Link</h3>
                          <a
                            href={viewModal.event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <FaVideo />
                            {viewModal.event.meetingLink}
                          </a>
                        </div>
                      )}

                    {/* Contact Info */}
                    {(viewModal.event.contactEmail ||
                      viewModal.event.contactPhone) && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Contact Information
                        </h3>
                        <div className="space-y-1">
                          {viewModal.event.contactEmail && (
                            <div className="flex items-center gap-2">
                              <MdAttachEmail className="text-gray-500" />
                              <a
                                href={`mailto:${viewModal.event.contactEmail}`}
                                className="text-blue-600 hover:underline"
                              >
                                {viewModal.event.contactEmail}
                              </a>
                            </div>
                          )}
                          {viewModal.event.contactPhone && (
                            <div className="flex items-center gap-2">
                              <MdPhone className="text-gray-500" />
                              <span>{viewModal.event.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* External Event Link */}
                    {viewModal.event.eventLink && (
                      <div>
                        <h3 className="font-semibold mb-2">Event Link</h3>
                        <a
                          href={viewModal.event.eventLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <BiLink />
                          {viewModal.event.eventLink}
                        </a>
                      </div>
                    )}

                    {/* Hashtags */}
                    {viewModal.event.hashtags?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewModal.event.hashtags.map((tag, i) => (
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

                    {/* Analytics */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">
                        Engagement Analytics
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Total Views</p>
                          <p
                            className="text-2xl font-bold"
                            style={{ color: "#146C94" }}
                          >
                            {viewModal.event.clicks || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Event Type</p>
                          <p className="font-semibold capitalize">
                            {viewModal.event.eventType}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold capitalize">
                            {viewModal.event.eventStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setViewModal({ show: false, event: null })}
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
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      {formModal.event ? "Edit Event" : "Create New Event"}
                    </h2>
                    <button
                      onClick={() => setFormModal({ show: false, event: null })}
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
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Image <span className="text-red-500">*</span>
                      </label>
                      <ImageUpload
                        onImageUpload={(url) =>
                          setFormData({ ...formData, image: url })
                        }
                        defaultImage={formData.image}
                        folder="events"
                        buttonText="Upload Event Image"
                      />
                    </div>

                    {/* Title */}
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
                        placeholder="Enter event title"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                        rows="4"
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="Describe your event..."
                      />
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eventType: e.target.value,
                          })
                        }
                        required
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                      >
                        <option value="in-person">In Person</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Start Date & Time{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          End Date & Time{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          required
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Location (for in-person/hybrid) */}
                    {(formData.eventType === "in-person" ||
                      formData.eventType === "hybrid") && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium">Location Details</h3>
                        <input
                          type="text"
                          value={formData.location.venue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location,
                                venue: e.target.value,
                              },
                            })
                          }
                          placeholder="Venue name"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                        <input
                          type="text"
                          value={formData.location.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location,
                                address: e.target.value,
                              },
                            })
                          }
                          placeholder="Street address"
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={formData.location.city}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: {
                                  ...formData.location,
                                  city: e.target.value,
                                },
                              })
                            }
                            placeholder="City"
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          />
                          <input
                            type="text"
                            value={formData.location.country}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: {
                                  ...formData.location,
                                  country: e.target.value,
                                },
                              })
                            }
                            placeholder="Country"
                            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Meeting Link (for online/hybrid) */}
                    {(formData.eventType === "online" ||
                      formData.eventType === "hybrid") && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={formData.meetingLink}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meetingLink: e.target.value,
                            })
                          }
                          required={formData.eventType !== "in-person"}
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactEmail: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPhone: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    {/* External Event Link */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        External Event Link
                      </label>
                      <input
                        type="url"
                        value={formData.eventLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eventLink: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="https://eventbrite.com/..."
                      />
                    </div>

                    {/* Hashtags */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hashtags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.hashtags}
                        onChange={(e) =>
                          setFormData({ ...formData, hashtags: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                        placeholder="technology, conference, networking"
                      />
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormModal({ show: false, event: null })
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
                        {submitting
                          ? "Saving..."
                          : formModal.event
                            ? "Update Event"
                            : "Create Event"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && deleteModal.event && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-3">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete "{deleteModal.event.title}"?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, event: null })}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEvent}
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

export default LeadersEvents;

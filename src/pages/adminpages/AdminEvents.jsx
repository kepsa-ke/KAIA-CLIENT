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
  IoLocationOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaVideo,
  FaUsers,
  FaRegCalendarAlt,
} from "react-icons/fa";
import {
  MdOutlineCancel,
  MdPublic,
  MdPrivateConnectivity,
  MdOnlinePrediction,
  MdLocationOn,
  MdAttachEmail,
  MdPhone,
} from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiCalendar, BiTime, BiMap, BiWorld } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import {
  BsCalendarEvent,
  BsCalendarCheck,
  BsCalendarX,
  BsPeople,
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

const AdminEvents = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [leaders, setLeaders] = useState([]);
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
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const recordsPerPage = 10;

  // Fetch all events (admin)
  const handleFetchEvents = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/events/admin/all", config);

      let eventsData = response.data.data || response.data || [];
      setEvents(eventsData);

      // Extract unique hashtags for filter
      const hashtags = [
        ...new Set(eventsData.flatMap((item) => item.hashtags || [])),
      ];
      setAvailableHashtags(hashtags);

      // Extract unique leaders
      const uniqueLeaders = {};
      eventsData.forEach((event) => {
        if (event.createdBy?._id && !uniqueLeaders[event.createdBy._id]) {
          uniqueLeaders[event.createdBy._id] = {
            id: event.createdBy._id,
            name: event.createdBy.organizationName || event.createdBy.email,
            email: event.createdBy.email,
            eventCount: 0,
            totalClicks: 0,
          };
        }
      });

      // Calculate leader stats
      const leadersList = Object.values(uniqueLeaders);
      eventsData.forEach((event) => {
        const leader = leadersList.find((l) => l.id === event.createdBy?._id);
        if (leader) {
          leader.eventCount++;
          leader.totalClicks += event.clicks || 0;
        }
      });

      setLeaders(leadersList);
    } catch (err) {
      toast.error("Error fetching events");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchEvents();
  }, []);

  // Calculate comprehensive stats
  const stats = {
    total: events.length,
    published: events.filter((e) => e.published).length,
    unpublished: events.filter((e) => !e.published).length,
    upcoming: events.filter((e) => e.eventStatus === "upcoming" && e.published)
      .length,
    ongoing: events.filter((e) => e.eventStatus === "ongoing" && e.published)
      .length,
    past: events.filter((e) => e.eventStatus === "past" && e.published).length,
    online: events.filter((e) => e.eventType === "online").length,
    inPerson: events.filter((e) => e.eventType === "in-person").length,
    hybrid: events.filter((e) => e.eventType === "hybrid").length,
    totalClicks: events.reduce((sum, e) => sum + (e.clicks || 0), 0),
    totalLeaders: leaders.length,
    avgClicksPerEvent:
      events.length > 0
        ? Math.round(
            events.reduce((sum, e) => sum + (e.clicks || 0), 0) / events.length,
          )
        : 0,
  };

  // Get popular events (top 5 by clicks)
  const popularEvents = [...events]
    .filter((e) => e.published)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  // Get leader ranking
  const topLeaders = [...leaders]
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 5);

  // Generate trend data for last 30 days
  const getTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({
        date,
        created: 0,
        clicks: 0,
        upcoming: 0,
        ongoing: 0,
        past: 0,
      });
    }

    events.forEach((event) => {
      const eventDate = moment(event.createdAt).format("MMM DD");
      const dayData = last30Days.find((day) => day.date === eventDate);
      if (dayData) {
        dayData.created++;
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

  // Get location distribution (top cities)
  const getLocationDistribution = () => {
    const cityCount = {};
    events
      .filter((e) => e.location?.city && e.published)
      .forEach((e) => {
        cityCount[e.location.city] = (cityCount[e.location.city] || 0) + 1;
      });

    return Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ name: city, value: count }));
  };

  // Filter events
  const filteredEvents = events?.filter((item) => {
    // Search filter
    const matchesSearch = [
      item.title,
      item.description,
      ...(item.hashtags || []),
      item.location?.city,
      item.location?.country,
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    // Hashtag filter
    const matchesHashtag =
      !selectedHashtag || item.hashtags?.includes(selectedHashtag);

    // Publish filter
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && item.published) ||
      (publishFilter === "unpublished" && !item.published);

    // Status filter
    const matchesStatus =
      statusFilter === "all" || item.eventStatus === statusFilter;

    // Type filter
    const matchesType = typeFilter === "all" || item.eventType === typeFilter;

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange =
        matchesDateRange &&
        moment(item.startDate).isSameOrAfter(moment(dateRange.start), "day");
    }
    if (dateRange.end) {
      matchesDateRange =
        matchesDateRange &&
        moment(item.endDate).isSameOrBefore(moment(dateRange.end), "day");
    }

    return (
      matchesSearch &&
      matchesHashtag &&
      matchesPublish &&
      matchesStatus &&
      matchesType &&
      matchesDateRange
    );
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedEvents = filteredEvents.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredEvents.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    selectedHashtag,
    publishFilter,
    statusFilter,
    typeFilter,
    dateRange,
  ]);

  // Toggle Publish / Unpublish
  const [loadingPublish, setLoadingPublish] = useState(false);
  const handleTogglePublish = async (eventItem) => {
    try {
      setLoadingPublish(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/events/${eventItem._id}/toggle-publish`, {}, config);
      setLoadingPublish(false);
      toast.success(
        `Event ${eventItem.published ? "unpublished" : "published"} successfully`,
      );
      handleFetchEvents();
    } catch (error) {
      setLoadingPublish(false);
      toast.error(
        error.response?.data?.message || "Failed to update event status",
      );
    }
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
      handleFetchEvents();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting event");
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
        hashtags: eventItem.hashtags?.join(", ") || "",
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
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
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
      handleFetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving event");
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setSelectedHashtag("");
    setPublishFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Events Table Component
  const EventsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          <th className="p-2 text-left font-semibold border-r">Image</th>
          <th className="p-2 text-left font-semibold border-r">Title</th>
          <th className="p-2 text-left font-semibold border-r">Type</th>
          <th className="p-2 text-left font-semibold border-r">Date</th>
          <th className="p-2 text-left font-semibold border-r">Location</th>
          <th className="p-2 text-left font-semibold border-r">Status</th>
          <th className="p-2 text-left font-semibold border-r">Clicks</th>
          <th className="p-2 text-left font-semibold border-r">Created By</th>
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
                />
              ) : (
                <HiOutlinePhotograph size={24} className="text-gray-400" />
              )}
            </td>
            <td className="p-2 border-r font-medium max-w-xs">
              <div className="line-clamp-2">{item.title}</div>
            </td>
            <td className="p-2 border-r">
              <EventTypeBadge type={item.eventType} />
            </td>
            <td className="p-2 border-r">
              <div className="text-xs">
                <div className="flex items-center gap-1">
                  <BiCalendar size={12} />
                  {moment(item.startDate).format("MMM DD")}
                </div>
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
            <td className="p-2 border-r">
              <div>
                <div className="font-medium text-xs">
                  {item.createdBy?.organizationName || "Unknown"}
                </div>
                <div className="text-xs text-gray-500">
                  {item.createdBy?.email?.split("@")[0] || ""}
                </div>
              </div>
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
      <div className="px-8 mb-8">
        <div className="mt-2">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Events Management</h2>
              <p className="text-gray-600">
                Manage all events, track engagement, and monitor performance
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] transition"
            >
              <AiOutlinePlus size={18} />
              Create Event
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Events"
              value={stats.total}
              icon={BsCalendarEvent}
              color="#146C94"
              bgColor="#e6f0fa"
              subtitle={`${stats.published} published, ${stats.unpublished} unpublished`}
            />
            <StatsCard
              title="Total Clicks"
              value={stats.totalClicks}
              icon={IoPeopleOutline}
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
              title="Event Leaders"
              value={stats.totalLeaders}
              icon={BsPeople}
              color="#6b21a8"
              bgColor="#f3e8ff"
              subtitle="Active content creators"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Event Creation Trend */}
            <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Event Creation & Engagement Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="created"
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
                      name="Total Clicks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Type Distribution */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Events by Type</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getTypeDistribution().map((entry, index) => (
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

          {/* Popular Events & Top Leaders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Popular Events */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🔥 Popular Events (Top 5 by Clicks)
              </h3>
              <div className="space-y-3">
                {popularEvents.map((event, index) => (
                  <div
                    key={event._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
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
                        <span>
                          {event.createdBy?.organizationName || "Unknown"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <IoPeopleOutline size={12} />
                          {event.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {popularEvents.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No events with clicks yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Leaders */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                🏆 Top Performing Leaders
              </h3>
              <div className="space-y-3">
                {topLeaders.map((leader, index) => (
                  <div
                    key={leader.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg"
                      style={{ color: COLORS[index] }}
                    >
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span
                        className="text-lg font-semibold"
                        style={{ color: "#146C94" }}
                      >
                        {leader.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{leader.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{leader.eventCount} events</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <IoPeopleOutline size={12} />
                          {leader.totalClicks} total clicks
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {topLeaders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No leaders with events yet
                  </p>
                )}
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
                    placeholder="Search events by title, description, location, hashtags..."
                    className="bg-transparent outline-none w-full"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <BiCalendar />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
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
                    value={publishFilter}
                    onChange={(e) => setPublishFilter(e.target.value)}
                    className="border px-3 py-2 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="all">All Events</option>
                    <option value="published">Published Only</option>
                    <option value="unpublished">Unpublished Only</option>
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

              {/* Active Filters and Clear Button */}
              {(searchText ||
                selectedHashtag ||
                publishFilter !== "all" ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
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
                    {selectedHashtag && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{selectedHashtag}
                      </span>
                    )}
                    {typeFilter !== "all" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Type: {typeFilter}
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
              Showing {filteredEvents.length} of {events.length} events
            </h3>
          </div>

          {/* Events Table */}
          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching events..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
                {paginatedEvents.length > 0 ? (
                  <EventsTable data={paginatedEvents} />
                ) : (
                  <div className="text-center py-12">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No events found</p>
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
          {viewModal.show && viewModal.event && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* close button */}
                <button
                  onClick={() => setViewModal({ show: false, event: null })}
                  className=" text-black py-3 justify-center items-center flex ml-5"
                >
                  <AiOutlineClose size={24} />
                </button>
                {/* Event Image */}
                {viewModal.event.image && (
                  <div className="relative h-72 bg-gray-100">
                    <img
                      src={viewModal.event.image}
                      alt={viewModal.event.title}
                      className="w-full h-full object-contain"
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
                          <AiOutlineLink />
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Total Clicks</p>
                          <p
                            className="text-2xl font-bold"
                            style={{ color: "#146C94" }}
                          >
                            {viewModal.event.clicks || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Created By</p>
                          <p className="font-semibold">
                            {viewModal.event.createdBy?.organizationName ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {viewModal.event.createdBy?.email || ""}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    {formModal.event ? "Edit Event" : "Create New Event"}
                  </h2>
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

export default AdminEvents;

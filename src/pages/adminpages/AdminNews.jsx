import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch, AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import {
  IoTrashBinOutline,
  IoEyeOutline,
  IoCreateOutline,
} from "react-icons/io5";
import { FaCheckCircle, FaRegEyeSlash } from "react-icons/fa";
import {
  MdOutlineCancel,
  MdPublic,
  MdPrivateConnectivity,
} from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink } from "react-icons/bi";
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
} from "recharts";
import ImageUpload from "../../components/common/ImageUpload";
import AdminLayout from "../../components/adminComponents/AdminLayout";

const COLORS = ["#146C94", "#19A7CE", "#AFD3E2", "#F6F1F1"];

const AdminNews = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, news: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, news: null });
  const [formModal, setFormModal] = useState({ show: false, news: null });
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image: "",
    externalLink: "",
    hashtags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHashtag, setSelectedHashtag] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const recordsPerPage = 10;

  // Fetch news
  const handleFetchNews = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // For admin, fetch ALL news (including unpublished)
      const response = await axios.get("/news/admin/all", config);

      // Handle different response structures
      let newsData;
      if (user?.isAdmin) {
        // Admin route returns array directly
        newsData = response.data;
      } else {
        // Public route returns { success: true, data: [...] }
        newsData = response.data.data || [];
      }

      setNews(newsData);

      // Extract unique hashtags for filter
      const hashtags = [
        ...new Set(newsData.flatMap((item) => item.hashtags || [])),
      ];
      setAvailableHashtags(hashtags);
    } catch (err) {
      toast.error("Error fetching news");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchNews();
  }, []);

  // Calculate stats
  const stats = {
    total: news.length,
    published: news.filter((n) => n.published).length,
    unpublished: news.filter((n) => !n.published).length,
    withLinks: news.filter((n) => n.externalLink).length,
    withoutLinks: news.filter((n) => !n.externalLink).length,
  };

  // Generate publication trend data
  const getPublicationTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({ date, published: 0, unpublished: 0 });
    }

    news.forEach((item) => {
      const itemDate = moment(item.publishedAt || item.createdAt).format(
        "MMM DD",
      );
      const dayData = last30Days.find((day) => day.date === itemDate);
      if (dayData) {
        if (item.published) {
          dayData.published++;
        } else {
          dayData.unpublished++;
        }
      }
    });

    return last30Days;
  };

  // Generate publication status distribution
  const getStatusDistributionData = () => {
    return [
      { name: "Published", value: stats.published },
      { name: "Unpublished", value: stats.unpublished },
    ];
  };

  // Filter news based on search, hashtag, and publish status
  const filteredNews = news?.filter((item) => {
    const matchesSearch = [
      item.title,
      item.body,
      ...(item.hashtags || []),
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    const matchesHashtag =
      !selectedHashtag || item.hashtags?.includes(selectedHashtag);
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && item.published) ||
      (publishFilter === "unpublished" && !item.published);

    return matchesSearch && matchesHashtag && matchesPublish;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedNews = filteredNews.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredNews.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedHashtag, publishFilter]);

  // Toggle Publish / Unpublish (Admin only)
  const [loadingPublish, setLoadingPublish] = useState(false);
  const handleTogglePublish = async (newsItem) => {
    try {
      setLoadingPublish(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/news/${newsItem._id}/toggle-publish`, {}, config);
      setLoadingPublish(false);
      toast.success(
        `News ${newsItem.published ? "unpublished" : "published"} successfully`,
      );
      handleFetchNews();
    } catch (error) {
      setLoadingPublish(false);
      console.log("Error details:", error);

      let errorMessage = "Failed to update news status";

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 401) {
          errorMessage = "You are not authorized to perform this action";
        }
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ECONNABORTED"
      ) {
        errorMessage = "Network error. Please check your internet connection";
      } else if (error.request) {
        errorMessage = "No response from server. Please try again";
      }

      toast.error(errorMessage);
    }
  };

  // Delete News
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteNews = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/news/${deleteModal.news._id}`, config);
      setLoadingAction(false);
      toast.success("News deleted successfully");
      setDeleteModal({ show: false, news: null });
      handleFetchNews();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting news");
    }
  };

  // Handle form open
  const handleOpenForm = (newsItem = null) => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || "",
        body: newsItem.body || "",
        image: newsItem.image || "",
        externalLink: newsItem.externalLink || "",
        hashtags: newsItem.hashtags?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        body: "",
        image: "",
        externalLink: "",
        hashtags: "",
      });
    }
    setFormModal({ show: true, news: newsItem });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Process hashtags: convert comma-separated string to array
      const newsData = {
        ...formData,
        hashtags: formData.hashtags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      if (formModal.news) {
        await axios.put(`/news/${formModal.news._id}`, newsData, config);
        toast.success("News updated successfully");
      } else {
        await axios.post("/news", newsData, config);
        toast.success("News created successfully");
      }
      setFormModal({ show: false, news: null });
      handleFetchNews();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving news");
    } finally {
      setSubmitting(false);
    }
  };

  // News Table Component
  const NewsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Image",
            "Title",
            "Hashtags",
            "Status",
            "Published Date",
            "Created By",
            "Actions",
          ].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
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
              <div className="flex flex-wrap gap-1">
                {item.hashtags?.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {item.hashtags?.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{item.hashtags.length - 2}
                  </span>
                )}
              </div>
            </td>
            <td className="p-2 border-r">
              {item.published ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <FaCheckCircle size={14} />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-600">
                  <MdPrivateConnectivity size={14} />
                  Unpublished
                </span>
              )}
            </td>
            <td className="p-2 border-r">
              {moment(item.publishedAt || item.createdAt).format(
                "MMM DD, YYYY",
              )}
            </td>
            <td className="p-2 border-r">
              {item.createdBy?.organizationName ||
                item.createdBy?.email ||
                "Unknown"}
            </td>
            <td className="p-2 flex gap-3 items-center">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer"
                onClick={() => setViewModal({ show: true, news: item })}
              />

              {/* Edit - available to creator or admin */}
              {(user?.isAdmin || item.createdBy?._id === user?.id) && (
                <IoCreateOutline
                  size={18}
                  className="text-blue-600 cursor-pointer"
                  title="Edit News"
                  onClick={() => handleOpenForm(item)}
                />
              )}

              {/* Publish/Unpublish - Admin only */}
              {user?.isAdmin && (
                <>
                  {loadingPublish ? (
                    <span className="text-sm">...</span>
                  ) : (
                    <>
                      {item.published ? (
                        <MdOutlineCancel
                          size={18}
                          className="text-orange-500 cursor-pointer"
                          title="Unpublish News"
                          onClick={() => handleTogglePublish(item)}
                        />
                      ) : (
                        <FaCheckCircle
                          size={18}
                          className="text-green-600 cursor-pointer"
                          title="Publish News"
                          onClick={() => handleTogglePublish(item)}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {/* Delete - available to creator or admin */}
              {(user?.isAdmin || item.createdBy?._id === user?.id) && (
                <IoTrashBinOutline
                  size={18}
                  className="text-red-600 cursor-pointer"
                  onClick={() => setDeleteModal({ show: true, news: item })}
                />
              )}
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
          <h2 className="text-2xl font-bold mb-1">News Management</h2>
          <p>Create, manage and publish news articles</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Articles
              </h3>
              <p className="text-2xl font-bold text-[#146C94]">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Published</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.published}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                Unpublished
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {stats.unpublished}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                With External Links
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.withLinks}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Publication Trend Chart */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">
                Publication Trend (Last 30 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getPublicationTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="published"
                      stroke="#146C94"
                      strokeWidth={2}
                      name="Published"
                    />
                    <Line
                      type="monotone"
                      dataKey="unpublished"
                      stroke="#FF8042"
                      strokeWidth={2}
                      name="Unpublished"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Publication Status Distribution */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Publication Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusDistributionData().map((entry, index) => (
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

          {/* Search Bar + Filters + Add Button */}
          <div className="mt-6 mb-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-2/3">
              {/* Search */}
              <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-full lg:w-1/2">
                <AiOutlineSearch className="text-lg mr-2" />
                <input
                  type="text"
                  placeholder="Search by title, content or hashtags..."
                  className="bg-transparent outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Hashtag Filter */}
              <select
                value={selectedHashtag}
                onChange={(e) => setSelectedHashtag(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/4"
              >
                <option value="">All Hashtags</option>
                {availableHashtags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>

              {/* Publish Status Filter */}
              <select
                value={publishFilter}
                onChange={(e) => setPublishFilter(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/4"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="unpublished">Unpublished Only</option>
              </select>
            </div>

            {/* Add News Button - Available to all logged in users */}
            <button
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] w-full lg:w-auto justify-center"
            >
              <AiOutlinePlus size={18} />
              Create News
            </button>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">
              Showing {filteredNews.length} of {news.length} articles
            </h3>
            {filteredNews.length !== news.length && (
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedHashtag("");
                  setPublishFilter("all");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching news..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <NewsTable data={paginatedNews} />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {[...Array(totalPages).keys()].map((i) => {
                    const pageNumber = i + 1;
                    const showNumber =
                      Math.abs(pageNumber - currentPage) <= 2 ||
                      pageNumber === 1 ||
                      pageNumber === totalPages;

                    return showNumber ? (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === i + 1
                            ? "bg-[#146C94] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ) : null;
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* View Modal */}
          {viewModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="py-2 px-4  flex justify-end mb-3">
                  <button
                    onClick={() => setViewModal({ show: false, ad: null })}
                    className="text-black"
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>
                <h2 className="text-lg font-semibold mb-3">
                  {viewModal.news.title}
                </h2>

                {viewModal.news.image && (
                  <img
                    src={viewModal.news.image}
                    alt={viewModal.news.title}
                    className="w-full max-h-96 object-cover rounded mb-4"
                  />
                )}

                <div className="space-y-4 text-gray-700">
                  {/* Body - preserve formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {viewModal.news.body}
                  </div>

                  {/* Hashtags */}
                  {viewModal.news.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {viewModal.news.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* External Link */}
                  {viewModal.news.externalLink && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <BiLink />
                      <a
                        href={viewModal.news.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        {viewModal.news.externalLink}
                      </a>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t pt-4 text-sm text-gray-500">
                    <p>
                      <strong>Status:</strong>{" "}
                      {viewModal.news.published ? "Published" : "Unpublished"}
                    </p>
                    <p>
                      <strong>Published Date:</strong>{" "}
                      {moment(
                        viewModal.news.publishedAt || viewModal.news.createdAt,
                      ).format("LLL")}
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {viewModal.news.createdBy?.organizationName ||
                        viewModal.news.createdBy?.email}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {moment(viewModal.news.updatedAt).format("LLL")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setViewModal({ show: false, news: null })}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Update Form Modal */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">
                  {formModal.news ? "Update News" : "Create New News"}
                </h2>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  {/* Image Upload Component */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Featured Image <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      onImageUpload={(url) => {
                        setFormData({ ...formData, image: url });
                      }}
                      defaultImage={formData.image}
                      folder="news"
                      buttonText="Upload News Image"
                      maxSize={5}
                      acceptedTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                      ]}
                    />
                    {!formData.image && (
                      <p className="text-xs text-red-500 mt-1">
                        Image is required
                      </p>
                    )}
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
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Enter news title"
                    />
                  </div>

                  {/* Body - Textarea that preserves formatting */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      News Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) =>
                        setFormData({ ...formData, body: e.target.value })
                      }
                      required
                      rows="8"
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none font-mono"
                      placeholder="Write your news content here... (Spaces and line breaks will be preserved)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Line breaks and spacing will be preserved when displayed
                    </p>
                  </div>

                  {/* External Link (Optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      External Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.externalLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          externalLink: e.target.value,
                        })
                      }
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="https://example.com/article"
                    />
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hashtags (Optional - comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.hashtags}
                      onChange={(e) =>
                        setFormData({ ...formData, hashtags: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="technology, AI, news, update"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple hashtags with commas
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setFormModal({ show: false, news: null })}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : formModal.news
                          ? "Update News"
                          : "Create News"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-3">
                  Confirm Delete News
                </h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    "{deleteModal.news?.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setDeleteModal({ show: false, news: null })}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-white ${
                      loadingAction
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={handleDeleteNews}
                    disabled={loadingAction}
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

export default AdminNews;

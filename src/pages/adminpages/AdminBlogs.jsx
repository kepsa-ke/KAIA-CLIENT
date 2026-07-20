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
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineCancel, MdPrivateConnectivity } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiCategory } from "react-icons/bi";
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

const AdminBlogs = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [blogAds, setBlogAds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, ad: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, ad: null });
  const [formModal, setFormModal] = useState({ show: false, ad: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    blogUrl: "",
    category: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    unpublished: 0,
    totalClicks: 0,
    clicksByCategory: [],
  });
  const recordsPerPage = 10;

  // Fetch blog ads
  const handleFetchBlogAds = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Fetch all blog ads for admin
      const response = await axios.get("/blog-ads/admin/all", config);
      const adsData = response.data.data || [];
      setBlogAds(adsData);

      // Extract unique categories and tags for filters
      const categories = [
        ...new Set(adsData.map((item) => item.category).filter(Boolean)),
      ];
      const tags = [...new Set(adsData.flatMap((item) => item.tags || []))];
      setAvailableCategories(categories);
      setAvailableTags(tags);

      // Fetch stats
      await fetchStats();
    } catch (err) {
      toast.error("Error fetching blog ads");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/blog-ads/stats/admin", config);
      setStats(response.data.data);
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    handleFetchBlogAds();
  }, []);

  // Generate publication trend data
  const getPublicationTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({ date, published: 0, unpublished: 0 });
    }

    blogAds.forEach((item) => {
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

  // Generate category distribution data
  const getCategoryDistributionData = () => {
    const categoryCount = {};
    blogAds.forEach((ad) => {
      if (ad.category) {
        categoryCount[ad.category] = (categoryCount[ad.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }));
  };

  // Generate clicks data
  const getClicksData = () => {
    return (
      stats.clicksByCategory?.map((item) => ({
        name: item._id,
        clicks: item.clicks,
      })) || []
    );
  };

  // Filter blog ads
  const filteredAds = blogAds?.filter((item) => {
    const matchesSearch = [
      item.title,
      item.description,
      ...(item.tags || []),
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchesTag = !selectedTag || item.tags?.includes(selectedTag);
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && item.published) ||
      (publishFilter === "unpublished" && !item.published);

    return matchesSearch && matchesCategory && matchesTag && matchesPublish;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedAds = filteredAds.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredAds.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCategory, selectedTag, publishFilter]);

  // Toggle Publish / Unpublish (Admin only)
  const [loadingPublish, setLoadingPublish] = useState(false);
  const handleTogglePublish = async (ad) => {
    try {
      setLoadingPublish(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/blog-ads/${ad._id}/toggle-publish`, {}, config);
      setLoadingPublish(false);
      toast.success(
        `Blog ad ${ad.published ? "unpublished" : "published"} successfully`,
      );
      handleFetchBlogAds();
    } catch (error) {
      setLoadingPublish(false);
      let errorMessage = "Failed to update blog ad status";
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  // Delete Blog Ad
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteAd = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/blog-ads/${deleteModal.ad._id}`, config);
      setLoadingAction(false);
      toast.success("Blog ad deleted successfully");
      setDeleteModal({ show: false, ad: null });
      handleFetchBlogAds();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting blog ad");
    }
  };

  // Handle form open
  const handleOpenForm = (ad = null) => {
    if (ad) {
      setFormData({
        title: ad.title || "",
        description: ad.description || "",
        image: ad.image || "",
        blogUrl: ad.blogUrl || "",
        category: ad.category || "",
        tags: ad.tags?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        image: "",
        blogUrl: "",
        category: "",
        tags: "",
      });
    }
    setFormModal({ show: true, ad });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      // Process tags: convert comma-separated string to array
      const adData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      if (formModal.ad) {
        await axios.put(`/blog-ads/${formModal.ad._id}`, adData, config);
        toast.success("Blog ad updated successfully");
      } else {
        await axios.post("/blog-ads", adData, config);
        toast.success("Blog ad created successfully");
      }
      setFormModal({ show: false, ad: null });
      handleFetchBlogAds();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving blog ad");
    } finally {
      setSubmitting(false);
    }
  };

  // Blog Ads Table Component
  const BlogAdsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Image",
            "Title",
            "Category",
            "Tags",
            "Clicks",
            "Status",
            "Created",
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
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {item.category}
              </span>
            </td>
            <td className="p-2 border-r">
              <div className="flex flex-wrap gap-1">
                {item.tags?.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {item.tags?.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            </td>
            <td className="p-2 border-r">
              <span className="font-semibold text-[#146C94]">
                {item.clickCount || 0}
              </span>
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
                onClick={() => setViewModal({ show: true, ad: item })}
              />

              {/* Edit - available to creator or admin */}
              {(user?.isAdmin || item.createdBy?._id === user?.id) && (
                <IoCreateOutline
                  size={18}
                  className="text-blue-600 cursor-pointer"
                  title="Edit Blog Ad"
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
                      {!item.published ? (
                        <MdOutlineCancel
                          size={18}
                          className="text-orange-500 cursor-pointer"
                          title="Unpublish Ad"
                          onClick={() => handleTogglePublish(item)}
                        />
                      ) : (
                        <FaCheckCircle
                          size={18}
                          className="text-green-600 cursor-pointer"
                          title="Publish Ad"
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
                  onClick={() => setDeleteModal({ show: true, ad: item })}
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
          <h2 className="text-2xl font-bold mb-1">Blog Ads Management</h2>
          <p>Create, manage and publish blog advertisements</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Total Ads</h3>
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
                Total Clicks
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalClicks}
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

            {/* Category Distribution Chart */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Ads by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCategoryDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#146C94" name="Number of Ads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clicks by Category Chart */}
            {getClicksData().length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow border lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">
                  Clicks by Category
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getClicksData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="clicks"
                        fill="#19A7CE"
                        name="Total Clicks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar + Filters + Add Button */}
          <div className="mt-6 mb-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-2/3">
              {/* Search */}
              <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-full lg:w-2/5">
                <AiOutlineSearch className="text-lg mr-2" />
                <input
                  type="text"
                  placeholder="Search by title, description or tags..."
                  className="bg-transparent outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/5"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Tags Filter */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/5"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>

              {/* Publish Status Filter */}
              <select
                value={publishFilter}
                onChange={(e) => setPublishFilter(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/5"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="unpublished">Unpublished Only</option>
              </select>
            </div>

            {/* Add Blog Ad Button */}
            <button
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] w-full lg:w-auto justify-center"
            >
              <AiOutlinePlus size={18} />
              Create Blog Ad
            </button>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">
              Showing {filteredAds.length} of {blogAds.length} ads
            </h3>
            {filteredAds.length !== blogAds.length && (
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedCategory("");
                  setSelectedTag("");
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
              <Spinner message="Fetching blog ads..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <BlogAdsTable data={paginatedAds} />
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
                  {viewModal.ad.title}
                </h2>

                {viewModal.ad.image && (
                  <img
                    src={viewModal.ad.image}
                    alt={viewModal.ad.title}
                    className="w-full max-h-96 object-contain rounded mb-4 bg-gray-50"
                  />
                )}

                <div className="space-y-4 text-gray-700">
                  {/* Description */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {viewModal.ad.description}
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <BiCategory className="text-gray-500" />
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {viewModal.ad.category}
                    </span>
                  </div>

                  {/* Tags */}
                  {viewModal.ad.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {viewModal.ad.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Blog URL */}
                  <div className="flex items-center gap-2 text-blue-600">
                    <BiLink />
                    <a
                      href={viewModal.ad.blogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline break-all"
                    >
                      {viewModal.ad.blogUrl}
                    </a>
                  </div>

                  {/* Click Stats */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Total Clicks:</strong>{" "}
                      <span className="text-lg font-bold text-[#146C94]">
                        {viewModal.ad.clickCount || 0}
                      </span>
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4 text-sm text-gray-500">
                    <p>
                      <strong>Status:</strong>{" "}
                      {viewModal.ad.published ? "Published" : "Unpublished"}
                    </p>
                    <p>
                      <strong>Published Date:</strong>{" "}
                      {moment(
                        viewModal.ad.publishedAt || viewModal.ad.createdAt,
                      ).format("LLL")}
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {viewModal.ad.createdBy?.organizationName ||
                        viewModal.ad.createdBy?.email}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {moment(viewModal.ad.updatedAt).format("LLL")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setViewModal({ show: false, ad: null })}
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold mb-4">
                    {formModal.ad ? "Update Blog Ad" : "Create New Blog Ad"}
                  </h2>
                  {/* close button */}
                  <button
                    className="text-black"
                    onClick={() => setFormModal({ show: false, ad: null })}
                  >
                    <AiOutlineClose className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  {/* Image Upload Component */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ad Image <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      onImageUpload={(url) => {
                        setFormData({ ...formData, image: url });
                      }}
                      defaultImage={formData.image}
                      folder="blog-ads"
                      buttonText="Upload Ad Image"
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
                      maxLength="150"
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Enter ad title"
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
                      maxLength="300"
                      rows="3"
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="Brief description of the blog (max 300 characters)"
                    />
                  </div>

                  {/* Blog URL */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Blog URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.blogUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, blogUrl: e.target.value })
                      }
                      required
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="https://example.com/blog-post"
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
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="">Select a category</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags (Optional - comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      placeholder="blog, technology, AI, tutorial"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple tags with commas
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setFormModal({ show: false, ad: null })}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formData.image}
                      className="px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : formModal.ad
                          ? "Update Blog Ad"
                          : "Create Blog Ad"}
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
                  Confirm Delete Blog Ad
                </h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    "{deleteModal.ad?.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setDeleteModal({ show: false, ad: null })}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-white ${
                      loadingAction
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={handleDeleteAd}
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

export default AdminBlogs;

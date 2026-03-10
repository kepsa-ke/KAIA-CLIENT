// pages/leaders/LeadersNews.jsx
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
import { MdPrivateConnectivity, MdOutlineDateRange } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BiLink, BiReset } from "react-icons/bi";
import moment from "moment";
import ImageUpload from "../../components/common/ImageUpload";
import AdminLayout from "../../components/adminComponents/AdminLayout";

const LeadersNews = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]); // Initialize as empty array
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

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const recordsPerPage = 10;

  // Fetch user's news
  const handleFetchMyNews = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/news/my-news", config);

      // Check if data is array, if not, check if it has a data property
      if (Array.isArray(data)) {
        setNews(data);
      } else if (data?.data && Array.isArray(data.data)) {
        // If API returns { success: true, data: [...] }
        setNews(data.data);
      } else if (data?.news && Array.isArray(data.news)) {
        // If API returns { news: [...] }
        setNews(data.news);
      } else {
        // If it's something else, set empty array
        console.error("Unexpected API response format:", data);
        setNews([]);
        toast.error("Unexpected data format from server");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      toast.error(err.response?.data?.error || "Error fetching your news");
      setNews([]); // Ensure news is an array even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyNews();
    }
  }, [user]);

  // Safely calculate stats - ensure news is array
  const stats = {
    total: Array.isArray(news) ? news.length : 0,
    published: Array.isArray(news)
      ? news.filter((n) => n?.published).length
      : 0,
    unpublished: Array.isArray(news)
      ? news.filter((n) => !n?.published).length
      : 0,
    withLinks: Array.isArray(news)
      ? news.filter((n) => n?.externalLink).length
      : 0,
  };

  // Safely filter news - check if news is array
  const filteredNews = Array.isArray(news)
    ? news.filter((item) => {
        if (!item) return false;

        // Search filter
        const searchFields = [
          item.title,
          item.body,
          ...(Array.isArray(item.hashtags) ? item.hashtags : []),
        ].filter((field) => field != null);

        const matchesSearch = searchFields.some((f) =>
          f?.toString().toLowerCase().includes(searchText.toLowerCase()),
        );

        // Date filter
        let matchesDate = true;
        if (startDate || endDate) {
          const itemDate = moment(item.publishedAt || item.createdAt);
          if (startDate) {
            matchesDate =
              matchesDate && itemDate.isSameOrAfter(moment(startDate), "day");
          }
          if (endDate) {
            matchesDate =
              matchesDate && itemDate.isSameOrBefore(moment(endDate), "day");
          }
        }

        return matchesSearch && matchesDate;
      })
    : [];

  // Sort by date (newest first)
  const sortedNews = [...filteredNews].sort((a, b) => {
    const dateA = moment(a?.publishedAt || a?.createdAt).valueOf();
    const dateB = moment(b?.publishedAt || b?.createdAt).valueOf();
    return dateB - dateA;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedNews = sortedNews.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedNews.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, startDate, endDate]);

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
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
      handleFetchMyNews();
    } catch (error) {
      setLoadingAction(false);
      toast.error(error.response?.data?.error || "Error deleting news");
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
        hashtags: Array.isArray(newsItem.hashtags)
          ? newsItem.hashtags.join(", ")
          : "",
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
          ? formData.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      if (formModal.news) {
        await axios.put(`/news/${formModal.news._id}`, newsData, config);
        toast.success("News updated successfully");
      } else {
        await axios.post("/news", newsData, config);
        toast.success("News created successfully");
      }
      setFormModal({ show: false, news: null });
      handleFetchMyNews();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving news");
    } finally {
      setSubmitting(false);
    }
  };

  // News Card Component for mobile/tablet view
  const NewsCard = ({ item }) => {
    if (!item) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title || "News image"}
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

            {/* Status Badge */}
            <div className="flex items-center gap-2 mt-1">
              {item.published ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <FaCheckCircle size={12} />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-600 text-sm">
                  <MdPrivateConnectivity size={12} />
                  Unpublished
                </span>
              )}
              <span className="text-xs text-gray-500">
                {moment(item.publishedAt || item.createdAt).format(
                  "MMM DD, YYYY",
                )}
              </span>
            </div>

            {/* Hashtags */}
            {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.hashtags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {item.hashtags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{item.hashtags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, news: item })}
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
                onClick={() => setDeleteModal({ show: true, news: item })}
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // News Table Component for desktop
  const NewsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm hidden md:table">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Image",
            "Title",
            "Hashtags",
            "Status",
            "Published Date",
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
              <div className="flex flex-wrap gap-1">
                {Array.isArray(item.hashtags) &&
                  item.hashtags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                {Array.isArray(item.hashtags) && item.hashtags.length > 2 && (
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
            <td className="p-2 flex gap-3 items-center">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, news: item })}
              />
              <IoCreateOutline
                size={18}
                className="text-blue-600 cursor-pointer hover:scale-110"
                title="Edit News"
                onClick={() => handleOpenForm(item)}
              />
              <IoTrashBinOutline
                size={18}
                className="text-red-600 cursor-pointer hover:scale-110"
                onClick={() => setDeleteModal({ show: true, news: item })}
              />
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
          <h2 className="text-2xl font-bold mb-1">My News Articles</h2>
          <p className="text-gray-600">
            Create, edit and manage your own news posts
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm md:text-lg font-semibold text-gray-700">
                Total
              </h3>
              <p className="text-xl md:text-2xl font-bold text-[#146C94]">
                {stats.total}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm md:text-lg font-semibold text-gray-700">
                Published
              </h3>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {stats.published}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm md:text-lg font-semibold text-gray-700">
                Unpublished
              </h3>
              <p className="text-xl md:text-2xl font-bold text-orange-600">
                {stats.unpublished}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm md:text-lg font-semibold text-gray-700">
                With Links
              </h3>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {stats.withLinks}
              </p>
            </div>
          </div>

          {/* Search Bar + Filters + Add Button */}
          <div className="mt-6 mb-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-2/3">
                {/* Search */}
                <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-full">
                  <AiOutlineSearch className="text-lg mr-2" />
                  <input
                    type="text"
                    placeholder="Search by title, content or hashtags..."
                    className="bg-transparent outline-none w-full"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                {/* Date Filter Toggle Button */}
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <MdOutlineDateRange />
                  {showDateFilter ? "Hide Date Filter" : "Filter by Date"}
                </button>
              </div>

              {/* Create News Button */}
              <button
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] w-full lg:w-auto justify-center"
              >
                <AiOutlinePlus size={18} />
                Create News
              </button>
            </div>

            {/* Date Filter Section */}
            {showDateFilter && (
              <div className="bg-gray-50 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <BiReset />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg md:text-xl font-semibold">
              Showing {sortedNews.length} of {stats.total} articles
            </h3>
            {(searchText || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchText("");
                  setStartDate("");
                  setEndDate("");
                  setShowDateFilter(false);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching your news..." />
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {paginatedNews.length > 0 ? (
                  paginatedNews.map((item) => (
                    <NewsCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No news articles found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first news article
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedNews.length > 0 ? (
                  <NewsTable data={paginatedNews} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No news articles found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first news article
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
          {viewModal.show && viewModal.news && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/800x400?text=Image+Not+Available";
                    }}
                  />
                )}

                <div className="space-y-4 text-gray-700">
                  {/* Body - preserve formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {viewModal.news.body}
                  </div>

                  {/* Hashtags */}
                  {Array.isArray(viewModal.news.hashtags) &&
                    viewModal.news.hashtags.length > 0 && (
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
                        className="underline hover:no-underline break-all"
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
                      <strong>Last Updated:</strong>{" "}
                      {moment(viewModal.news.updatedAt).format("LLL")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
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
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold mb-4">
                    {formModal.news ? "Update News" : "Create New News"}
                  </h2>
                  {/* close modal button */}
                  <button
                    className=" text-black"
                    onClick={() => setFormModal({ show: false, news: null })}
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

                  {/* Image URL */}
                  {/* <div>
                  <label className="block text-sm font-medium mb-1">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    required
                    className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div> */}

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
          {deleteModal.show && deleteModal.news && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
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

export default LeadersNews;

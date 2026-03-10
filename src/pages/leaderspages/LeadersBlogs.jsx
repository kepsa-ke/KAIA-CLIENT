// pages/leaders/LeadersBlogs.jsx
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
import { BiLink, BiReset, BiCategory } from "react-icons/bi";
import moment from "moment";
import ImageUpload from "../../components/common/ImageUpload";
import AdminLayout from "../../components/adminComponents/AdminLayout";

const LeadersBlogs = () => {
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

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const recordsPerPage = 10;

  // Fetch user's blog ads
  const handleFetchMyBlogs = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/blog-ads/my-ads", config);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        setBlogAds(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setBlogAds(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setBlogAds([]);
        toast.error("Unexpected data format from server");
      }
    } catch (err) {
      console.error("Error fetching blog ads:", err);
      toast.error(err.response?.data?.error || "Error fetching your blog ads");
      setBlogAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleFetchMyBlogs();
    }
  }, [user]);

  // Calculate stats
  const stats = {
    total: Array.isArray(blogAds) ? blogAds.length : 0,
    published: Array.isArray(blogAds)
      ? blogAds.filter((ad) => ad?.published).length
      : 0,
    unpublished: Array.isArray(blogAds)
      ? blogAds.filter((ad) => !ad?.published).length
      : 0,
    totalClicks: Array.isArray(blogAds)
      ? blogAds.reduce((sum, ad) => sum + (ad?.clickCount || 0), 0)
      : 0,
  };

  // Filter blog ads
  const filteredAds = Array.isArray(blogAds)
    ? blogAds.filter((item) => {
        if (!item) return false;

        // Search filter
        const searchFields = [
          item.title,
          item.description,
          item.category,
          ...(Array.isArray(item.tags) ? item.tags : []),
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
  const sortedAds = [...filteredAds].sort((a, b) => {
    const dateA = moment(a?.publishedAt || a?.createdAt).valueOf();
    const dateB = moment(b?.publishedAt || b?.createdAt).valueOf();
    return dateB - dateA;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedAds = sortedAds.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedAds.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, startDate, endDate]);

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
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
      handleFetchMyBlogs();
    } catch (error) {
      setLoadingAction(false);
      toast.error(error.response?.data?.error || "Error deleting blog ad");
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
        tags: Array.isArray(ad.tags) ? ad.tags.join(", ") : "",
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
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      if (formModal.ad) {
        await axios.put(`/blog-ads/${formModal.ad._id}`, adData, config);
        toast.success("Blog ad updated successfully");
      } else {
        await axios.post("/blog-ads", adData, config);
        toast.success("Blog ad created successfully");
      }
      setFormModal({ show: false, ad: null });
      handleFetchMyBlogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving blog ad");
    } finally {
      setSubmitting(false);
    }
  };

  // Blog Ad Card Component for mobile/tablet view
  const BlogAdCard = ({ item }) => {
    if (!item) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title || "Blog ad image"}
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

            {/* Category & Status */}
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                {item.category}
              </span>
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
            </div>

            {/* Date & Clicks */}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>
                {moment(item.publishedAt || item.createdAt).format(
                  "MMM DD, YYYY",
                )}
              </span>
              <span className="flex items-center gap-1">
                <BiLink />
                {item.clickCount || 0} clicks
              </span>
            </div>

            {/* Tags */}
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, ad: item })}
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
                onClick={() => setDeleteModal({ show: true, ad: item })}
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Blog Ad Table Component for desktop
  const BlogAdsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm hidden md:table">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Image",
            "Title",
            "Category",
            "Tags",
            "Clicks",
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
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {item.category}
              </span>
            </td>
            <td className="p-2 border-r">
              <div className="flex flex-wrap gap-1">
                {Array.isArray(item.tags) &&
                  item.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                {Array.isArray(item.tags) && item.tags.length > 2 && (
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
            <td className="p-2 flex gap-3 items-center">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer hover:scale-110"
                onClick={() => setViewModal({ show: true, ad: item })}
              />
              <IoCreateOutline
                size={18}
                className="text-blue-600 cursor-pointer hover:scale-110"
                title="Edit Blog Ad"
                onClick={() => handleOpenForm(item)}
              />
              <IoTrashBinOutline
                size={18}
                className="text-red-600 cursor-pointer hover:scale-110"
                onClick={() => setDeleteModal({ show: true, ad: item })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 mb-8">
        <div className="mt-8 mb-3">
          <h2 className="text-2xl font-bold mb-1">My Blog Advertisements</h2>
          <p className="text-gray-600">
            Create and manage your blog ads. Track how many clicks they receive.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm md:text-lg font-semibold text-gray-700">
                Total Ads
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
                Total Clicks
              </h3>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {stats.totalClicks}
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
                    placeholder="Search by title, description, category or tags..."
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

              {/* Create Blog Ad Button */}
              <button
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] w-full lg:w-auto justify-center"
              >
                <AiOutlinePlus size={18} />
                Create Blog Ad
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
              Showing {sortedAds.length} of {stats.total} ads
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
              <Spinner message="Fetching your blog ads..." />
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {paginatedAds.length > 0 ? (
                  paginatedAds.map((item) => (
                    <BlogAdCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No blog ads found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first blog ad
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                {paginatedAds.length > 0 ? (
                  <BlogAdsTable data={paginatedAds} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HiOutlinePhotograph
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-600">No blog ads found</p>
                    <button
                      onClick={() => handleOpenForm(null)}
                      className="mt-4 text-[#146C94] hover:underline"
                    >
                      Create your first blog ad
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
          {viewModal.show && viewModal.ad && (
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
                  {viewModal.ad.title}
                </h2>

                {viewModal.ad.image && (
                  <img
                    src={viewModal.ad.image}
                    alt={viewModal.ad.title}
                    className="w-full max-h-96 object-contain rounded mb-4 bg-gray-50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/800x400?text=Image+Not+Available";
                    }}
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
                  {Array.isArray(viewModal.ad.tags) &&
                    viewModal.ad.tags.length > 0 && (
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
            <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50 overflow-auto p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold mb-4">
                    {formModal.ad ? "Update Blog Ad" : "Create New Blog Ad"}
                  </h2>
                  <button
                    className="text-black"
                    onClick={() => setFormModal({ show: false, ad: null })}
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
          {deleteModal.show && deleteModal.ad && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
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

export default LeadersBlogs;

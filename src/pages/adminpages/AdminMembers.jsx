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
import { MdOutlineCancel } from "react-icons/md";
import moment from "moment";
import { GrEmptyCircle } from "react-icons/gr";
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
} from "recharts";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { allCountiesKenya } from "../../data"; // Import counties data
import ImageUpload from "../../components/common/ImageUpload"; // Import ImageUpload component

// Helper function to format membership type
const formatMembershipType = (type) => {
  if (!type) return "Not specified";

  const formatted = type
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formatted;
};

const AdminMembers = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, member: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, member: null });
  const [formModal, setFormModal] = useState({ show: false, member: null });
  const [formData, setFormData] = useState({
    firstName: "",
    surName: "",
    email: "",
    organizationName: "",
    website: "",
    phone: "",
    role: "",
    category: "",
    // New fields
    companyLogo: "",
    membershipType: "",
    companyCounty: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const recordsPerPage = 10;

  // Fetch members
  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/members", config);
      setMembers(data);
    } catch (err) {
      toast.error("Error fetching members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchMembers();
  }, []);

  // Calculate stats
  const stats = {
    total: members.length,
    approved: members.filter((m) => m.approved).length,
    notApproved: members.filter((m) => !m.approved).length,
    consumer: members.filter((m) => m.category === "consumer").length,
    trainer: members.filter((m) => m.category === "trainer").length,
    partner: members.filter((m) => m.category === "partner").length,
    // New stats
    government: members.filter((m) => m.membershipType === "government").length,
    academia: members.filter((m) => m.membershipType === "academia").length,
    developmentPartners: members.filter(
      (m) => m.membershipType === "developmentPartners",
    ).length,
    civilSociety: members.filter((m) => m.membershipType === "civilSociety")
      .length,
    innovationHubs: members.filter((m) => m.membershipType === "innovationHubs")
      .length,
  };

  // Generate registration trend data
  const getRegistrationTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("MMM DD");
      last30Days.push({ date, registrations: 0 });
    }

    members.forEach((member) => {
      const memberDate = moment(member.createdAt).format("MMM DD");
      const dayData = last30Days.find((day) => day.date === memberDate);
      if (dayData) {
        dayData.registrations++;
      }
    });

    return last30Days;
  };

  // Generate category distribution data
  const getCategoryDistributionData = () => {
    return [
      { name: "AI Consumer", count: stats.consumer },
      { name: "AI Trainer", count: stats.trainer },
      { name: "AI Partner", count: stats.partner },
      {
        name: "Not Specified",
        count: stats.total - (stats.consumer + stats.trainer + stats.partner),
      },
    ];
  };

  // Generate membership type distribution data
  const getMembershipTypeDistributionData = () => {
    return [
      { name: "Government", count: stats.government },
      { name: "Academia", count: stats.academia },
      { name: "Development Partners", count: stats.developmentPartners },
      { name: "Civil Society", count: stats.civilSociety },
      { name: "Innovation Hubs", count: stats.innovationHubs },
      {
        name: "Other",
        count:
          stats.total -
          (stats.government +
            stats.academia +
            stats.developmentPartners +
            stats.civilSociety +
            stats.innovationHubs),
      },
    ];
  };

  // Filter members based on search, category, and approval status
  const filteredMembers = members.filter((m) => {
    const matchesSearch = [
      m.firstName,
      m.surName,
      m.email,
      m.organizationName,
      m.role,
      m.category,
      m.phone,
      m.membershipType,
      m.companyCounty,
      m.companyLogo,
    ].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      !selectedCategory || m.category === selectedCategory;
    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && m.approved) ||
      (approvalFilter === "notApproved" && !m.approved);

    return matchesSearch && matchesCategory && matchesApproval;
  });

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedMembers = filteredMembers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredMembers.length / recordsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCategory, approvalFilter]);

  // Toggle Approve / Hide
  const [loadingApprove, setLoadingApprove] = useState(false);
  const handleToggleApprove = async (member) => {
    try {
      setLoadingApprove(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(
        `/members/${member._id}/toggle-approval`,
        { approved: !member.approved },
        config,
      );
      setLoadingApprove(false);
      toast.success(`Member ${member.approved ? "hidden" : "approved"}`);
      handleFetchMembers();
    } catch (error) {
      setLoadingApprove(false);
      console.log("Error details:", error);

      let errorMessage = "Failed to update member";

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 400) {
          if (error.response.data.message?.includes("email")) {
            errorMessage = "Email address is already registered";
          } else if (error.response.data.message?.includes("organization")) {
            errorMessage = "Organization name is already registered";
          } else if (error.response.data.message?.includes("Invalid email")) {
            errorMessage = "Please enter a valid email address";
          }
        } else if (error.response.status === 409) {
          errorMessage = "This member already exists";
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

  // Delete Member
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteMember = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/members/${deleteModal.member._id}`, config);
      setLoadingAction(false);
      toast.success("Member deleted");
      setDeleteModal({ show: false, member: null });
      handleFetchMembers();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting member");
    }
  };

  // Handle form open
  const handleOpenForm = (member = null) => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        surName: member.surName || "",
        email: member.email || "",
        organizationName: member.organizationName || "",
        website: member.website || "",
        phone: member.phone || "",
        role: member.role || "",
        category: member.category || "",
        // New fields
        companyLogo: member.companyLogo || "",
        membershipType: member.membershipType || "",
        companyCounty: member.companyCounty || "",
      });
    } else {
      setFormData({
        firstName: "",
        surName: "",
        email: "",
        organizationName: "",
        website: "",
        phone: "",
        role: "",
        category: "",
        companyLogo: "",
        membershipType: "",
        companyCounty: "",
      });
    }
    setFormModal({ show: true, member });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.companyLogo) {
        toast.error("Please upload a company logo");
        return;
      }

      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (formModal.member) {
        await axios.put(`/members/${formModal.member._id}`, formData, config);
        toast.success("Member updated successfully");
      } else {
        await axios.post("/members", formData, config);
        toast.success("Member created successfully");
      }
      setFormModal({ show: false, member: null });
      handleFetchMembers();
    } catch (err) {
      toast.error("Error saving member");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (imageUrl) => {
    setFormData({
      ...formData,
      companyLogo: imageUrl,
    });
  };

  // Table if admin
  const MembersTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Logo",
            "Organization",
            "Contact First Name",
            "Contact Surname",
            "Category",
            "Membership Type",
            "Contact Email",
            "Website Link",
            "Current Status",
            "Applied",
            "Actions",
          ].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((m) => (
          <tr key={m._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">
              {m.companyLogo ? (
                <img
                  src={m.companyLogo}
                  alt={m.organizationName}
                  className="w-10 h-10 object-contain rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                  No logo
                </div>
              )}
            </td>
            <td className="p-2 border-r">
              {m.organizationName.length > 30
                ? m.organizationName.slice(0, 30) + "..."
                : m.organizationName || "N/A"}
            </td>
            <td className="p-2 border-r">{m.firstName}</td>
            <td className="p-2 border-r">{m.surName}</td>
            <td className="p-2 border-r">{m.category || "Not indicated"}</td>
            <td className="p-2 border-r">
              {m.membershipType ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {formatMembershipType(m.membershipType)}
                </span>
              ) : (
                "Not specified"
              )}
            </td>
            <td className="p-2 border-r">
              <a href={`mailto:${m.email}`} className="text-blue-600 underline">
                {m.email}
              </a>
            </td>
            <td className="p-2 border-r">
              <a
                href={m.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {m.website.length > 30
                  ? m.website.slice(0, 30) + "..."
                  : m.website || "N/A"}
              </a>
            </td>

            {user?.isAdmin || user?.email === m.email ? (
              <td className="p-2 border-r">
                {m.approved ? (
                  <span className="text-green-600 font-medium">Approved</span>
                ) : (
                  <span className="text-gray-600">Hidden</span>
                )}
              </td>
            ) : (
              <td className="p-2 border-r">
                <GrEmptyCircle />
              </td>
            )}

            {user?.isAdmin || user?.email === m.email ? (
              <td className="p-2 border-r">{moment(m.createdAt).fromNow()}</td>
            ) : (
              <td className="p-2 border-r">
                <GrEmptyCircle />
              </td>
            )}

            <td className="p-2 flex gap-3 items-center">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer"
                onClick={() => setViewModal({ show: true, member: m })}
              />

              {(user?.isAdmin || user?.email === m.email) && (
                <IoCreateOutline
                  size={18}
                  className="text-blue-600 cursor-pointer"
                  title="Edit Member"
                  onClick={() => handleOpenForm(m)}
                />
              )}

              {user?.isAdmin && (
                <>
                  {loadingApprove ? (
                    <p>wait ...</p>
                  ) : (
                    <>
                      {!m.approved ? (
                        <MdOutlineCancel
                          size={18}
                          className="text-orange-500 cursor-pointer"
                          title="Approve Member"
                          onClick={() => handleToggleApprove(m)}
                        />
                      ) : (
                        <FaCheckCircle
                          size={18}
                          className="text-green-600 cursor-pointer"
                          title="Hide Member"
                          onClick={() => handleToggleApprove(m)}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {(user?.isAdmin || user?.email === m.email) && (
                <IoTrashBinOutline
                  size={18}
                  className="text-red-600 cursor-pointer"
                  onClick={() => setDeleteModal({ show: true, member: m })}
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
        <div className="mt-4">
          {user?.isAdmin && (
            <>
              <h2 className="text-2xl font-bold mb-1">Manage Members</h2>
              <p>All registered members in one dashboard</p>
            </>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Registered
              </h3>
              <p className="text-2xl font-bold text-[#146C94]">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                Not Approved
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {stats.notApproved}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">
                Approval Rate
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total > 0
                  ? Math.round((stats.approved / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Registration Trend Chart */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">
                Registration Trend (Last 30 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getRegistrationTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#146C94"
                      strokeWidth={2}
                      name="Registrations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Chart */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">
                Members by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCategoryDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#146C94" name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Membership Type Distribution Chart */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">
                Members by Membership Type
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMembershipTypeDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d5675" name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Search Bar + Filters + Add Button */}
          <div className="mt-6 mb-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-3/4">
              {/* Search */}
              <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-full lg:w-1/3">
                <AiOutlineSearch className="text-lg mr-2" />
                <input
                  type="text"
                  placeholder="Search member..."
                  className="bg-transparent outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/4"
              >
                <option value="">All Categories</option>
                <option value="consumer">AI Consumer</option>
                <option value="trainer">AI Trainer</option>
                <option value="partner">AI Partner</option>
              </select>

              {/* Approval Filter */}
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white w-full lg:w-1/4"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved Only</option>
                <option value="notApproved">Not Approved Only</option>
              </select>
            </div>

            {user?.isAdmin && (
              <button
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675] w-full lg:w-auto justify-center"
              >
                <AiOutlinePlus size={18} />
                Add Member
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">
              Showing {filteredMembers.length} of {members.length} members
            </h3>
            {filteredMembers.length !== members.length && (
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedCategory("");
                  setApprovalFilter("all");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Spinner message="Fetching members..." />
            </div>
          ) : (
            <>
              <MembersTable data={paginatedMembers} />

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

          {/* View Modal - Updated */}
          {viewModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="py-2 px-4 flex justify-end mb-3">
                  <button
                    onClick={() => setViewModal({ show: false, member: null })}
                    className="text-black"
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>
                <h2 className="text-lg font-semibold mb-3">Member Details</h2>
                <div className="space-y-2 text-gray-700">
                  {/* Company Logo */}
                  {viewModal.member.companyLogo && (
                    <div className="mb-4">
                      <p className="font-semibold">Company Logo:</p>
                      <img
                        src={viewModal.member.companyLogo}
                        alt="Company Logo"
                        className="w-32 h-32 object-contain border rounded-lg mt-1"
                      />
                    </div>
                  )}
                  <p>
                    <strong>Organization Name:</strong>{" "}
                    {viewModal.member.organizationName}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {viewModal.member.category || "Not indicated"}
                  </p>
                  <p>
                    <strong>Membership Type:</strong>{" "}
                    {formatMembershipType(viewModal.member.membershipType)}
                  </p>
                  <p>
                    <strong>Company County:</strong>{" "}
                    {viewModal.member.companyCounty || "Not specified"}
                  </p>
                  <p>
                    <strong>Contact Person Name:</strong>{" "}
                    {viewModal.member.firstName} {viewModal.member.surName}
                  </p>
                  <p>
                    <strong>Contact Person Role:</strong>{" "}
                    {viewModal.member.role}
                  </p>
                  <p>
                    <strong>Contact Person Email:</strong>{" "}
                    {viewModal.member.email}
                  </p>
                  {user?.isAdmin && (
                    <p>
                      <strong>Contact Person Phone:</strong>{" "}
                      {viewModal.member.phone}
                    </p>
                  )}
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href={viewModal.member.website}
                      className="text-blue-600 underline"
                    >
                      {viewModal.member.website}
                    </a>
                  </p>
                  {user?.isAdmin && (
                    <p>
                      <strong>Approval Status:</strong>{" "}
                      {viewModal.member.approved
                        ? "Approved"
                        : "Hidden (Not Approved)"}
                    </p>
                  )}
                  <p>
                    <strong>Joined:</strong>{" "}
                    {moment(viewModal.member.createdAt).format("LLL")}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setViewModal({ show: false, member: null })}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Update Form Modal - Updated with ImageUpload */}
          {formModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">
                  {formModal.member ? "Update Member" : "Add New Member"}
                </h2>
                <form onSubmit={handleSubmitForm} className="space-y-3">
                  {/* Company Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company Logo <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      onImageUpload={handleLogoUpload}
                      defaultImage={formData.companyLogo || ""}
                      folder="member-logos"
                      buttonText="Upload Company Logo"
                      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                      maxSize={5}
                      id="admin-company-logo-upload"
                    />
                    {formData.companyLogo && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Logo uploaded successfully
                      </p>
                    )}
                  </div>

                  {[
                    {
                      name: "organizationName",
                      label: "Organization Name",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "website",
                      label: "Website Link or LinkedIn",
                      type: "url",
                      required: true,
                    },
                    {
                      name: "firstName",
                      label: "First Name of the contact person",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "surName",
                      label: "Surname of the contact person",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "role",
                      label: "Role of the contact person",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "email",
                      label: "Email of the contact person",
                      type: "email",
                      required: true,
                    },
                    {
                      name: "phone",
                      label: "Phone of the contact person",
                      type: "tel",
                      required: true,
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-1">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [e.target.name]: e.target.value,
                          })
                        }
                        required={field.required || false}
                        placeholder={field.placeholder || ""}
                        className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                      />
                    </div>
                  ))}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Membership Category{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      required
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="">Select a category</option>
                      <option value="consumer">AI Consumer</option>
                      <option value="trainer">AI Trainer</option>
                      <option value="partner">AI Partner</option>
                    </select>
                  </div>

                  {/* Membership Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Membership Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="membershipType"
                      value={formData.membershipType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          membershipType: e.target.value,
                        })
                      }
                      required
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="">Select Membership Type</option>
                      <option value="government">Government</option>
                      <option value="academia">
                        Academia/Training institutions
                      </option>
                      <option value="developmentPartners">
                        Development partners
                      </option>
                      <option value="civilSociety">Civil society</option>
                      <option value="innovationHubs">Innovation hubs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Company County */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company County <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="companyCounty"
                      value={formData.companyCounty || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyCounty: e.target.value,
                        })
                      }
                      required
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="">Select County</option>
                      {allCountiesKenya.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormModal({ show: false, member: null })
                      }
                      className="px-4 py-2 bg-gray-300 rounded-md"
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
                        : formModal.member
                          ? "Update Member"
                          : "Create Member"}
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
                  Confirm Delete Member
                </h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {deleteModal.member?.organizationName}
                  </span>
                  ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() =>
                      setDeleteModal({ show: false, member: null })
                    }
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-white ${
                      loadingAction
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600"
                    }`}
                    onClick={handleDeleteMember}
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

export default AdminMembers;

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
} from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import moment from "moment";
import { GrEmptyCircle } from "react-icons/gr";

const AdminMembers = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, member: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, member: null });
  const [formModal, setFormModal] = useState({ show: false, member: null }); // create + update
  const [formData, setFormData] = useState({
    firstName: "",
    surName: "",
    email: "",
    organizationName: "",
    website: "",
    phone: "",
    role: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Filter + Pagination
  const filteredMembers = members.filter((m) =>
    [m.firstName, m.surName, m.email, m.organizationName, m.role].some((f) =>
      f?.toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedMembers = filteredMembers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredMembers.length / recordsPerPage);

  // Toggle Approve / Hide
  const handleToggleApprove = async (member) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(
        `/members/${member._id}/toggle-approval`,
        { approved: !member.approved },
        config
      );
      toast.success(`Member ${member.approved ? "hidden" : "approved"}`);
      handleFetchMembers();
    } catch {
      toast.error("Error updating member");
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
      });
    }
    setFormModal({ show: true, member });
  };

  // Handle Create / Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
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
    } finally {
      setSubmitting(false);
    }
  };

  // Table if admin
  const MembersTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Organization",
            "Contact First Name",
            "Contact Surname",
            "Contact Email",
            "Website Link",
            "Approved",
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
            <td className="p-2 border-r">{m.organizationName}</td>
            <td className="p-2 border-r">{m.firstName}</td>
            <td className="p-2 border-r">{m.surName}</td>
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
                {m.website}
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
    <div className="px-8 mb-8">
      <AdminNavbar />
      <div className="mt-32">
        {user?.isAdmin && (
          <>
            <h2 className="text-2xl font-bold mb-1">Manage Members</h2>
            <p>All registered members in one dashboard</p>
          </>
        )}

        {/* Search Bar + Add Button */}
        <div className="mt-6 mb-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-1/3">
            <AiOutlineSearch className="text-lg mr-2" />
            <input
              type="text"
              placeholder="Search member..."
              className="bg-transparent outline-none w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {user?.isAdmin && (
            <button
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-[#146C94] text-white rounded-md hover:bg-[#0d5675]"
            >
              <AiOutlinePlus size={18} />
              Add Member
            </button>
          )}
        </div>

        {user?.isAdmin && (
          <h3 className="text-xl mb-3 font-semibold">
            Total: {members.length} members
          </h3>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Spinner message="Fetching members..." />
          </div>
        ) : (
          <>
            <MembersTable data={paginatedMembers} />

            {/* Pagination */}
            <div className="flex justify-end items-center mt-4 gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Prev
              </button>

              {/* Previous range button */}
              {currentPage > 20 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 20)}
                  className="px-3 py-1 border rounded-md bg-zinc-100 text-blue-600 underline text-sm"
                >
                  Previous Range
                </button>
              )}

              {[...Array(totalPages).keys()].map((i) => {
                // Only show page numbers within current range (±10 pages)
                const pageNumber = i + 1;
                const showNumber =
                  Math.abs(pageNumber - currentPage) <= 10 ||
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

              {/* Next range button */}
              {currentPage + 10 < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 20)}
                  className="px-3 py-1 border rounded-md bg-zinc-100 text-blue-600 underline text-sm"
                >
                  Next Range
                </button>
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* View Modal */}
        {viewModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
              <h2 className="text-lg font-semibold mb-3">Member Details</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Organization Name:</strong>{" "}
                  {viewModal.member.organizationName}
                </p>

                <p>
                  <strong>Contact Person Name:</strong>{" "}
                  {viewModal.member.firstName} {viewModal.member.surName}
                </p>

                <p>
                  <strong>Contact Person Role:</strong> {viewModal.member.role}
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

        {/* Create/Update Form Modal */}
        {formModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
              <h2 className="text-lg font-semibold mb-4">
                {formModal.member ? "Update Member" : "Add New Member"}
              </h2>
              <form onSubmit={handleSubmitForm} className="space-y-3">
                {[
                  {
                    name: "firstName",
                    label: "First Name of the contact person",
                  },
                  { name: "surName", label: "Surname of the contact person" },
                  { name: "role", label: "Role of the contact person" },
                  { name: "email", label: "Email of the contact person" },
                  { name: "phone", label: "Phone of the contact person" },
                  { name: "organizationName", label: "Organization Name" },
                  { name: "website", label: "Website Link or LinkedIn" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required={[
                        "firstName",
                        "email",
                        "organizationName",
                      ].includes(field.name)}
                      className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 outline-none"
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setFormModal({ show: false, member: null })}
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
                  onClick={() => setDeleteModal({ show: false, member: null })}
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
  );
};

export default AdminMembers;

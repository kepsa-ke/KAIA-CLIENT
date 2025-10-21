import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoTrashBinOutline, IoEyeOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const AdminRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModal, setViewModal] = useState({ show: false, req: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, req: null });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please sign in");
      return;
    }
  }, [user, navigate]);

  // Fetch requests
  const handleFetchRequests = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/requests", config);
      setRequests(data);
    } catch (err) {
      toast.error("Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRequests();
  }, []);

  // Filter + Pagination
  const filteredRequests = requests.filter((r) =>
    [r.firstName, r.surName, r.email, r.organizationName].some((f) =>
      f?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedRequests = filteredRequests.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredRequests.length / recordsPerPage);

  // Toggle Request Status (Handled / Not Handled)
  const handleToggleStatus = async (req) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(
        `/requests/${req._id}/toggle-status`,
        { reqStatus: !req.reqStatus },
        config
      );
      toast.success(
        `Request marked as ${req.reqStatus ? "Not Handled" : "Handled"}`
      );
      handleFetchRequests();
    } catch {
      toast.error("Error updating request status");
    }
  };

  // Delete Request
  const [loadingAction, setLoadingAction] = useState(false);
  const handleDeleteRequest = async () => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/requests/${deleteModal.req._id}`, config);
      setLoadingAction(false);
      toast.success("Request deleted");
      setDeleteModal({ show: false, req: null });
      handleFetchRequests();
    } catch {
      setLoadingAction(false);
      toast.error("Error deleting request");
    }
  };

  // Table
  const RequestsTable = ({ data }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Organization",
            "Contact Name",
            "Email",
            "Phone",
            "Status",
            "Date Sent",
            "Actions",
          ].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r) => (
          <tr key={r._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">{r.organizationName}</td>
            <td className="p-2 border-r">
              {r.firstName} {r.surName}
            </td>
            <td className="p-2 border-r">
              <a href={`mailto:${r.email}`} className="text-blue-600 underline">
                {r.email}
              </a>
            </td>
            <td className="p-2 border-r">
              <a href={`tel:${r.phone}`} className="text-blue-600 underline">
                {r.phone}
              </a>
            </td>
            <td className="p-2 border-r">
              {r.reqStatus ? (
                <span className="text-green-600 font-medium">Handled</span>
              ) : (
                <span className="text-gray-600">Not Handled</span>
              )}
            </td>
            <td className="p-2 border-r">{moment(r.createdAt).fromNow()}</td>
            <td className="p-2 flex gap-3 items-center">
              <IoEyeOutline
                size={18}
                className="text-[#146C94] cursor-pointer"
                onClick={() => setViewModal({ show: true, req: r })}
              />
              {!r.reqStatus ? (
                <MdOutlineCancel
                  size={18}
                  className="text-orange-500 cursor-pointer"
                  title="Mark as Handled"
                  onClick={() => handleToggleStatus(r)}
                />
              ) : (
                <FaCheckCircle
                  size={18}
                  className="text-green-600 cursor-pointer"
                  title="Mark as Not Handled"
                  onClick={() => handleToggleStatus(r)}
                />
              )}
              <IoTrashBinOutline
                size={18}
                className="text-red-600 cursor-pointer"
                onClick={() => setDeleteModal({ show: true, req: r })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="px-8">
      <AdminNavbar />
      <div className="mt-32">
        <h2 className="text-2xl font-bold mb-1">Incoming Requests</h2>
        <p>Manage all messages and contact requests from organizations</p>

        {/* Search Bar */}
        <div className="mt-6 mb-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-1/3">
            <AiOutlineSearch className="text-lg mr-2" />
            <input
              type="text"
              placeholder="Search requests..."
              className="bg-transparent outline-none w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <h3 className="text-xl mb-3 font-semibold">
          Total: {requests.length} requests
        </h3>

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Spinner message="Fetching requests..." />
          </div>
        ) : (
          <>
            <RequestsTable data={paginatedRequests} />

            {/* Pagination */}
            <div className="flex justify-end items-center mt-4 gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Prev
              </button>
              {[...Array(totalPages).keys()].map((i) => (
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
              ))}
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
              <h2 className="text-lg font-semibold mb-3">Request Details</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Name:</strong> {viewModal.req.firstName}{" "}
                  {viewModal.req.surName}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${viewModal.req.email}`}
                    className="text-blue-600 underline"
                  >
                    {viewModal.req.email}
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${viewModal.req.phone}`}
                    className="text-blue-600 underline"
                  >
                    {viewModal.req.phone}
                  </a>
                </p>
                <p>
                  <strong>Organization:</strong>{" "}
                  {viewModal.req.organizationName}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {viewModal.req.reqStatus ? "Handled" : "Not Handled"}
                </p>
                <p>
                  <strong>Message:</strong> {viewModal.req.message}
                </p>
                <p>
                  <strong>Received:</strong>{" "}
                  {moment(viewModal.req.createdAt).format("LLL")}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setViewModal({ show: false, req: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete Request
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the request from{" "}
                <span className="font-semibold">
                  {deleteModal.req?.firstName} {deleteModal.req?.surName}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setDeleteModal({ show: false, req: null })}
                >
                  Cancel
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    loadingAction
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600"
                  }`}
                  onClick={handleDeleteRequest}
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

export default AdminRequests;

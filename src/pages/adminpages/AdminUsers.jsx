import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoTrashBinOutline } from "react-icons/io5";
import { IoPencil } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
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

  // Fetch users
  const handleFetchUsers = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/users", config);
      setAllUsers(data);
    } catch (err) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchUsers();
  }, []);

  // Filter + Pagination
  const filteredUsers = allUsers.filter((u) =>
    [u.username, u.email, u.phone, u.organizationName].some((f) =>
      f?.toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedUsers = filteredUsers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  // ---------- User Form ----------
  const UserForm = ({ onSubmit, onCancel, userData = {} }) => {
    const [form, setForm] = useState({
      username: userData.username || "",
      email: userData.email || "",
      phone: userData.phone || "",
      organizationName: userData.organizationName || "",
      password: "",
    });

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(form);
    };

    return (
      <form
        className="bg-gray-50 border border-gray-300 p-4 rounded-md mb-4 space-y-3"
        onSubmit={handleSubmit}
      >
        {["username", "email", "phone", "organizationName", "password"].map(
          (field) => (
            <div key={field}>
              <label className="block font-semibold capitalize mb-1">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
                required={field !== "password" || !isUpdating}
              />
            </div>
          )
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#146C94] text-white py-2 px-4 rounded-md"
          >
            {isUpdating ? "Update" : "Create"} User
          </button>
          <button
            type="button"
            className="bg-red-600 text-white py-2 px-4 rounded-md"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const ToggleAdminRights = async (id) => {
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };
    let response = await axios.patch(`/users/${id}/toggle-admin`, config);
    handleFetchUsers();
    setLoading(false);
    if (response) return toast.success("User updated");
  };

  // ---------- Users Table ----------
  const UsersTable = ({ users }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Username",
            "Email",
            "Phone",
            "Organization",
            "Admin Status",
            "Joined",
            "Actions",
          ].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">{u.username}</td>
            <td className="p-2 border-r">{u.email}</td>
            <td className="p-2 border-r">{u.phone}</td>
            <td className="p-2 border-r">{u.organizationName}</td>
            <td className="p-2 border-r flex gap-3 items-center">
              {u.isAdmin ? "Admin" : "Not Admin"}
              <button
                onClick={() => ToggleAdminRights(u._id)}
                className={
                  u.isAdmin
                    ? "bg-red-500 text-white p-2 rounded-md"
                    : "bg-teal-700 text-white p-2 rounded-md"
                }
              >
                {u.isAdmin ? "Revoke" : "Make"}
              </button>
            </td>
            <td className="p-2 border-r">{moment(u.createdAt).fromNow()}</td>
            <td className="p-2 flex gap-5 items-center">
              <IoPencil
                size={18}
                className="text-[#146C94] cursor-pointer"
                onClick={() => {
                  setIsUpdating(true);
                  setCurrentUser(u);
                  setShowForm(true);
                }}
              />
              <IoTrashBinOutline
                size={18}
                className="text-red-600 cursor-pointer"
                onClick={() => setDeleteModal({ show: true, user: u })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ---------- Submit (Create/Update) ----------
  const handleSubmitForm = async (formData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (isUpdating) {
        await axios.put(`/users/${currentUser._id}`, formData, config);
        toast.success("User updated");
      } else {
        await axios.post("/users/register", formData, config);
        toast.success("User created");
      }
      handleFetchUsers();
      setShowForm(false);
      setIsUpdating(false);
    } catch {
      toast.error("Error saving user");
    }
  };

  // ---------- Delete User ----------
  const handleDeleteUser = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
        timeout: 10000, // 10s timeout
      };
      let res = await axios.delete(`/users/${deleteModal.user._id}`, config);
      if (res) {
        toast.success("User deleted");
        setDeleteModal({ show: false, user: null });
        handleFetchUsers();
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  return (
    <div className="px-8">
      <AdminNavbar />
      <div className="mt-32">
        <h2 className="text-2xl font-bold mb-1">Manage All Users</h2>
        <p>All users in one dashboard</p>

        {/* Search and Create */}
        <div className="mt-6 mb-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-1/3">
            <AiOutlineSearch className="text-lg mr-2" />
            <input
              type="text"
              placeholder="Search user..."
              className="bg-transparent outline-none w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setIsUpdating(false);
              setCurrentUser(null);
            }}
            className="bg-[#146C94] text-white py-2 px-4 rounded-md"
          >
            Create User
          </button>
        </div>

        {/* Create/Update Form */}
        {showForm && (
          <UserForm
            onSubmit={handleSubmitForm}
            onCancel={() => setShowForm(false)}
            userData={isUpdating ? currentUser : {}}
          />
        )}

        <h3 className="text-xl mb-3 font-semibold">
          Total: {allUsers.length} users
        </h3>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Spinner message="Fetching users..." />
          </div>
        ) : (
          <>
            <UsersTable users={paginatedUsers} />

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

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete User
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteModal.user?.username}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setDeleteModal({ show: false, user: null })}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

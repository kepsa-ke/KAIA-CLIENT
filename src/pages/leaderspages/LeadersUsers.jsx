import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { AiOutlineSearch } from "react-icons/ai";
import { IoPencil, IoTrashBinOutline } from "react-icons/io5";
const LeadersUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // fetch current member data on mount to determine if the user is a primary contact for the organization
  const [yourMemberDetails, setYourMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchCurrentMemberDetails = async () => {
    if (!user || isTokenExpired(user?.token)) return;
    try {
      setLoading(true);
      const token = user?.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`/members/mine`, config);
      setYourMemberDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching current member data:", error);
      setLoading(false);
    }
  };
  //   determining if the user is a primary contact for the organization
  const isPrimaryContact = yourMemberDetails?.some(
    (member) => member.email === user?.email,
  );

  //   fetch all users associated with the organization
  const [allUsers, setAllUsers] = useState([]);
  const fetchallUsersForOrganization = async () => {
    if (!user || isTokenExpired(user?.token)) return;
    try {
      setLoading(true);
      const token = user?.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      //   send reques as POST request with the organization name to fetch all users associated with that organization

      const response = await axios.post(
        `users/organization`,
        { organizationName: user?.organizationName },
        config,
      );
      setAllUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users for organization:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMemberDetails();
    fetchallUsersForOrganization();
  }, []);

  // Filter + Pagination
  const filteredUsers = allUsers.filter((u) =>
    [u.email, u.phone, u.organizationName].some((f) =>
      f?.toLowerCase().includes(searchText.toLowerCase()),
    ),
  );
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedUsers = filteredUsers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  // ---------- User Form ----------
  const UserForm = ({ onSubmit, onCancel, userData = {} }) => {
    const [form, setForm] = useState({
      email: userData.email || "",
      phone: userData.phone || "",
      organizationName:
        userData.organizationName || user?.organizationName || "",
      password: "", // always start empty
    });

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(form);
    };

    // Generate random password
    const generatePassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      return Array.from({ length: 10 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
    };

    const handleGeneratePassword = () => {
      const newPass = generatePassword();
      setForm((prev) => ({ ...prev, password: newPass }));
      toast.info("Password generated!");
    };

    const handleCopyCredentials = () => {
      if (!form.email || !form.password)
        return toast.warn("Email or password is empty!");
      const creds = `Email: ${form.email}\nPassword: ${form.password}`;
      navigator.clipboard.writeText(creds);
      toast.success("Credentials copied!");
    };

    return (
      <form
        className="bg-gray-50 border border-gray-300 p-4 rounded-md mb-4 space-y-3"
        onSubmit={handleSubmit}
      >
        {["email", "phone", "password"].map((field) => (
          <div key={field} className="relative">
            <label className="block font-semibold capitalize mb-1">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <div className="flex gap-2">
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
                required={field !== "password" || form.password.length > 0}
              />
              {field === "password" && (
                <>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="bg-[#146C94] hover:bg-[#0d4d6b] text-white text-sm px-3 py-2 rounded-md"
                  >
                    Generate Password
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopyCredentials}
            className="  bg-green-600 text-white py-2 px-6 rounded-md "
          >
            Copy email and password
          </button>
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

  // ---------- Users Table ----------
  const UsersTable = ({ users }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {["Email", "Phone", "Organization", "Joined", "Actions"].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">{`${u.email === user?.email ? u.email + " (You)" : u.email}`}</td>
            <td className="p-2 border-r">{u.phone}</td>
            <td className="p-2 border-r">{u.organizationName}</td>
            <td className="p-2 border-r">{moment(u.createdAt).fromNow()}</td>

            {isPrimaryContact && (
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
                {u.email !== user?.email && (
                  <IoTrashBinOutline
                    size={18}
                    className="text-red-600 cursor-pointer"
                    onClick={() => setDeleteModal({ show: true, user: u })}
                  />
                )}
              </td>
            )}
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
      fetchallUsersForOrganization();
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
        fetchallUsersForOrganization();
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        {yourMemberDetails && yourMemberDetails.length > 0 ? (
          <div>
            {yourMemberDetails.map((member, index) => (
              <div key={index}>
                {user?.email === member?.email && (
                  <div>
                    <p className="text-lg font-semibold">
                      Manage Users in {member?.organizationName}.
                    </p>
                    <p>You can add and remove users from the organization.</p>
                    <p>Users can manage everything apart from other users</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You are not a primary contact for the organization.</p>
        )}
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

          {isPrimaryContact && (
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
          )}
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
          <div className="fixed inset-0 bg-black opacity-90 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete User
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete user ?
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
    </AdminLayout>
  );
};

export default LeadersUsers;

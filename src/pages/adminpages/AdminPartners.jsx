import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoTrashBinOutline, IoPencil } from "react-icons/io5";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const AdminPartners = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [partners, setPartners] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    partner: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // ---------------- FETCH PARTNERS ----------------
  const handleFetchPartners = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/partners", config);
      setPartners(data);
    } catch {
      toast.error("Error fetching partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please sign in");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    handleFetchPartners();
  }, []);

  // ---------------- FILTER + PAGINATION ----------------
  const filteredPartners = partners.filter((c) =>
    c.organizationName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedPartners = filteredPartners.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredPartners.length / recordsPerPage);

  // ---------------- PARTNER FORM ----------------
  const PartnerForm = ({ onSubmit, onCancel, partnerData = {} }) => {
    const [form, setForm] = useState({
      organizationName: partnerData.organizationName || "",
      link: partnerData.link || "",
      image: partnerData.image || "",
    });

    const [preview, setPreview] = useState(partnerData.image || "");
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setPreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "p2jnu3t2");

      try {
        setUploadingImage(true);
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/ddqs3ukux/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        setForm((prev) => ({ ...prev, image: data.secure_url }));
      } catch (err) {
        toast.error("Image upload failed");
      } finally {
        setUploadingImage(false);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(form);
    };

    return (
      <form
        className="bg-gray-50 border border-gray-300 p-4 rounded-md mb-4 space-y-3"
        onSubmit={handleSubmit}
      >
        {/* Organization Name */}
        <div>
          <label className="block font-semibold mb-1">Organization Name</label>
          <input
            type="text"
            name="organizationName"
            value={form.organizationName}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
        </div>

        {/* Link */}
        <div>
          <label className="block font-semibold mb-1">Website / Link</label>
          <input
            type="text"
            name="link"
            value={form.link}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block font-semibold mb-1">Partner Image</label>
          {!uploadingImage && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              required={!form.image}
            />
          )}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-48 h-32 object-cover rounded-md border"
            />
          )}
        </div>

        <div className="flex gap-3">
          {loadingAction || uploadingImage ? (
            <p>Loading ...</p>
          ) : (
            <button
              type="submit"
              className="bg-[#146C94] text-white py-2 px-4 rounded-md"
            >
              {isUpdating ? "Update Partner" : "Create Partner"}
            </button>
          )}
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

  // ---------------- TABLE ----------------
  const PartnerTable = ({ partners }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {["Organization", "Link", "Image", "Created", "Actions"].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {partners.map((p) => (
          <tr key={p._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">{p.organizationName}</td>
            <td className="p-2 border-r">
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {p.link}
              </a>
            </td>
            <td className="p-2 border-r">
              <img src={p.image} alt="" className="w-28 h-28 object-contain" />
            </td>
            <td className="p-2 border-r">{moment(p.createdAt).fromNow()}</td>
            <td className="p-2 flex gap-5 items-center">
              {user?.isAdmin && (
                <>
                  <IoPencil
                    size={18}
                    className="text-[#146C94] cursor-pointer"
                    onClick={() => {
                      setIsUpdating(true);
                      setCurrentPartner(p);
                      setShowForm(true);
                    }}
                  />
                  <IoTrashBinOutline
                    size={18}
                    className="text-red-600 cursor-pointer"
                    onClick={() => setDeleteModal({ show: true, partner: p })}
                    // onClick={() => handleDeletePartner(p._id)}
                  />
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ---------------- SUBMIT (CREATE / UPDATE) ----------------
  const handleSubmitForm = async (formData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      setLoadingAction(true);

      if (isUpdating) {
        await axios.put(`/partners/${currentPartner._id}`, formData, config);
        toast.success("Partner updated successfully");
      } else {
        await axios.post("/partners", formData, config);
        toast.success("Partner created successfully");
      }

      handleFetchPartners();
      setShowForm(false);
      setIsUpdating(false);
    } catch {
      toast.error("Error saving partner");
    } finally {
      setLoadingAction(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDeletePartner = async () => {
    try {
      setLoadingAction(true);
      // console.log("Deleting partner:", deleteModal.partner._id);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
        timeout: 10000, // 10s timeout
      };
      const response = await axios.delete(
        `/partners/${deleteModal.partner._id}`,
        config
      );
      // console.log("Response:", response);
      if (response) {
        toast.success("Partner deleted");
        setDeleteModal({ show: false, partner: null });
        handleFetchPartners();
      }
    } catch {
      toast.error("Error deleting partner");
    }
  };

  // const handleDeletePartner = async (id) => {
  //   try {
  //     // setLoadingAction(true);

  //     console.log("Deleting partner:", id);
  //     const config = {
  //       headers: { Authorization: `Bearer ${user?.token}` },
  //       timeout: 10000, // 10s timeout
  //     };

  //     // const config = { headers: { Authorization: `Bearer ${user?.token}` } };
  //     // const response = await axios.delete(
  //     //   `/partners/${deleteModal.partner._id}`,
  //     //   config
  //     // );
  //     const response = await axios.delete(`/partners/${id}`, config);
  //     console.log("Response:", response);

  //     // Handle 204 (No Content) or 200 (OK)
  //     // if (response.status === 200 || response.status === 204) {
  //     //   toast.success("Partner deleted successfully");
  //     //   setPartners((prev) =>
  //     //     prev.filter((p) => p._id !== deleteModal.partner._id)
  //     //   );
  //     //   setDeleteModal({ show: false, partner: null });
  //     // } else {
  //     //   toast.error("Unexpected server response");
  //     // }
  //     console.log(response);
  //   } catch (error) {
  //     console.error("Delete Error:", error.message);
  //     toast.error("Error deleting partner");
  //   } finally {
  //     setLoadingAction(false);
  //   }
  // };

  // ---------------- UI ----------------
  return (
    <div className="px-8">
      <AdminNavbar />
      <div className="mt-32">
        <h2 className="text-2xl font-bold mb-1">Manage Technical Partners</h2>
        <p>All partners in one dashboard</p>

        {/* Search + Create */}
        <div className="mt-6 mb-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-1/3">
            <AiOutlineSearch className="text-lg mr-2" />
            <input
              type="text"
              placeholder="Search partner..."
              className="bg-transparent outline-none w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setIsUpdating(false);
              setCurrentPartner(null);
            }}
            className="bg-[#146C94] text-white py-2 px-4 rounded-md"
          >
            Create Partner
          </button>
        </div>

        {/* Create/Update Form */}
        {showForm && (
          <PartnerForm
            onSubmit={handleSubmitForm}
            onCancel={() => setShowForm(false)}
            partnerData={isUpdating ? currentPartner : {}}
          />
        )}

        <h3 className="text-xl mb-3 font-semibold">
          Total: {partners.length} technical partners
        </h3>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Spinner message="Fetching partners..." />
          </div>
        ) : (
          <>
            <PartnerTable partners={paginatedPartners} />

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

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete Partner
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteModal.partner?.organizationName}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setDeleteModal({ show: false, partner: null })}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    loadingAction
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600"
                  }`}
                  onClick={handleDeletePartner}
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

export default AdminPartners;

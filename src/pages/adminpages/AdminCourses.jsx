import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoTrashBinOutline, IoEyeOutline, IoPencil } from "react-icons/io5";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { CourseCategories } from "../../data";
import { GrEmptyCircle } from "react-icons/gr";
import { MdOutlineCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

const AdminCourses = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [viewModal, setViewModal] = useState({ show: false, course: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, course: null });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch courses
  const handleFetchCourses = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get("/courses", config);
      setCourses(data);
    } catch {
      toast.error("Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please sign in");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    handleFetchCourses();
  }, []);

  // Filter + Pagination
  const filteredCourses = courses.filter((c) =>
    [c.title, c.organization, c.category, c.tag].some((f) =>
      f?.toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedCourses = filteredCourses.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredCourses.length / recordsPerPage);

  // ---------- Course Form ----------
  const CourseForm = ({ onSubmit, onCancel, courseData = {} }) => {
    const [form, setForm] = useState({
      title: courseData.title || "",
      desc: courseData.desc || "",
      link: courseData.link || "",
      organization: courseData.organization || "",
      tag: courseData.tag || "",
      category: courseData.category || "",
      image: courseData.image || "",
    });

    const [preview, setPreview] = useState(courseData.image || "");

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    // Convert selected image to Base64 and upload to cloudinary
    const [uploadingImage, setUploadingImage] = useState(false);
    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // show local preview
      setPreview(URL.createObjectURL(file));

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kaisa34"); // Cloudinary upload preset

      try {
        setUploadingImage(true);
        //cloud name
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dfrvozkwv/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        console.log(data.secure_url);
        setForm((prev) => ({ ...prev, image: data.secure_url }));
        setUploadingImage(false);
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error("Image upload failed");
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
        {["title", "desc", "link", "organization", "tag", "category"].map(
          (field) => (
            <div key={field}>
              <label className="block font-semibold capitalize mb-1">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              {field === "desc" ? (
                <textarea
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 p-2 rounded-md"
                  required
                />
              ) : field === "category" ? (
                <select
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {CourseCategories.map((item, index) => (
                    <option value={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md"
                  required
                />
              )}
            </div>
          )
        )}

        {/* Image upload */}

        <div>
          <label className="block font-semibold mb-1">Course Image</label>

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
              {isUpdating ? "Update" : "Create"} Course
            </button>
          )}

          {!uploadingImage && (
            <>
              {!loadingAction && (
                <button
                  type="button"
                  className="bg-red-600 text-white py-2 px-4 rounded-md"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </form>
    );
  };

  // Toggle Approve / Hide
  const handleToggleApprove = async (course) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.patch(
        `/courses/${course._id}/toggle-approval`,
        { approved: !course.approved },
        config
      );
      toast.success(`course ${course.approved ? "hidden" : "approved"}`);
      handleFetchCourses();
    } catch {
      toast.error("Error updating course");
    }
  };

  // ---------- Table ----------
  const CoursesTable = ({ courses }) => (
    <table className="w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "Title",
            "Organization",
            "Category",
            "Tag",
            "Email",
            "Status",
            "Created",
            "Actions",
          ].map((h) => (
            <th key={h} className="p-2 text-left font-semibold border-r">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {courses.map((c) => (
          <tr key={c._id} className="even:bg-gray-50 hover:bg-gray-100">
            <td className="p-2 border-r">{c.title}</td>
            <td className="p-2 border-r">{c.organization}</td>
            <td className="p-2 border-r">{c.category}</td>
            <td className="p-2 border-r">{c.tag}</td>
            <td className="p-2 border-r">{c.email}</td>
            {user?.isAdmin || user?.email === c.email ? (
              <td className="p-2 border-r">
                {c.approved ? (
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
            <td className="p-2 border-r">{moment(c.createdAt).fromNow()}</td>
            <td className="p-2 flex gap-5 items-center">
              <IoEyeOutline
                size={18}
                className="text-gray-600 cursor-pointer"
                onClick={() => setViewModal({ show: true, course: c })}
              />

              {(user?.isAdmin || user?.email === c.email) && (
                <IoPencil
                  size={18}
                  className="text-[#146C94] cursor-pointer"
                  onClick={() => {
                    setIsUpdating(true);
                    setCurrentCourse(c);
                    setShowForm(true);
                  }}
                />
              )}

              {user?.isAdmin && (
                <>
                  {!c.approved ? (
                    <MdOutlineCancel
                      size={18}
                      className="text-orange-500 cursor-pointer"
                      title="Approve Course"
                      onClick={() => handleToggleApprove(c)}
                    />
                  ) : (
                    <FaCheckCircle
                      size={18}
                      className="text-green-600 cursor-pointer"
                      title="Hide Course"
                      onClick={() => handleToggleApprove(c)}
                    />
                  )}
                </>
              )}

              {(user?.isAdmin || user?.email === c.email) && (
                <IoTrashBinOutline
                  size={18}
                  className="text-red-600 cursor-pointer"
                  onClick={() => setDeleteModal({ show: true, course: c })}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const [loadingAction, setLoadingAction] = useState(false);

  // ---------- Submit (Create/Update) ----------
  const handleSubmitForm = async (formData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      if (isUpdating) {
        setLoadingAction(true);
        let response = await axios.put(
          `/courses/${currentCourse._id}`,
          formData,
          config
        );
        if (response.data) {
          setLoadingAction(false);
          toast.success("Course updated");
        } else {
          setLoadingAction(false);
          toast.error("Failed to update");
        }
      } else {
        await axios.post("/courses", formData, config);
        toast.success("Course created");
      }

      handleFetchCourses();
      setShowForm(false);
      setIsUpdating(false);
    } catch {
      toast.error("Error saving course");
    }
  };

  // ---------- Delete ----------

  const handleDeleteCourse = async () => {
    try {
      setLoadingAction(true);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
        timeout: 10000, // 10s timeout
      };
      let res = await axios.delete(
        `/courses/${deleteModal.course._id}`,
        config
      );
      if (res) {
        setLoadingAction(false);
        toast.success("Course deleted");
        setDeleteModal({ show: false, course: null });
        handleFetchCourses();
      }
    } catch {
      toast.error("Error deleting course");
      setLoadingAction(false);
    }
  };

  return (
    <div className="px-8">
      <AdminNavbar />
      <div className="mt-32">
        <h2 className="text-2xl font-bold mb-1">Manage Courses</h2>
        <p>All courses in one dashboard</p>

        {/* Search and Create */}
        <div className="mt-6 mb-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-200 px-3 py-2 rounded-md w-1/3">
            <AiOutlineSearch className="text-lg mr-2" />
            <input
              type="text"
              placeholder="Search course..."
              className="bg-transparent outline-none w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setIsUpdating(false);
              setCurrentCourse(null);
            }}
            className="bg-[#146C94] text-white py-2 px-4 rounded-md"
          >
            Create Course
          </button>
        </div>

        {/* Create/Update Form */}
        {showForm && (
          <CourseForm
            onSubmit={handleSubmitForm}
            onCancel={() => setShowForm(false)}
            courseData={isUpdating ? currentCourse : {}}
          />
        )}

        <h3 className="text-xl mb-3 font-semibold">
          Total: {courses.length} courses
        </h3>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Spinner message="Fetching courses..." />
          </div>
        ) : (
          <>
            <CoursesTable courses={paginatedCourses} />

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

        {/* ---------- View Modal ---------- */}
        {viewModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
              <h2 className="text-xl font-bold mb-2">
                {viewModal.course.title}
              </h2>
              <img
                src={viewModal.course.image}
                alt={viewModal.course.title}
                className="rounded-md mb-3 w-full max-h-48 object-cover"
              />
              <p className="text-gray-700 mb-3">{viewModal.course.desc}</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Organization:</span>{" "}
                  {viewModal.course.organization}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {viewModal.course.category}
                </p>
                <p>
                  <span className="font-semibold">Tag:</span>{" "}
                  {viewModal.course.tag}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {viewModal.course.email}
                </p>
                <p>
                  <span className="font-semibold">Link:</span>{" "}
                  <a
                    href={viewModal.course.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit course
                  </a>
                </p>
                <p className="text-gray-500 text-xs">
                  Added {moment(viewModal.course.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setViewModal({ show: false, course: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Delete Modal ---------- */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete Course
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteModal.course?.title}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setDeleteModal({ show: false, course: null })}
                >
                  Cancel
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    loadingAction
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600"
                  }`}
                  onClick={handleDeleteCourse}
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

export default AdminCourses;

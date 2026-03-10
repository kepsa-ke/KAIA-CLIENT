import { useEffect, useState } from "react";
import axios from "../../axios";
import {
  IoTrashBinOutline,
  IoAdd,
  IoPencil,
  IoLink,
  IoClose,
  IoCloudDownload,
} from "react-icons/io5";
import { FiExternalLink } from "react-icons/fi";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { toast } from "react-toastify";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const LeadersStatistics = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    metrics: {
      aware: 0,
      engaged: 0,
      trained: 0,
      certified: 0,
      orgsReached: 0,
      reachedByLeaders: 0,
    },
    links: [],
  });

  // New link form state
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    description: "",
  });

  // Filters state
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    search: "",
  });

  // Stats summary state
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      if (!user.isAdmin) {
        params.createdBy = user.email;
      }
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get("/reports", { params, ...config });
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get("/reports/summary", {
        params: { year: filters.year || new Date().getFullYear() },
        ...config,
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    if (user.isAdmin) {
      fetchSummary();
    }
  }, []);

  const handleFilter = () => {
    fetchReports();
    if (user.isAdmin) {
      fetchSummary();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (Object.keys(form.metrics).includes(name)) {
      setForm({
        ...form,
        metrics: { ...form.metrics, [name]: Number(value) },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setLinkForm({ ...linkForm, [name]: value });
  };

  const addLink = () => {
    if (!linkForm.title || !linkForm.url) return;

    setForm({
      ...form,
      links: [...form.links, { ...linkForm, _id: Date.now().toString() }],
    });

    setLinkForm({ title: "", url: "", description: "" });
  };

  const removeLink = (linkId) => {
    setForm({
      ...form,
      links: form.links.filter((link) => link._id !== linkId),
    });
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      // Prepare the data for submission
      const submitData = {
        ...form,
        createdBy: user?.email,
        organizationName: user.organizationName,
      };

      // Remove _id from links if they're new (have temporary IDs)
      if (submitData.links) {
        submitData.links = submitData.links.map((link) => {
          // Check if it's a temporary ID (like the one you're generating)
          if (link._id && link._id.toString().length > 24) {
            // MongoDB IDs are 24 chars
            const { _id, ...linkWithoutId } = link;
            return linkWithoutId;
          }
          return link;
        });
      }

      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, submitData, config);
      } else {
        await axios.post("/reports", submitData, config);
      }

      fetchReports();
      if (user.isAdmin) fetchSummary();
      setShowForm(false);
      setEditingReport(null);
      resetForm();
      toast.success(
        `Report ${editingReport ? "updated" : "created"} successfully!`,
      );
    } catch (err) {
      console.error("Error saving report:", err);
      toast.error(err.response?.data?.message || "Error saving report");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      metrics: {
        aware: 0,
        engaged: 0,
        trained: 0,
        certified: 0,
        orgsReached: 0,
        reachedByLeaders: 0,
      },
      links: [],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      // send token in header for authentication
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      await axios.delete(`/reports/${id}`, config);
      fetchReports();
      if (user.isAdmin) fetchSummary();
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setForm({
      year: report.year,
      month: report.month,
      metrics: { ...report.metrics },
      links: report.links || [],
    });
    setShowForm(true);
  };

  const handleViewLinks = (report) => {
    setSelectedReport(report);
    setShowLinksModal(true);
  };

  const handleDownloadExcel = () => {
    if (!reports || reports.length === 0) return;

    const formattedData = reports.map((r) => ({
      Organization: r.organizationName || "",
      Year: r.year,
      Month: MONTHS.find((m) => m.value === r.month)?.label || r.month,
      Aware: r.metrics.aware,
      Engaged: r.metrics.engaged,
      Trained: r.metrics.trained,
      Certified: r.metrics.certified,
      Orgs_Reached: r.metrics.orgsReached,
      Reached_By_Leaders: r.metrics.reachedByLeaders,
      Links: r.links?.map((l) => l.url).join(", ") || "",
      Contact_Email: r.createdBy,
      Created_At: new Date(r.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Impact Reports");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      blob,
      `ImpactReports_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const getMonthLabel = (monthValue) => {
    return MONTHS.find((m) => m.value === monthValue)?.label || monthValue;
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-[2em]">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Impact Reports</h1>
            <p className="text-gray-600 mt-1">
              Track and manage monthly impact metrics
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingReport(null);
              setShowForm(true);
            }}
            className="flex items-center bg-[#0067b8] text-white px-6 py-3 rounded-lg hover:bg-[#005aa3] transition-colors shadow-lg"
          >
            <IoAdd className="w-5 h-5 mr-2" /> New Monthly Report
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1">
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label> */}
              <input
                type="text"
                placeholder="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8] focus:border-transparent"
              />
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
              >
                <option value="">All Years</option>
                {[2023, 2024, 2025, 2026].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
              >
                <option value="">All Months</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFilter}
              className="bg-[#0067b8] text-white px-6 py-2 rounded-lg hover:bg-[#005aa3] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Summary Cards (Admin only) */}
        {user.isAdmin && summary && summary.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold">
                {summary.reduce((acc, s) => acc + s.reportCount, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Total People Trained</p>
              <p className="text-2xl font-bold">
                {summary.reduce((acc, s) => acc + s.totalTrained, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Total Certified</p>
              <p className="text-2xl font-bold">
                {summary.reduce((acc, s) => acc + s.totalCertified, 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Organizations Reached</p>
              <p className="text-2xl font-bold">
                {summary.reduce((acc, s) => acc + s.totalOrgsReached, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {user.isAdmin && reports.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <IoCloudDownload className="w-5 h-5 mr-2" /> Export to Excel
            </button>
          </div>
        )}

        {/* Reports Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0067b8]"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No reports found.</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 text-[#0067b8] hover:text-[#005aa3] font-medium"
            >
              Create your first report →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    {user.isAdmin && (
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">
                        Organization
                      </th>
                    )}
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Year
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Month
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Aware
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Engaged
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Trained
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Certified
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Organizations Reached
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      By Leaders
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Links
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {user.isAdmin && (
                        <td className="p-4 text-sm text-gray-900">
                          {r.organizationName || "—"}
                        </td>
                      )}
                      <td className="p-4 text-sm text-gray-900">{r.year}</td>
                      <td className="p-4 text-sm text-gray-900">
                        {getMonthLabel(r.month)}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.aware}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.engaged}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.trained}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.certified}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.orgsReached}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {r.metrics.reachedByLeaders}
                      </td>
                      <td className="p-4">
                        {r.links && r.links.length > 0 ? (
                          <button
                            onClick={() => handleViewLinks(r)}
                            className="flex items-center text-[#0067b8] hover:text-[#005aa3]"
                          >
                            <IoLink className="w-4 h-4 mr-1" />
                            <span className="text-sm">{r.links.length}</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(r)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <IoPencil className="w-4 h-4" />
                          </button>
                          {(user.isAdmin || r.createdBy === user?.email) && (
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <IoTrashBinOutline className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Report Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingReport ? "Update Report" : "Create New Report"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReport(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      name="month"
                      value={form.month}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                      required
                    >
                      {MONTHS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(form.metrics).map((key) => (
                      <div key={key}>
                        <label className="block capitalize text-sm text-gray-600 mb-1">
                          {key.replace(/([A-Z])/g, " $1")}
                        </label>
                        <input
                          type="number"
                          name={key}
                          value={form.metrics[key]}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links Section */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Supporting Links
                  </h3>

                  {/* Link Input Form */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input
                      type="text"
                      name="title"
                      placeholder="Link title"
                      value={linkForm.title}
                      onChange={handleLinkChange}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                    />
                    <input
                      type="url"
                      name="url"
                      placeholder="URL"
                      value={linkForm.url}
                      onChange={handleLinkChange}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                    />
                    <input
                      type="text"
                      name="description"
                      placeholder="Description (optional)"
                      value={linkForm.description}
                      onChange={handleLinkChange}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#0067b8]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center text-[#0067b8] hover:text-[#005aa3] mb-3"
                  >
                    <IoAdd className="w-4 h-4 mr-1" /> Add Link
                  </button>

                  {/* Links List */}
                  {form.links.length > 0 && (
                    <div className="space-y-2">
                      {form.links.map((link) => (
                        <div
                          key={link._id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{link.title}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center"
                            >
                              {link.url}{" "}
                              <FiExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            {link.description && (
                              <p className="text-xs text-gray-600">
                                {link.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLink(link._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IoTrashBinOutline className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingReport(null);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                      submitLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#0067b8] hover:bg-[#005aa3] text-white"
                    }`}
                  >
                    {submitLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {editingReport ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingReport ? "Update Report" : "Create Report"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Links Modal */}
        {showLinksModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Links - {selectedReport.organizationName} (
                  {getMonthLabel(selectedReport.month)} {selectedReport.year})
                </h2>
                <button
                  onClick={() => {
                    setShowLinksModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedReport.links && selectedReport.links.length > 0 ? (
                  selectedReport.links.map((link) => (
                    <div key={link._id} className="border rounded-lg p-3">
                      <h3 className="font-medium text-gray-900">
                        {link.title}
                      </h3>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        {link.url} <FiExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No links available for this report.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LeadersStatistics;

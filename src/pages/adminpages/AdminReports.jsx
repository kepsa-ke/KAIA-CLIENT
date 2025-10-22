import { useEffect, useState } from "react";
import axios from "../../axios";

import { IoTrashBinOutline, IoAdd, IoPencil } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";

const ImpactReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    quarter: "",
    metrics: {
      aware: 0,
      engaged: 0,
      trained: 0,
      certified: 0,
      orgsReached: 0,
      reachedByLeaders: 0,
    },
  });

  // Top of component state
  const [filters, setFilters] = useState({ year: "", quarter: "", search: "" });

  // Updated fetchReports to include filters
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Non-admins can only see their reports
      if (!user.isAdmin) {
        params.createdBy = user.email;
      }

      const res = await axios.get("/reports", { params });
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle Form Input
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

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, form);
      } else {
        await axios.post("/reports", {
          ...form,
          createdBy: user?.email,
          organizationName: user.organizationName,
        });
      }
      fetchReports();
      setShowForm(false);
      setEditingReport(null);
    } catch (err) {
      console.error("Error saving report:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await axios.delete(`/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  // Edit
  const handleEdit = (report) => {
    setEditingReport(report);
    setForm({
      year: report.year,
      quarter: report.quarter,
      metrics: { ...report.metrics },
    });
    setShowForm(true);
  };

  const handleDownloadExcel = () => {
    if (!reports || reports.length === 0) return;

    // Prepare data for Excel (flatten the nested "metrics" object)
    const formattedData = reports.map((r) => ({
      Organization: r.organizationName || "",
      Year: r.year,
      Quarter: r.quarter,
      Aware: r.metrics.aware,
      Engaged: r.metrics.engaged,
      Trained: r.metrics.trained,
      Certified: r.metrics.certified,
      Orgs_Reached: r.metrics.orgsReached,
      Reached_By_Leaders: r.metrics.reachedByLeaders,
      Contact_Email: r.createdBy,
      Created_At: new Date(r.createdAt).toLocaleDateString(),
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Impact Reports");

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      blob,
      `ImpactReports_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="p-6">
      <AdminNavbar />
      <div className="flex justify-between items-center mb-6 mt-[4em]">
        <h1 className="text-2xl font-bold text-gray-800">Impact Reports</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-[#0067b8] text-white px-4 py-2 rounded-md hover:bg-[#005aa3]"
        >
          <IoAdd className="w-4 h-4 mr-2" /> New Report
        </button>
      </div>

      {/* Filters Section (Visible only to Admins) */}
      {user.isAdmin && (
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by organization or email"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border border-gray-300 p-2 rounded-md flex-1"
          />

          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Years</option>
            {[2023, 2024, 2025].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            value={filters.quarter}
            onChange={(e) =>
              setFilters({ ...filters, quarter: e.target.value })
            }
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>

          <button
            onClick={fetchReports}
            className="bg-[#0067b8] text-white px-4 py-2 rounded-md hover:bg-[#005aa3]"
          >
            Filter
          </button>
        </div>
      )}

      {user.isAdmin && reports.length > 0 && (
        <button
          onClick={handleDownloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Download Excel
        </button>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {user.isAdmin && <th className="p-3 text-left">Member</th>}
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Quarter</th>
                <th className="p-3 text-left">Awareness</th>
                <th className="p-3 text-left">Engaged</th>
                <th className="p-3 text-left">Trained</th>
                <th className="p-3 text-left">Certified</th>
                <th className="p-3 text-left">Organizations Reached</th>
                <th className="p-3 text-left">Reached by Leaders</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  {user.isAdmin && (
                    <td className="p-3">{r.organizationName || "—"}</td>
                  )}
                  <td className="p-3">{r.year}</td>
                  <td className="p-3">{r.quarter}</td>
                  <td className="p-3">{r.metrics.aware}</td>
                  <td className="p-3">{r.metrics.engaged}</td>
                  <td className="p-3">{r.metrics.trained}</td>
                  <td className="p-3">{r.metrics.certified}</td>
                  <td className="p-3">{r.metrics.orgsReached}</td>
                  <td className="p-3">{r.metrics.reachedByLeaders}</td>

                  <td className="p-3 flex gap-4">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <IoPencil className="w-4 h-4" />
                    </button>
                    {(user.isAdmin || r.createdBy === user?.email) && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <IoTrashBinOutline className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-scroll">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editingReport ? "Update Report" : "Create Report"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Quarter</label>
                <select
                  name="quarter"
                  value={form.quarter}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                  required
                >
                  <option value="">Select quarter</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>

              {/* Metrics */}
              {Object.keys(form.metrics).map((key) => (
                <div key={key}>
                  <label className="block capitalize font-semibold mb-1">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={form.metrics[key]}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReport(null);
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0067b8] text-white rounded-md"
                >
                  {editingReport ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactReportsPage;

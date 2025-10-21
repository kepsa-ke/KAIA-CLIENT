import { useEffect, useState } from "react";
import axios from "../axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { FaTrophy } from "react-icons/fa";

const ImpactOverview = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [aggregates, setAggregates] = useState({
    aware: 0,
    engaged: 0,
    trained: 0,
    certified: 0,
    orgsReached: 0,
    reachedByLeaders: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch reports
  const fetchData = async () => {
    try {
      const res = await axios.get("/reports", { params: { year, quarter } });
      const reports = res.data;
      setData(reports);

      // Aggregate totals
      const total = reports.reduce(
        (acc, item) => {
          const m = item.metrics;
          Object.keys(acc).forEach((key) => {
            acc[key] += m[key] || 0;
          });
          return acc;
        },
        {
          aware: 0,
          engaged: 0,
          trained: 0,
          certified: 0,
          orgsReached: 0,
          reachedByLeaders: 0,
        }
      );
      setAggregates(total);

      // Trend Data (by quarter)
      const trend = {};
      reports.forEach((r) => {
        const key = `${r.year}-${r.quarter}`;
        if (!trend[key]) {
          trend[key] = { name: key, aware: 0, engaged: 0, trained: 0 };
        }
        trend[key].aware += r.metrics.aware || 0;
        trend[key].engaged += r.metrics.engaged || 0;
        trend[key].trained += r.metrics.trained || 0;
      });
      setTrendData(Object.values(trend));

      // Leaderboard (top organizations by total impact)
      const orgMap = {};
      reports.forEach((r) => {
        const org = r.organizationName || r.userId?.name || "Unknown";
        const totalImpact =
          r.metrics.aware +
          r.metrics.engaged +
          r.metrics.trained +
          r.metrics.certified;
        if (!orgMap[org]) orgMap[org] = 0;
        orgMap[org] += totalImpact;
      });
      const sorted = Object.entries(orgMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setLeaderboard(sorted);
    } catch (err) {
      console.error("Error fetching impact data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, quarter]);

  // Transform data for chart
  const barChartData = Object.entries(aggregates).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, " $1"),
    value,
  }));

  return (
    <div className="p-6 bg-gray-50  px-[2em]  xl:px-[5em] mt-[2em]">
      <h1 className=" mb-2 blueHeaderText text-center">
        Our Collective Impact
      </h1>
      <p className="text-center text-gray-600 mb-8">
        A real-time snapshot of how our community is transforming lives and
        organizations.
      </p>

      {/* Filters */}
      {/* <div className="flex flex-wrap justify-center gap-4 mb-10">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">All Years</option>
          {[2023, 2024, 2025].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">All Quarters</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>

        <button
          onClick={() => {
            setYear("");
            setQuarter("");
          }}
          className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Reset
        </button>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {Object.entries(aggregates).map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white shadow-md rounded-xl p-4 text-center"
          >
            <p className="text-sm text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <h2 className="text-2xl font-bold text-[#0067b8]">
              {value.toLocaleString()}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold mb-4 text-gray-700">Impact Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0067b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-semibold mb-4 text-gray-700">
            Impact Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="aware"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="trained"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="engaged"
                stroke="#f97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* Leaderboard */}
      {/* <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
        <h3 className="font-semibold mb-4 text-gray-700 text-center">
          Top 5 Impact Contributors
        </h3>
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((org, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b pb-2"
              >
                <span className="font-medium text-gray-700">
                  {idx + 1}. {org.name}
                </span>
                <span className="font-semibold text-[#0067b8]">
                  {org.total.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No contributors found for this period.
            </p>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default ImpactOverview;

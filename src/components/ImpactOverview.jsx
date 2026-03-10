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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FaTrophy,
  FaLink,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaAward,
  FaHandHoldingHeart,
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COLORS = [
  "#0067b8",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const ImpactOverview = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
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
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [topLinks, setTopLinks] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("trained");
  const [yearlyStats, setYearlyStats] = useState(null);

  // Fetch reports
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (year) params.year = Number(year);
      if (month) params.month = Number(month);

      const res = await axios.get("/reports/public", { params });
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
        },
      );
      setAggregates(total);

      // Calculate yearly stats
      const yearStats = {};
      reports.forEach((r) => {
        if (!yearStats[r.year]) {
          yearStats[r.year] = {
            year: r.year,
            totalImpact: 0,
            reportCount: 0,
            months: new Set(),
          };
        }
        yearStats[r.year].totalImpact += Object.values(r.metrics).reduce(
          (a, b) => a + b,
          0,
        );
        yearStats[r.year].reportCount++;
        yearStats[r.year].months.add(r.month);
      });

      setYearlyStats(
        Object.values(yearStats).map((stat) => ({
          ...stat,
          monthCount: stat.months.size,
          avgPerReport: Math.round(stat.totalImpact / stat.reportCount),
        })),
      );

      // Monthly Breakdown for current year
      if (reports.length > 0) {
        const monthly = {};
        reports.forEach((r) => {
          const key = `${r.year}-${r.month}`;
          if (!monthly[key]) {
            monthly[key] = {
              name: MONTHS[r.month - 1].substring(0, 3),
              fullName: `${MONTHS[r.month - 1]} ${r.year}`,
              month: r.month,
              year: r.year,
              aware: 0,
              engaged: 0,
              trained: 0,
              certified: 0,
              total: 0,
            };
          }
          monthly[key].aware += r.metrics.aware || 0;
          monthly[key].engaged += r.metrics.engaged || 0;
          monthly[key].trained += r.metrics.trained || 0;
          monthly[key].certified += r.metrics.certified || 0;
          monthly[key].total += Object.values(r.metrics).reduce(
            (a, b) => a + b,
            0,
          );
        });

        const sortedMonthly = Object.values(monthly)
          .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })
          .slice(0, 12);

        setMonthlyBreakdown(sortedMonthly);
      }

      // Trend Data (by month for line chart)
      const trend = {};
      reports.forEach((r) => {
        const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
        if (!trend[key]) {
          trend[key] = {
            name: key,
            displayName: `${MONTHS[r.month - 1].substring(0, 3)} ${r.year}`,
            aware: 0,
            engaged: 0,
            trained: 0,
            certified: 0,
            orgsReached: 0,
          };
        }
        trend[key].aware += r.metrics.aware || 0;
        trend[key].engaged += r.metrics.engaged || 0;
        trend[key].trained += r.metrics.trained || 0;
        trend[key].certified += r.metrics.certified || 0;
        trend[key].orgsReached += r.metrics.orgsReached || 0;
      });

      const trendArray = Object.values(trend)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-12);
      setTrendData(trendArray);

      // Leaderboard (top organizations by total impact)
      const orgMap = {};
      reports.forEach((r) => {
        const org =
          r.organizationName || r.createdBy?.split("@")[0] || "Unknown";
        const totalImpact = Object.values(r.metrics).reduce((a, b) => a + b, 0);
        if (!orgMap[org]) orgMap[org] = 0;
        orgMap[org] += totalImpact;
      });

      const sorted = Object.entries(orgMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setLeaderboard(sorted);

      // Collect top links
      const allLinks = reports
        .flatMap((r) =>
          (r.links || []).map((link) => ({
            ...link,
            organization: r.organizationName,
            date: `${MONTHS[r.month - 1]} ${r.year}`,
          })),
        )
        .slice(0, 5);
      setTopLinks(allLinks);
    } catch (err) {
      console.error("Error fetching impact data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  // Transform data for pie chart
  const pieChartData = Object.entries(aggregates)
    .filter(([key]) => !["orgsReached", "reachedByLeaders"].includes(key))
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

  return (
    // <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="">
      {/* Hero Section */}
      <div className=" py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
          >
            Our Collective Impact
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-center  max-w-3xl mx-auto"
          >
            Together, we're transforming lives and organizations through
            measurable impact
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Select Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0067b8] focus:border-transparent"
              >
                <option value="">All Years</option>
                {[2023, 2024, 2025, 2026].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaChartLine className="inline mr-2" />
                Select Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0067b8] focus:border-transparent"
              >
                <option value="">All Months</option>
                {MONTHS.map((monthName, index) => (
                  <option key={index + 1} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setYear("");
                setMonth("");
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </motion.div> */}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0067b8] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            >
              {Object.entries(aggregates).map(([key, value], i) => {
                const labels = {
                  aware: "Awareness",
                  engaged: "Engaged",
                  trained: "Trained",
                  certified: "Certified",
                  orgsReached: "Organizations Reached",
                  reachedByLeaders: "Organizations Reached by Leaders",
                };

                const icons = {
                  aware: <FaUsers className="w-6 h-6" />,
                  engaged: <FaHandHoldingHeart className="w-6 h-6" />,
                  trained: <FaAward className="w-6 h-6" />,
                  certified: <FaTrophy className="w-6 h-6" />,
                };

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white shadow-lg rounded-xl p-4 text-center border-b-4 border-[#0067b8]"
                  >
                    <div className="text-[#0067b8] mb-4 flex justify-center">
                      {icons[key] || <FaChartLine className="w-6 h-6" />}
                    </div>
                    <p className="text-sm text-gray-500 capitalize mb-2">
                      {labels[key] || key}
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {value.toLocaleString()}
                    </h2>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Yearly Stats */}
            {/* {yearlyStats && yearlyStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              >
                {yearlyStats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {stat.year} Summary
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Total Impact:</span>{" "}
                        {stat.totalImpact.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Reports:</span>{" "}
                        {stat.reportCount}
                      </p>
                      <p>
                        <span className="font-medium">Active Months:</span>{" "}
                        {stat.monthCount}/12
                      </p>
                      <p>
                        <span className="font-medium">Avg per Report:</span>{" "}
                        {stat.avgPerReport.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )} */}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart */}
              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-[#0067b8]" />
                  Impact Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#0067b8" }}
                    />
                    <Bar
                      dataKey="trained"
                      fill="#0067b8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="aware" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="certified"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div> */}

              {/* Line Chart */}
              {/* <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                  <IoMdTrendingUp className="w-5 h-5 mr-2 text-[#0067b8]" />
                  Growth Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayName" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#0067b8"
                      strokeWidth={3}
                      dot={{ fill: "#0067b8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>

              
                <div className="flex flex-wrap gap-2 mt-4">
                  {["aware", "engaged", "trained", "certified"].map(
                    (metric) => (
                      <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedMetric === metric
                            ? "bg-[#0067b8] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </motion.div> */}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-lg col-span-1"
              >
                <h3 className="font-semibold text-lg text-gray-700 mb-4">
                  Impact Composition
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div> */}

              {/* Leaderboard */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white p-6 rounded-xl shadow-lg col-span-1"
              >
                <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                  <FaTrophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((org, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700 flex items-center">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                              idx === 0
                                ? "bg-yellow-100 text-yellow-600"
                                : idx === 1
                                  ? "bg-gray-200 text-gray-600"
                                  : idx === 2
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          {org.name}
                        </span>
                        <span className="font-semibold text-[#0067b8]">
                          {org.total.toLocaleString()}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No contributors found
                    </p>
                  )}
                </div>
              </motion.div> */}

              {/* Recent Links */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white p-6 rounded-xl shadow-lg col-span-1"
              >
                <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                  <FaLink className="w-5 h-5 mr-2 text-[#0067b8]" />
                  Recent Resources
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {topLinks.length > 0 ? (
                    topLinks.map((link, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between group"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 group-hover:text-[#0067b8] transition-colors">
                              {link.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {link.organization} • {link.date}
                            </p>
                            {link.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {link.description}
                              </p>
                            )}
                          </div>
                          <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-[#0067b8] ml-2 mt-1" />
                        </a>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No links shared yet
                    </p>
                  )}
                </div>
              </motion.div> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImpactOverview;

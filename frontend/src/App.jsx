import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AddMachines from "./components/AddMachines";
import { useState, useCallback } from "react";

dayjs.extend(relativeTime);

const API = "http://localhost:5000/api/machines";
const API_KEY = "dev-only-secret";

function Chip({ ok, text }) {
  const color = ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {text || (ok ? "OK" : "N/A")} {/* ✅ changed Issue → N/A */}
    </span>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [os, setOs] = useState("");
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (os) params.os = os;
      if (issuesOnly) params.issues = true;
      const res = await axios.get(API, {
        params,
        headers: { "x-api-key": API_KEY },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error loading machines:", err.message);
      setData([]); // fallback
    }
  }, [os, issuesOnly]);

  // Quick stats
  const total = data.length;
  const healthy = data.filter(
    (m) =>
      m.checks?.diskEncryption?.ok &&
      m.checks?.osUpdate?.ok &&
      m.checks?.antivirus?.ok &&
      m.checks?.sleep?.ok
  ).length; // ✅ added ?.
  const issues = total - healthy;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded shadow"
        onClick={() => setShowAdd((v) => !v)}
      >
        {showAdd ? "Hide Add Machine" : "Add Machine"}
      </button>
      {showAdd && <AddMachines />}

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🖥 System Health Dashboard
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-gray-500 text-sm">Total Machines</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4 text-center">
          <p className="text-green-600 text-sm">Healthy</p>
          <h2 className="text-2xl font-bold text-green-700">{healthy}</h2>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-4 text-center">
          <p className="text-red-600 text-sm">With Issues</p>
          <h2 className="text-2xl font-bold text-red-700">{issues}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          className="border px-3 py-2 rounded shadow-sm"
          value={os}
          onChange={(e) => setOs(e.target.value)}
        >
          <option value="">All OS</option>
          <option value="win32">Windows</option>
          <option value="darwin">macOS</option>
          <option value="linux">Linux</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={issuesOnly}
            onChange={(e) => setIssuesOnly(e.target.checked)}
          />
          Critical Issues Only
        </label>
        <button
          onClick={load}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          Refresh
        </button>
        <a
          href="http://localhost:5000/api/export.csv"
          target="_blank"
          className="border px-4 py-2 rounded shadow bg-white hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">Host</th>
              <th className="p-3 text-left font-semibold text-gray-700">OS</th>
              <th className="p-3 text-left font-semibold text-gray-700">Disk</th>
              <th className="p-3 text-left font-semibold text-gray-700">
                OS Update
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Antivirus
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">Sleep</th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Last Seen
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => {
              const hasIssue =
                !m.checks?.diskEncryption?.ok || // ✅ added ?.
                !m.checks?.osUpdate?.ok ||
                !m.checks?.antivirus?.ok ||
                !m.checks?.sleep?.ok;

              return (
                <tr
                  key={m._id}
                  className={`${
                    hasIssue
                      ? "bg-red-50"
                      : i % 2 === 0
                      ? "bg-gray-50"
                      : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {m.hostname}
                  </td>
                  <td className="p-3 capitalize">{m.platform}</td>
                  <td className="p-3">
                    <Chip
                      ok={m.checks?.diskEncryption?.ok} // ✅ safe access
                      text={m.checks?.diskEncryption?.details || "N/A"} // ✅ fallback
                    />
                  </td>
                  <td className="p-3">
                    <Chip
                      ok={m.checks?.osUpdate?.ok}
                      text={m.checks?.osUpdate?.details || "N/A"}
                    />
                  </td>
                  <td className="p-3">
                    <Chip
                      ok={m.checks?.antivirus?.ok}
                      text={m.checks?.antivirus?.details || "N/A"}
                    />
                  </td>
                  <td className="p-3">
                    <Chip
                      ok={m.checks?.sleep?.ok}
                      text={m.checks?.sleep?.details || "N/A"}
                    />
                  </td>
                  <td className="p-3 text-gray-600">
                    {m.lastSeen ? dayjs(m.lastSeen).fromNow() : "N/A"}{" "}
                    {/* ✅ fallback for missing lastSeen */}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

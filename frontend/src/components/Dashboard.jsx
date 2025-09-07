import React, { useState, useCallback, useEffect } from "react";

import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const API = "http://localhost:5000/api/machines";
const API_KEY = "dev-only-secret";

export default function App() {
  const [data, setData] = useState([]);
  const [os, setOs] = useState("");
  const [issuesOnly, setIssuesOnly] = useState(false);
 
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
      setData([]);
    }
  }, [os, issuesOnly]);

  useEffect(() => {
    load();
  }, [load]);

  // summary counts
  const total = data.length;
  const healthy = data.filter(
    (m) => m.checks?.diskEncryption?.ok && m.checks?.osUpdate?.ok
  ).length;
  const withIssues = total - healthy;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          🖥️ System Health Dashboard
        </h1>
        <div className="flex gap-3">
         
         
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-xl p-6 text-center border">
          <h2 className="text-gray-600 font-medium">Total Machines</h2>
          <p className="text-3xl font-bold mt-2">{total}</p>
        </div>
        <div className="bg-green-50 shadow rounded-xl p-6 text-center border border-green-200">
          <h2 className="text-green-700 font-medium">Healthy</h2>
          <p className="text-3xl font-bold text-green-700 mt-2">{healthy}</p>
        </div>
        <div className="bg-red-50 shadow rounded-xl p-6 text-center border border-red-200">
          <h2 className="text-red-700 font-medium">With Issues</h2>
          <p className="text-3xl font-bold text-red-700 mt-2">{withIssues}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400"
          value={os}
          onChange={(e) => setOs(e.target.value)}
        >
          <option value="">All OS</option>
          <option value="Windows">Windows</option>
          <option value="Linux">Linux</option>
          <option value="MacOS">MacOS</option>
        </select>

        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={issuesOnly}
            onChange={(e) => setIssuesOnly(e.target.checked)}
          />
          Critical Issues Only
        </label>

        <button
          onClick={load}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          Refresh
        </button>
        <button
          onClick={() => alert("CSV export not implemented")}
          className="border px-5 py-2 rounded-lg shadow-md transition"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="p-3 border">Hostname</th>
              <th className="p-3 border">Platform</th>
              <th className="p-3 border">Arch</th>
              <th className="p-3 border">Last Seen</th>
              <th className="p-3 border">Disk Encryption</th>
              <th className="p-3 border">OS Update</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{m.hostname}</td>
                  <td className="p-3 border">{m.platform}</td>
                  <td className="p-3 border">{m.arch}</td>
                  <td className="p-3 border text-sm text-gray-600">
                    {m.lastSeen ? dayjs(m.lastSeen).fromNow() : "N/A"}
                  </td>
                  <td className="p-3 border">
                    {m.checks?.diskEncryption?.ok ? (
                      <span className="text-green-600 font-semibold">
                        ✅ {m.checks?.diskEncryption?.details}
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ❌ {m.checks?.diskEncryption?.details || "N/A"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border">
                    {m.checks?.osUpdate?.ok ? (
                      <span className="text-green-600 font-semibold">
                        ✅ {m.checks?.osUpdate?.details}
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ❌ {m.checks?.osUpdate?.details || "N/A"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Are you sure you want to delete this machine?"
                          )
                        )
                          return;

                        try {
                          await axios.delete(`${API}/${m._id}`, {
                            headers: { "x-api-key": API_KEY },
                          });
                          setData(data.filter((x) => x._id !== m._id));
                        } catch (err) {
                          console.error("Error deleting machine:", err);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

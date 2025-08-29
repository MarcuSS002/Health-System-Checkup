
import { useState } from "react";
import axios from "axios";


const AddMachines = () => {
  const [machineId, setMachineId] = useState("");
  const [hostname, setHostname] = useState("");
  const [platform, setPlatform] = useState("");
  const [arch, setArch] = useState("");
  const [checks, setChecks] = useState({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/report", {
        machineId,
        hostname,
        platform,
        arch,
        checks,
        ts: new Date().toISOString()
      }, {
        headers: { "x-api-key": "dev-only-secret" }
      });
      setMessage(" Machine added!");
      setMachineId("");
      setHostname("");
      setPlatform("");
      setArch("");
      setChecks({});
    } catch {
      setMessage(" Error adding machine");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Machine</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Machine ID" value={machineId} onChange={e=>setMachineId(e.target.value)} required className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Hostname" value={hostname} onChange={e=>setHostname(e.target.value)} required className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Platform (windows/linux/darwin)" value={platform} onChange={e=>setPlatform(e.target.value)} required className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Arch (x64/arm)" value={arch} onChange={e=>setArch(e.target.value)} required className="w-full px-4 py-2 border rounded" />
        {/* Checks can be expanded as needed */}
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Add Machine</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AddMachines;

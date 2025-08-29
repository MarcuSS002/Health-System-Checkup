require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const stringify = require("csv-stringify").stringify;

const Machine = require("./models/Machine");
const authRoutes = require("./routes/auth");


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);

const { MONGODB_URI, PORT=5000, API_KEY } = process.env;
mongoose.connect(MONGODB_URI).then(()=>console.log("Mongo connected")).catch(console.error);


app.use((req,res,next)=>{
  if (req.path.startsWith("/api/")) {
    const key = req.headers["x-api-key"];
    if (!key || key !== API_KEY) return res.status(401).json({error:"unauthorized"});
  }
  next();
});

// Creates a new machine record (if first time) or updates the existing one (if already present).
app.post("/api/report", async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  for (const m of payload) {
    if (!m.machineId || !m.checks) {
      return res.status(400).json({ error: "bad payload" });
    }
    await Machine.findOneAndUpdate(
      { machineId: m.machineId },
      { 
        machineId: m.machineId,
        hostname: m.hostname,
        platform: m.platform,
        arch: m.arch,
        checks: m.checks,
        lastSeen: m.ts || new Date()
      },
      { upsert: true, new: true }
    );
  }

  res.json({ ok: true, count: payload.length });
});


// list machines (filters: os, issues=true)
app.get("/api/machines", async (req,res)=>{
  const q = {};
  
  if (req.query.os) {
    let os = req.query.os.toLowerCase();
    if (os === "win32") os = "windows"; // normalize Windows
    q.platform = new RegExp(`^${os}$`, "i"); // case-insensitive
  }

  if (req.query.issues === "true") {
    q.$or = [
      { "checks.diskEncryption.ok": false },
      { "checks.osUpdate.ok": false },
      { "checks.antivirus.ok": false },
      { "checks.sleep.ok": false },
    ];
  }

  const list = await Machine.find(q).sort({ lastSeen: -1 });
  res.json(list);
});

// single machine
app.get("/api/machines/:id", async (req,res)=>{
  const m = await Machine.findById(req.params.id);
  if (!m) return res.status(404).json({error:"not found"});
  res.json(m);
});

// CSV export
app.get("/api/export.csv", async (req,res)=>{
  const rows = await Machine.find().lean();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=machines.csv");
  const columns = [
    "machineId","hostname","platform","arch","lastSeen",
    "diskEncryption_ok","diskEncryption_details",
    "osUpdate_ok","osUpdate_details",
    "antivirus_ok","antivirus_details",
    "sleep_ok","sleep_details",
  ];
  const data = rows.map(r=>[
    r.machineId, r.hostname, r.platform, r.arch, r.lastSeen,
    r.checks?.diskEncryption?.ok, r.checks?.diskEncryption?.details,
    r.checks?.osUpdate?.ok, r.checks?.osUpdate?.details,
    r.checks?.antivirus?.ok, r.checks?.antivirus?.details,
    r.checks?.sleep?.ok, r.checks?.sleep?.details,
  ]);
  stringify([columns, ...data]).pipe(res);
});

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Here you would normally check the email and password against your database
  res.send("Login route");
});



app.listen(PORT, ()=>console.log(`API on http://localhost:${PORT}`));

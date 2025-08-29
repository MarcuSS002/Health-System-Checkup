const mongoose = require("mongoose");

const CheckSchema = new mongoose.Schema({
  ok: Boolean,
  details: String,
}, { _id: false });

const MachineSchema = new mongoose.Schema({
  machineId: { type: String, unique: true, index: true },
  hostname: String,
  platform: String,
  arch: String,
  lastSeen: Date,
  checks: {
    diskEncryption: CheckSchema,
    osUpdate: CheckSchema,
    antivirus: CheckSchema,
    sleep: CheckSchema,
  },
}, { timestamps: true });

module.exports = mongoose.model("Machine", MachineSchema);

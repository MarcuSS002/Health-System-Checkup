
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const crypto = require('crypto');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI; 
const DB_NAME = process.env.DB_NAME || 'healthmon';
const API_KEY = process.env.API_KEY; 

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

async function start() {
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 20,
    useUnifiedTopology: true,
  });
  await client.connect();
  const db = client.db(DB_NAME);

  // Example: create TTL index for raw reports (keep 30 days)
  const raw = db.collection('raw_reports');
  await raw.createIndex({ ts: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

  // Example: per-machine daily summary collection
  const summary = db.collection('machine_daily');
  await summary.createIndex({ machineId: 1, day: 1 }, { unique: true });

  // API endpoint
  app.post('/api/report', async (req, res) => {
    try {
      // simple API key check
      const key = req.header('x-api-key') || '';
      if (key !== API_KEY) return res.status(401).json({ error: 'unauthorized' });

      const payload = req.body;
      // validate minimal shape
      if (!payload.machineId) return res.status(400).json({ error: 'missing machineId' });

      // compute HMAC (tamper-evidence)
      const hmac = crypto.createHmac('sha256', process.env.SHARED_SECRET || 'dev').update(JSON.stringify(payload.checks||{})).digest('hex');

      // store raw (small doc)
      await raw.insertOne({ machineId: payload.machineId, ts: new Date(payload.ts || Date.now()), payload, meta: { ip: req.ip }, hmac });

      // upsert daily summary with basic fields + last seen
      const day = new Date(payload.ts || Date.now()).toISOString().slice(0,10); // YYYY-MM-DD
      const summaryDoc = {
        machineId: payload.machineId,
        day,
        lastSeen: new Date(payload.ts || Date.now()),
        hostname: payload.hostname,
        platform: payload.platform,
        arch: payload.arch,
        latestChecks: payload.checks,
        // compute a simple score server-side (example)
        score: computeScore(payload.checks),
      };
      await summary.updateOne(
        { machineId: payload.machineId, day },
        { $set: summaryDoc, $inc: { reportCount: 1 } },
        { upsert: true }
      );

      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server error' });
    }
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Server Listening on port 5000', port));
}

function computeScore(checks) {
  if (!checks) return 0;
  let score = 100;
  if (!checks.diskEncryption?.ok) score -= 30;
  if (!checks.osUpdate?.ok) score -= 25;
  if (!checks.antivirus?.ok) score -= 20;
  if (!checks.sleep?.ok) score -= 5;
  return Math.max(0, score);
}

start().catch(err => { console.error(err); process.exit(1); });

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

const app      = express();
const PORT     = 3000;
const DATA     = path.join(__dirname, 'data.json');
const CONFIG   = path.join(__dirname, 'config.json');

// ── Load config (written by setup.js) ────────────────────────────────────
if (!fs.existsSync(CONFIG)) {
  console.error('❌  config.json not found. Run: npm run setup');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const p1Key  = config.player1.toLowerCase();
const p2Key  = config.player2.toLowerCase();

// ── Init data file if missing ─────────────────────────────────────────────
if (!fs.existsSync(DATA)) {
  fs.writeFileSync(DATA, JSON.stringify({
    entries:     [],
    schedule:    null,
    checks:      {},
    player1Name: config.player1,
    player2Name: config.player2,
    streaks:     { [p1Key]: 0, [p2Key]: 0 }
  }, null, 2));
}

function readData()   { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
function writeData(d) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

// ── Migrate: ensure streaks field exists ─────────────────────────────────
(function() {
  const d = readData();
  if (!d.streaks) { d.streaks = { [p1Key]: 0, [p2Key]: 0 }; writeData(d); }
})();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Request logger ────────────────────────────────────────────────────────
const seenIPs = new Set();
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?';
  if (!seenIPs.has(ip)) {
    seenIPs.add(ip);
    console.log(`📱 New device connected: ${ip}`);
  }
  res.on('finish', () => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${ts}] ${ip} → ${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
});

// ── GET config ────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json(config);
});

// ── GET all data ──────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// ── POST a new chore entry ────────────────────────────────────────────────
app.post('/api/entries', (req, res) => {
  const d     = readData();
  const entry = { ...req.body, time: req.body.time || Date.now() };
  d.entries.unshift(entry);
  writeData(d);
  res.json({ ok: true, entry });
});

// ── DELETE an entry by index ──────────────────────────────────────────────
app.delete('/api/entries/:idx', (req, res) => {
  const d = readData();
  d.entries.splice(parseInt(req.params.idx), 1);
  writeData(d);
  res.json({ ok: true });
});

// ── ARCHIVE entries for the week + update streaks ─────────────────────────
app.patch('/api/entries/archive/:weekStart', (req, res) => {
  const d  = readData();
  const ws = req.params.weekStart;

  const wEnt  = d.entries.filter(e => e.week === ws && !e.archived);
  const p1Pts = wEnt.filter(e => e.who === p1Key).reduce((s, e) => s + e.pts, 0);
  const p2Pts = wEnt.filter(e => e.who !== p1Key).reduce((s, e) => s + e.pts, 0);
  if (!d.streaks) d.streaks = { [p1Key]: 0, [p2Key]: 0 };
  if (p1Pts > p2Pts)      { d.streaks[p1Key]++; d.streaks[p2Key] = 0; }
  else if (p2Pts > p1Pts) { d.streaks[p2Key]++; d.streaks[p1Key] = 0; }
  else                    { d.streaks[p1Key] = 0; d.streaks[p2Key] = 0; }

  const m = new Date(ws), s = new Date(ws);
  s.setDate(m.getDate() + 6);
  const fmt          = dt => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const archivedWeek = fmt(m) + ' – ' + fmt(s);
  d.entries = d.entries.map(e =>
    (e.week === ws && !e.archived) ? { ...e, archived: true, archivedWeek } : e
  );
  writeData(d);
  res.json({ ok: true });
});

// ── PATCH schedule ────────────────────────────────────────────────────────
app.patch('/api/schedule', (req, res) => {
  const d = readData();
  d.schedule = req.body.schedule;
  writeData(d);
  res.json({ ok: true });
});

// ── PATCH checks ─────────────────────────────────────────────────────────
app.patch('/api/checks', (req, res) => {
  const d = readData();
  d.checks = req.body.checks;
  writeData(d);
  res.json({ ok: true });
});

// ── GET backup download ───────────────────────────────────────────────────
app.get('/api/backup', (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  const ts   = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`[Backup] data.json downloaded at ${ts}`);
  res.setHeader('Content-Disposition', `attachment; filename="housepoints-backup-${date}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(fs.readFileSync(DATA, 'utf8'));
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  console.log('');
  console.log(`🏠 HousePoints running — ${config.player1} vs ${config.player2}`);
  console.log('');
  console.log('Network interfaces:');
  let shareIP = null;
  for (const [name, addrs] of Object.entries(nets)) {
    for (const net of addrs) {
      if (net.family !== 'IPv4') continue;
      const label = net.internal ? '(loopback)' : '(WiFi/LAN)';
      console.log(`  ${name} ${label}:\t http://${net.address}:${PORT}`);
      if (!net.internal && !shareIP) shareIP = net.address;
    }
  }
  console.log('');
  if (shareIP) {
    console.log(`  Share with ${config.player2} → http://${shareIP}:${PORT}`);
  } else {
    console.log('  ⚠️  No external network interface found — is WiFi on?');
  }
  console.log('');
});

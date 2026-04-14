const express = require('express');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

const app      = express();
const PORT     = process.env.PORT || 3000;
const DATA     = path.join(__dirname, 'data.json');
const CONFIG   = path.join(__dirname, 'config.json');

// ── Load config ───────────────────────────────────────────────────────────
let config       = null;
let p1Key        = null;
let p2Key        = null;
let isConfigured = false;

function loadConfig() {
  if (!fs.existsSync(CONFIG)) return;
  config       = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  p1Key        = config.player1.toLowerCase();
  p2Key        = config.player2.toLowerCase();
  isConfigured = true;
}
loadConfig();

// ── Init data file if missing (only when configured) ─────────────────────
function maybeInitData() {
  if (!isConfigured) return;
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
}
maybeInitData();

function readData()   { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
function writeData(d) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

// ── Migrate: ensure streaks field exists ─────────────────────────────────
(function() {
  if (!isConfigured) return;
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

// ── POST setup (first-run wizard) ────────────────────────────────────────
app.post('/api/setup', (req, res) => {
  const { player1, player2, resetDay, stakes } = req.body;
  if (!player1 || !player2) return res.status(400).json({ error: 'player names required' });

  const cfg = {
    player1,
    player2,
    resetDay: Math.min(7, Math.max(1, parseInt(resetDay) || 1)),
    stakes: stakes || {
      low:  { winnerGets: 'Pick the show',         loserOwes: 'Buys a coffee' },
      mid:  { winnerGets: 'Chore-free morning',     loserOwes: 'Solo bedtime routine' },
      high: { winnerGets: 'Full lazy day',          loserOwes: 'Handles all chores for a day' }
    }
  };

  fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));

  const k1 = player1.toLowerCase();
  const k2 = player2.toLowerCase();
  fs.writeFileSync(DATA, JSON.stringify({
    entries:     [],
    schedule:    null,
    checks:      {},
    player1Name: player1,
    player2Name: player2,
    streaks:     { [k1]: 0, [k2]: 0 }
  }, null, 2));

  // Hot-reload config so server works immediately without restart
  loadConfig();
  maybeInitData();

  console.log(`✅  Setup complete — ${player1} vs ${player2}`);
  res.json({ ok: true });
});

// ── GET config ────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  if (!isConfigured) return res.json({ configured: false });
  res.json({ configured: true, ...config });
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
  const label = isConfigured ? `${config.player1} vs ${config.player2}` : 'setup required';
  console.log(`🏠 HousePoints running — ${label}`);
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
  if (shareIP && isConfigured) {
    console.log(`  Share with ${config.player2} → http://${shareIP}:${PORT}`);
  } else if (!shareIP) {
    console.log('  ⚠️  No external network interface found — is WiFi on?');
  }
  console.log('');
});

# HousePoints

A two-player chore tracker with weekly stakes. Log chores, earn points, keep score — the winner picks what they're owed.

Built for couples or roommates who want a lightweight, self-hosted scoreboard without subscriptions or apps.

---

## Features

- **Point-based chore logging** — quick-add chips (1, 2, or 3 pts) plus custom chore entries
- **Live scoreboard** — real-time point totals, animated progress bar, and weekly leader banner
- **Streak tracker** — consecutive weekly wins shown per player
- **Weekly summary** — point breakdown and stakes outcome at a glance
- **Chore schedule** — assign recurring chores by day with color-coded owner view
- **History log** — full filterable chore history with delete support
- **Rules tab** — stakes tiers, point values, and household agreement in one place
- **Backup** — one-click download of your full data as JSON
- **Mobile-first UI** — dark theme, bottom nav, designed for phone use
- **Two-device friendly** — runs on your local network; both players connect via browser

---

## Quick Start

```bash
git clone https://github.com/your-username/HousePoints.git
cd HousePoints
npm install
npm start
```

On first run, a setup wizard prompts you for:

- Player 1 and Player 2 names
- Week reset day (Monday–Sunday)
- Weekly stakes (3 tiers based on point gap: low / mid / high)

After setup, the server starts automatically at `http://localhost:3000`.

To share with your partner: open the URL printed in the terminal (e.g. `http://192.168.x.x:3000`) on their phone while both devices are on the same WiFi.

---

## Stakes

Stakes are set during setup and displayed in the Rules tab. Three tiers based on how wide the weekly point gap is:

| Gap | Default: Winner Gets | Default: Loser Owes |
|-----|----------------------|---------------------|
| 1–3 pts | Pick the show | Buys a coffee |
| 4–7 pts | Chore-free morning | Solo bedtime routine |
| 8+ pts | Full lazy day | Handles all chores for a day |

All stakes are fully customizable during setup.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run setup wizard (first time only), then start the server |
| `npm run setup` | Re-run the setup wizard and reset config + data |

---

## Data

| File | Description |
|------|-------------|
| `data.json` | Live chore entries, schedule, checks, and streaks |
| `config.json` | Player names, week reset day, and stakes |
| `data.template.json` | Schema reference for the data file |

Both `data.json` and `config.json` are gitignored — they stay local. Back up your data from the app's **Backup** tab or by copying `data.json` manually.

---

## Stack

- **Node.js + Express** — REST API with flat-file JSON persistence (no database)
- **Vanilla JS** — single-page app, no build step, no framework
- **Google Fonts** — Bebas Neue + DM Sans

---

## Self-Hosting Notes

- The server binds to `0.0.0.0:3000` so it's reachable from other devices on your network
- There is no authentication — intended for trusted local network use only
- To run on startup, use a process manager like `pm2` or a systemd service

---

## License

MIT

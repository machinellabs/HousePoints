# HousePoints

A two-player chore tracker with weekly stakes. Log chores, earn points, and keep score — the winner picks the stakes.

## Features

- **Point-based chore logging** — 1, 2, or 3-point quick-add chores plus custom entries
- **Live scoreboard** — real-time point totals, progress bar, and weekly leader banner
- **Streak tracker** — consecutive weekly wins displayed per player
- **Weekly summary** — points breakdown and stakes outcome at a glance
- **Chore schedule** — assign recurring chores by day with color-coded owner view
- **History log** — full filtered chore history with delete support
- **Rules tab** — stakes tiers, chore point values, and household agreement
- **Backup** — one-click download of your full data as JSON
- **Two-device friendly** — serve on your local network, both players use their phone

## Setup

```bash
git clone https://github.com/machinellabs/HousePoints.git
cd HousePoints
npm install
npm start
```

On first run, a setup wizard will prompt you for:

- Player 1 and Player 2 names
- Week reset day (Monday–Sunday)
- Weekly stakes (3 tiers: low / mid / high point gap)

After setup, the app launches automatically at `http://localhost:3000`.

To share with your partner, open the URL printed in the terminal (e.g. `http://192.168.x.x:3000`) on their device while both are on the same WiFi network.

## Re-running Setup

To reset names/stakes and start fresh:

```bash
npm run setup
```

> Note: this will overwrite `config.json` and `data.json`.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Run setup wizard (if needed), then start the server |
| `npm run setup` | Run the setup wizard only |

## Data

- `data.json` — live chore entries, schedule, checks, and streaks (gitignored)
- `config.json` — player names, reset day, and stakes (gitignored)
- `data.template.json` — schema reference for the data file

Both `data.json` and `config.json` are excluded from version control. Back up your data from the app's Backup tab or by copying `data.json` manually.

## Stack

- Node.js + Express (REST API, flat-file JSON persistence)
- Vanilla JS single-page app (no build step)
- Google Fonts: Bebas Neue + DM Sans

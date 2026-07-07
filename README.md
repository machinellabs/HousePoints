# HousePoints

[![CI](https://github.com/machinellabs/HousePoints/actions/workflows/ci.yml/badge.svg)](https://github.com/machinellabs/HousePoints/actions/workflows/ci.yml)

A two-player chore tracker with weekly stakes. Log chores, earn points, keep score, and let the weekly winner pick the reward.

Built for couples or roommates who want a lightweight, self-hosted scoreboard without subscriptions, accounts, or app-store friction.

## What this demonstrates

- **Practical product thinking** - turns a real household workflow into a focused app with setup, rules, history, and backup flows.
- **Full-stack fundamentals** - Express REST API, static single-page frontend, and flat-file JSON persistence.
- **Local-first design** - runs on a trusted home network and keeps personal household data on the machine running it.
- **Mobile-first UI** - designed around phone usage, quick entry, and repeat daily interactions.

## Features

- **Point-based chore logging** - quick-add chips for 1, 2, or 3 points plus custom chore entries
- **Live scoreboard** - real-time point totals, animated progress bar, and weekly leader banner
- **Streak tracker** - consecutive weekly wins shown per player
- **Weekly summary** - point breakdown and stakes outcome at a glance
- **Chore schedule** - assign recurring chores by day with color-coded owner view
- **History log** - full filterable chore history with delete support
- **Rules tab** - stakes tiers, point values, and household agreement in one place
- **Backup** - one-click download of full app data as JSON
- **Two-device friendly** - both players can connect through a browser on the same Wi-Fi network

## Quick start

```bash
git clone https://github.com/machinellabs/HousePoints.git
cd HousePoints
npm install
npm start
```

On first run, open `http://localhost:3000` and complete the browser setup wizard:

- Player 1 and Player 2 names
- Week reset day, Monday through Sunday
- Weekly stakes across low, mid, and high point gaps

To share with the second player, open the LAN URL printed in the terminal, such as `http://192.168.x.x:3000`, from another phone or computer on the same Wi-Fi network.

## Stakes

Stakes are set during setup and displayed in the Rules tab. Three tiers are based on the weekly point gap:

| Gap | Default winner reward | Default loser owes |
|-----|-----------------------|--------------------|
| 1-3 pts | Pick the show | Buys a coffee |
| 4-7 pts | Chore-free morning | Solo bedtime routine |
| 8+ pts | Full lazy day | Handles all chores for a day |

All stakes are customizable during setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the app server |
| `npm test` | Run JavaScript syntax checks for the server and setup script |

## Data

| File | Description |
|------|-------------|
| `data.json` | Live chore entries, schedule, checks, and streaks |
| `config.json` | Player names, week reset day, and stakes |
| `data.template.json` | Schema reference for the data file |

Both `data.json` and `config.json` are gitignored so private household data stays local. Backups can be downloaded from the app or made by copying `data.json`.

## Stack

- **Node.js + Express** - REST API with flat-file JSON persistence
- **Vanilla JavaScript** - single-page app with no build step
- **HTML/CSS** - responsive mobile-first interface
- **Google Fonts** - Bebas Neue + DM Sans

## Self-hosting notes

- The server binds to `0.0.0.0:3000` so it is reachable from other devices on your local network
- There is no authentication; this is intended for a trusted local network
- To run on startup, use a process manager such as `pm2` or a systemd service

## License

MIT

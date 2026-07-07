# HousePoints

[![CI](https://github.com/machinellabs/HousePoints/actions/workflows/ci.yml/badge.svg)](https://github.com/machinellabs/HousePoints/actions/workflows/ci.yml)

HousePoints is a small chore scoreboard for two people. Log chores, earn points, keep a weekly score, and let the winner pick the reward.

It is built for couples or roommates who want something self-hosted and simple instead of another subscription app.

## Features

- Quick chore logging with 1, 2, or 3 point presets
- Custom chore entries
- Live scoreboard with weekly totals
- Streak tracking across weeks
- Weekly summary with the current stakes outcome
- Recurring chore schedule by day
- Filterable chore history with delete support
- Rules tab for point values and weekly stakes
- JSON backup download
- Local network sharing for two devices on the same Wi-Fi

## Quick start

```bash
git clone https://github.com/machinellabs/HousePoints.git
cd HousePoints
npm install
npm start
```

Open `http://localhost:3000` and complete the setup wizard:

- Player names
- Week reset day
- Low, mid, and high stakes for each point gap

To use it from another phone or computer, open the LAN URL printed in the terminal, such as `http://192.168.x.x:3000`, while both devices are on the same Wi-Fi network.

## Stakes

Stakes are set during setup and shown in the Rules tab.

| Gap | Default winner reward | Default loser owes |
|-----|-----------------------|--------------------|
| 1-3 pts | Pick the show | Buys a coffee |
| 4-7 pts | Chore-free morning | Solo bedtime routine |
| 8+ pts | Full lazy day | Handles all chores for a day |

All stakes can be changed during setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the app server |
| `npm test` | Run JavaScript syntax checks for the server and setup script |

## Data

| File | Description |
|------|-------------|
| `data.json` | Chore entries, schedule, checks, and streaks |
| `config.json` | Player names, week reset day, and stakes |
| `data.template.json` | Schema reference for the data file |

`data.json` and `config.json` are gitignored so household data stays local. You can back up data from the app or by copying `data.json`.

## Stack

- Node.js
- Express
- Vanilla JavaScript
- HTML/CSS
- Flat-file JSON storage

## Notes

- The server binds to `0.0.0.0:3000` so other local devices can reach it.
- There is no authentication. Use it only on a trusted local network.
- For startup on boot, run it with a process manager such as `pm2` or systemd.

## License

MIT

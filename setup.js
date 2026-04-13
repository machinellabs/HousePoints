const readline = require('readline');
const fs       = require('fs');
const path     = require('path');

const CONFIG = path.join(__dirname, 'config.json');
const DATA   = path.join(__dirname, 'data.json');

// If config already exists, setup is already done — skip
if (fs.existsSync(CONFIG)) process.exit(0);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\nWelcome to HousePoints! Let\'s get you set up.\n');

  const p1 = (await ask('Player 1 name: ')).trim() || 'Player 1';
  const p2 = (await ask('Player 2 name: ')).trim() || 'Player 2';

  const resetRaw = (await ask('What day should the week reset? (1=Monday, 7=Sunday, default: 1): ')).trim();
  const resetDay = Math.min(7, Math.max(1, parseInt(resetRaw) || 1));

  // Default stakes
  const stakes = {
    low:  { winnerGets: 'Pick the show',         loserOwes: 'Buys a coffee' },
    mid:  { winnerGets: 'Chore-free morning',     loserOwes: 'Solo bedtime routine' },
    high: { winnerGets: 'Full lazy day',          loserOwes: 'Handles all chores for a day' }
  };

  const customStakes = (await ask('Do you want to customize the weekly stakes? (y/n): ')).trim().toLowerCase();
  if (customStakes === 'y') {
    stakes.low.winnerGets  = (await ask('1-3pt gap — winner gets: ')).trim() || stakes.low.winnerGets;
    stakes.low.loserOwes   = (await ask('1-3pt gap — loser owes: ')).trim()  || stakes.low.loserOwes;
    stakes.mid.winnerGets  = (await ask('4-7pt gap — winner gets: ')).trim() || stakes.mid.winnerGets;
    stakes.mid.loserOwes   = (await ask('4-7pt gap — loser owes: ')).trim()  || stakes.mid.loserOwes;
    stakes.high.winnerGets = (await ask('8+pt gap — winner gets: ')).trim()  || stakes.high.winnerGets;
    stakes.high.loserOwes  = (await ask('8+pt gap — loser owes: ')).trim()   || stakes.high.loserOwes;
  }

  const customChores = (await ask('Do you want to customize the chore list? (y/n): ')).trim().toLowerCase();
  if (customChores === 'y') {
    console.log('You can edit the QUICK array in public/index.html after setup. We\'ll use the defaults for now.');
  }

  rl.close();

  const p1Key = p1.toLowerCase();
  const p2Key = p2.toLowerCase();

  fs.writeFileSync(CONFIG, JSON.stringify({ player1: p1, player2: p2, resetDay, stakes }, null, 2));

  fs.writeFileSync(DATA, JSON.stringify({
    entries:     [],
    schedule:    null,
    checks:      {},
    player1Name: p1,
    player2Name: p2,
    streaks:     { [p1Key]: 0, [p2Key]: 0 }
  }, null, 2));

  console.log('\n✅ Setup complete! Launching HousePoints...\n');
}

main().catch(err => { console.error('Setup failed:', err); process.exit(1); });

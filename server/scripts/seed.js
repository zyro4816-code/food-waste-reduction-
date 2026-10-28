// server/scripts/seed.js
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

async function runSeed() {
  console.log('[Seed] Re-initializing seed data...');
  const seedFile = path.join(__dirname, '../../database/seed.sql');

  if (db.getDriver() === 'mysql') {
    if (fs.existsSync(seedFile)) {
      const sql = fs.readFileSync(seedFile, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('USE'));

      for (const statement of statements) {
        try {
          await db.execute(statement);
        } catch (err) {
          console.warn('[Seed Warning]', err.message);
        }
      }
      console.log('[Seed] MySQL seed script executed.');
    }
  } else {
    console.log('[Seed] SQLite database is auto-seeded by sqlite-init.');
  }
}

runSeed().then(() => {
  console.log('[Seed] Done.');
  process.exit(0);
}).catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});


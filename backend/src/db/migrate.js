const fs = require('fs');
const path = require('path');
const pool = require('./index');

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Database schema created successfully!');
    console.log('✅ Seed users created:');
    console.log('   Admin:  admin@fixflow.com  / Admin@FixFlow#2026');
    console.log('   Staff:  staff@fixflow.com  / Staff@FixFlow#2026');
    console.log('   User:   user@fixflow.com   / User@FixFlow#2026');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();

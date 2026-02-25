const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        console.log('--- Inspecting ORGANIZATION table structure ---');
        const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ORGANIZATION'
    `);
        console.table(cols.rows);

        console.log('\n--- Inspecting ORGANIZATION table data ---');
        const data = await pool.query('SELECT * FROM "ORGANIZATION" LIMIT 10');
        console.table(data.rows);

    } catch (err) {
        console.error('Database inspection failed:', err);
    } finally {
        await pool.end();
    }
}

main();

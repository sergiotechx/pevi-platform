const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const data = await pool.query('SELECT activity_id, milestone_id, activity_status, evidence_status FROM "ACTIVITY" ORDER BY activity_id DESC LIMIT 5');
        console.log(JSON.stringify(data.rows, null, 2));
    } catch (err) {
        console.error('Database inspection failed:', err);
    } finally {
        await pool.end();
    }
}

main();

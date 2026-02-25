const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        console.log('--- Checking for plataforma@pevi.com ---');
        const userRes = await pool.query('SELECT * FROM "USER" WHERE email = $1', ['plataforma@pevi.com']);

        let verifierId;
        if (userRes.rows.length === 0) {
            console.log('User not found. Creating plataforma@pevi.com...');
            const hashedPassword = await bcrypt.hash('pevi123', 10);
            const insertUser = await pool.query(
                'INSERT INTO "USER" ("fullName", email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
                ['Plataforma PEVI', 'plataforma@pevi.com', hashedPassword, 'verifier', 'active']
            );
            verifierId = insertUser.rows[0].user_id;
            console.log('Created user with ID:', verifierId);
        } else {
            verifierId = userRes.rows[0].user_id;
            console.log('User found with ID:', verifierId);
        }

        console.log('\n--- Linking to all existing organizations ---');
        const orgs = await pool.query('SELECT org_id FROM "ORGANIZATION"');

        for (const org of orgs.rows) {
            const checkStaff = await pool.query(
                'SELECT * FROM "ORGANIZATION_STAFF" WHERE org_id = $1 AND user_id = $2',
                [org.org_id, verifierId]
            );

            if (checkStaff.rows.length === 0) {
                await pool.query(
                    'INSERT INTO "ORGANIZATION_STAFF" (org_id, user_id) VALUES ($1, $2)',
                    [org.org_id, verifierId]
                );
                console.log(`Linked to Org ID: ${org.org_id}`);
            } else {
                console.log(`Already linked to Org ID: ${org.org_id}`);
            }
        }

        console.log('\n--- DONE ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

main();

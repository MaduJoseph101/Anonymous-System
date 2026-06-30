const { Client } = require('pg');

async function migrateMessages() {
  console.log('Connecting to databases...');
  
  const local = new Client({
    connectionString: 'postgresql://postgres:Madu%20Joseph@localhost:5432/asirs_db'
  });
  
  const remote = new Client({
    connectionString: 'postgresql://anonymous_db_geum_user:ess81c6fUGIaxZEtscrwCtKnWHnYh11k@dpg-d91t5glaeets73855sag-a.ohio-postgres.render.com/anonymous_db_geum',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await local.connect();
    await remote.connect();

    console.log('Fetching local messages...');
    const localMsgsRes = await local.query('SELECT * FROM "Message"');
    console.log(`Found ${localMsgsRes.rowCount} messages locally.`);

    if (localMsgsRes.rowCount === 0) return;

    console.log('Migrating Messages...');
    let count = 0;
    for (const msg of localMsgsRes.rows) {
      await remote.query(
        `INSERT INTO "Message" (id, report_id, sender_type, content, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [msg.id, msg.report_id, msg.sender_type, msg.content, msg.is_read, msg.created_at]
      );
      count++;
    }

    console.log(`Successfully migrated ${count} messages!`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await local.end();
    await remote.end();
  }
}

migrateMessages();

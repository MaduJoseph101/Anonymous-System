const { Client } = require('pg');

async function migrate() {
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

    // Ensure remote schema matches local schema by running a simple sync if needed.
    // However, Prisma db push on Render should have done this. 
    // Let's just dynamically copy data row by row.

    const tables = ['RTCRegistry', 'Report', 'SimilarityCluster'];

    for (const table of tables) {
      console.log(`Fetching local data for ${table}...`);
      const { rows } = await local.query(`SELECT * FROM "${table}"`);
      console.log(`Found ${rows.length} rows in ${table}.`);

      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const colNames = columns.map(c => `"${c}"`).join(', ');
      
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

      for (const row of rows) {
        const values = columns.map(c => row[c]);
        try {
            await remote.query(query, values);
        } catch (e) {
            console.error(`Error inserting into ${table}:`, e.message);
        }
      }
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await local.end();
    await remote.end();
  }
}

migrate();

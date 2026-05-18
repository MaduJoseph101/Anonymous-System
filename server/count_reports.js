require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$connect();
    const count = await prisma.report.count();
    console.log(`DATABASE REPORT COUNT: ${count}`);
    
    if (count > 0) {
      const reports = await prisma.report.findMany({
        take: 5,
        select: {
          id: true,
          category: true,
          status: true,
          created_at: true
        }
      });
      console.log('Sample reports:');
      console.log(JSON.stringify(reports, null, 2));
    }
  } catch (error) {
    console.error('Error querying reports count:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

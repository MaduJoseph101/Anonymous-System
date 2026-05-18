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
    console.log('Connected to the database successfully!');
    
    // Check if there are any AdminUsers
    const admins = await prisma.adminUser.findMany();
    console.log(`Found ${admins.length} admin user(s) in the database:`);
    admins.forEach(admin => {
      console.log(`- ${admin.email} (Active: ${admin.is_active})`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

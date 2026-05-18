/**
 * Singleton Prisma Client
 *
 * IMPORTANT: This is the ONLY place in the entire server where a PrismaClient
 * and pg Pool should be instantiated. Importing this module across multiple
 * files reuses the same connection pool, preventing PostgreSQL connection
 * exhaustion.
 *
 * DO NOT create new PrismaClient() / new Pool() anywhere else.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;

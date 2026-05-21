const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.report.findMany({ select: { id: true, ai_analysis_status: true } });
  console.log(reports);
}

main().catch(console.error).finally(() => prisma.$disconnect());

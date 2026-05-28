const prisma = require('./src/lib/prisma.js');
async function main() {
  const rep = await prisma.report.findFirst({where: {ai_assessment_json: {not: null}}});
  if(rep) console.log("AI:", rep.ai_assessment_json);
  const rep2 = await prisma.report.findFirst({where: {statistical_flags_json: {not: null}}});
  if(rep2) console.log("Stat:", rep2.statistical_flags_json);
  const rep3 = await prisma.report.findFirst({where: {similarity_flags_json: {not: null}}});
  if(rep3) console.log("Sim:", rep3.similarity_flags_json);
  const logs = await prisma.auditLog.findMany({take: 5});
  console.log("Logs:", logs);
}
main().catch(console.error).finally(()=>prisma.$disconnect());

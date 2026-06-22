const prisma = require('./src/lib/prisma.js');
async function main() {
  const countAI = await prisma.report.count({where: {ai_assessment_json: {not: null}}});
  const countStat = await prisma.report.count({where: {statistical_flags_json: {not: null}}});
  console.log({countAI, countStat});
  const sampleAI = await prisma.report.findFirst({where: {ai_assessment_json: {not: null}}, select: {ai_assessment_json: true}});
  console.log('Sample AI:', sampleAI?.ai_assessment_json);
  const sampleStat = await prisma.report.findFirst({where: {statistical_flags_json: {not: null}}, select: {statistical_flags_json: true}});
  console.log('Sample Stat:', sampleStat?.statistical_flags_json);
}
main().catch(console.error).finally(()=>prisma.$disconnect());

require('dotenv').config();
const GeminiAssessmentService = require('./src/services/GeminiAssessmentService');

async function run() {
  const model = GeminiAssessmentService.getModel();
  const result = await model.generateContent(GeminiAssessmentService.buildPrompt({
    category: 'BULLYING',
    description: 'I saw someone being bullied at the cafeteria yesterday at noon. The person was tall and wearing a red shirt.',
    created_at: new Date()
  }));
  const text = result.response.text();
  console.log("=== RAW GEMINI TEXT ===");
  console.log(text);
  console.log("=======================");
}

run().catch(console.error);

const GeminiAssessmentService = require('./GeminiAssessmentService');

const titleCase = (value) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const cleanLabel = (value) => {
  if (!value) return '';
  return value
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

class HotspotExtractionService {
  static cache = new Map();

  static getFallbackLabel(report) {
    const candidates = [
      report.location,
      report.location_description,
      report.reporter_context
    ]
      .map(cleanLabel)
      .filter(Boolean);

    if (candidates.length === 0) return null;

    return titleCase(candidates[0]);
  }

  static buildPrompt(report) {
    return `
You extract one concise campus location label from an anonymous report.
Use only the text provided. Do not judge truth or propose action.

Return ONLY valid JSON with no markdown or extra text:
{
  "label": "<short place name or null>",
  "confidence": "<HIGH|MEDIUM|LOW>"
}

Rules:
- Prefer the specific place name mentioned or clearly implied.
- Remove directional language such as near, by, outside, around, at, inside, in front of.
- Normalize variants to one place label, for example "new male hostel" -> "New Male Hostel".
- Keep the label short and human-readable.
- If no place can be determined, return null for the label.

Report text:
Location: ${report.location || 'Not specified'}
Location detail: ${report.location_description || 'Not specified'}
Reporter context: ${report.reporter_context || 'Not specified'}
Description: ${report.description || 'Not specified'}
    `.trim();
  }

  static parseResponse(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  static async extractLabel(report) {
    const sourceKey = [
      report.location,
      report.location_description,
      report.reporter_context,
      report.description
    ]
      .map((value) => cleanLabel(value || '').toLowerCase())
      .filter(Boolean)
      .join(' | ');

    if (!sourceKey) return null;

    if (this.cache.has(sourceKey)) {
      return this.cache.get(sourceKey);
    }

    if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
      const fallback = this.getFallbackLabel(report);
      this.cache.set(sourceKey, fallback);
      return fallback;
    }

    try {
      const model = GeminiAssessmentService.getModel();
      const result = await model.generateContent(this.buildPrompt(report));
      const responseText = result.response.text();
      const parsed = this.parseResponse(responseText);
      const rawLabel = cleanLabel(parsed?.label);
      const label = rawLabel ? titleCase(rawLabel) : this.getFallbackLabel(report);

      this.cache.set(sourceKey, label);
      return label;
    } catch (error) {
      console.error('Hotspot extraction error:', error.message);
      const fallback = this.getFallbackLabel(report);
      this.cache.set(sourceKey, fallback);
      return fallback;
    }
  }
}

module.exports = HotspotExtractionService;

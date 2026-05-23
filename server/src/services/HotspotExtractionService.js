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
  static clusterCache = new Map();

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

  static getSourceKey(report) {
    return [
      report.location,
      report.location_description,
      report.reporter_context,
      report.description
    ]
      .map((value) => cleanLabel(value || '').toLowerCase())
      .filter(Boolean)
      .join(' | ');
  }

  static async extractLabel(report) {
    const sourceKey = this.getSourceKey(report);

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

  static async extractLabelsBatch(reports) {
    if (!reports || reports.length === 0) return [];

    const results = [];
    const uncachedReports = [];
    const uncachedIndices = [];

    // 1. Check cache for each report
    reports.forEach((report, index) => {
      const sourceKey = this.getSourceKey(report);
      if (!sourceKey) {
        results[index] = null;
      } else if (this.cache.has(sourceKey)) {
        results[index] = this.cache.get(sourceKey);
      } else if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
        const fallback = this.getFallbackLabel(report);
        this.cache.set(sourceKey, fallback);
        results[index] = fallback;
      } else {
        uncachedReports.push(report);
        uncachedIndices.push(index);
      }
    });

    if (uncachedReports.length === 0) {
      return results;
    }

    // 2. Batch prompt
    const prompt = `
You extract concise campus location labels from an array of anonymous reports.
Use only the text provided. Do not judge truth or propose action.

Return ONLY a valid JSON array of strings containing the extracted short place name for each report in the EXACT order they were provided.
If no place can be determined for a specific report, return null for that array element.
Do not include markdown or preamble. 

Rules for each extraction:
- Prefer the specific place name mentioned or clearly implied.
- Remove directional language such as near, by, outside, around, at, inside, in front of.
- Normalize variants to one place label, for example "new male hostel" -> "New Male Hostel".
- Keep the label short and human-readable.

Reports to process:
${JSON.stringify(uncachedReports.map(r => ({
  location: r.location || 'Not specified',
  detail: r.location_description || 'Not specified',
  context: r.reporter_context || 'Not specified',
  description: r.description || 'Not specified'
})), null, 2)}
    `.trim();

    try {
      const model = GeminiAssessmentService.getModel();
      const apiResult = await model.generateContent(prompt);
      const responseText = apiResult.response.text();
      const parsedArray = this.parseResponse(responseText);

      if (Array.isArray(parsedArray) && parsedArray.length === uncachedReports.length) {
        uncachedReports.forEach((report, i) => {
          const rawLabel = cleanLabel(parsedArray[i]);
          const label = rawLabel ? titleCase(rawLabel) : this.getFallbackLabel(report);
          const sourceKey = this.getSourceKey(report);
          this.cache.set(sourceKey, label);
          results[uncachedIndices[i]] = label;
        });
      } else {
        throw new Error('AI returned invalid array length or non-array');
      }
    } catch (error) {
      console.error('Hotspot batch extraction error:', error.message);
      // Fallback
      uncachedReports.forEach((report, i) => {
        const fallback = this.getFallbackLabel(report);
        const sourceKey = this.getSourceKey(report);
        this.cache.set(sourceKey, fallback);
        results[uncachedIndices[i]] = fallback;
      });
    }

    return results;
  }

  static async clusterLabels(labels) {
    if (!labels || labels.length === 0) return {};
    
    // Default fallback is 1:1 mapping
    const fallbackMap = {};
    labels.forEach(l => fallbackMap[l] = l);

    // Create a deterministic cache key from the unique sorted labels
    const cacheKey = labels.slice().sort().join('|');

    if (this.clusterCache.has(cacheKey)) {
      return this.clusterCache.get(cacheKey);
    }

    if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
      return fallbackMap;
    }

    const prompt = `
You are given a list of location names extracted from incident reports on a campus.
Your task is to group synonymous or very similar locations together under a single canonical name.
For example, "School Field" and "In The School's Field" should both map to "School Field".
"Main Lib" and "Library" should both map to "Library".

Return ONLY a valid JSON object mapping the original location name to the canonical name. No markdown, no code blocks, no preamble.
Example:
{
  "School Field": "School Field",
  "In The School's Field": "School Field"
}

Locations to group:
${JSON.stringify(labels, null, 2)}
    `.trim();

    try {
      const model = GeminiAssessmentService.getModel();
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = this.parseResponse(responseText);

      // Validate the parsed object is a dictionary of strings to strings
      if (parsed && typeof parsed === 'object') {
         // Merge with fallback to ensure all labels are represented
         const finalMap = { ...fallbackMap, ...parsed };
         this.clusterCache.set(cacheKey, finalMap);
         return finalMap;
      }
      return fallbackMap;
    } catch (error) {
      console.error('Hotspot clustering error:', error.message);
      return fallbackMap;
    }
  }

  static pruneCache(resolvedReports) {
    const activeKeys = new Set(resolvedReports.map(report => this.getSourceKey(report)).filter(Boolean));

    for (const key of this.cache.keys()) {
      if (!activeKeys.has(key)) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = HotspotExtractionService;

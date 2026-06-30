const fs = require('fs');
const path = require('path');
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
  static cachePath = path.join(__dirname, '../../data/hotspot_cache.json');
  static cacheLoaded = false;

  static loadCache() {
    if (this.cacheLoaded) return;
    try {
      if (fs.existsSync(this.cachePath)) {
        const data = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
        this.cache = new Map(Object.entries(data.labels || {}));
        this.clusterCache = new Map(Object.entries(data.clusters || {}));
      }
    } catch (e) {
      console.error('Failed to load hotspot cache:', e.message);
    }
    this.cacheLoaded = true;
  }

  static saveCache() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.cachePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const data = {
        labels: Object.fromEntries(this.cache),
        clusters: Object.fromEntries(this.clusterCache)
      };
      fs.writeFileSync(this.cachePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to save hotspot cache:', e.message);
    }
  }

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
    this.loadCache();
    const sourceKey = this.getSourceKey(report);

    if (!sourceKey) return null;

    if (this.cache.has(sourceKey)) {
      return this.cache.get(sourceKey);
    }

    if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
      const fallback = this.getFallbackLabel(report);
      this.cache.set(sourceKey, fallback);
      this.saveCache();
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
      this.saveCache();
      return label;
    } catch (error) {
      console.error('Hotspot extraction error:', error.message);
      const fallback = this.getFallbackLabel(report);
      this.cache.set(sourceKey, fallback);
      this.saveCache();
      return fallback;
    }
  }

  static async extractLabelsBatch(reports) {
    if (!reports || reports.length === 0) return [];
    this.loadCache();

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
      // Save cache if any mock AI labels were set
      if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) this.saveCache();
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

    this.saveCache();
    return results;
  }

  static async clusterLabels(labels) {
    if (!labels || labels.length === 0) return {};
    this.loadCache();
    
    const result = {};
    const unclustered = [];

    // Map any labels already in our cache
    labels.forEach(l => {
      if (this.clusterCache.has(l)) {
        result[l] = this.clusterCache.get(l);
      } else {
        unclustered.push(l);
      }
    });

    if (unclustered.length === 0) {
      return result;
    }

    if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
      unclustered.forEach(l => {
        result[l] = l;
        this.clusterCache.set(l, l);
      });
      this.saveCache();
      return result;
    }

    const existingCanonical = Array.from(new Set(this.clusterCache.values()));

    const prompt = `
You are given a list of NEW location names extracted from incident reports on a campus.
Your task is to group synonymous or very similar locations together under a single canonical name.
You MUST map a new location to one of the EXISTING canonical names if it's a match, or invent a new canonical name if it's a distinct place.

Return ONLY a valid JSON object mapping the NEW location names to their canonical name. No markdown, no code blocks, no preamble.
Example:
{
  "School Field": "School Field",
  "In The School's Field": "School Field"
}

EXISTING canonical names (use these if they fit):
${JSON.stringify(existingCanonical, null, 2)}

NEW Locations to map:
${JSON.stringify(unclustered, null, 2)}
    `.trim();

    try {
      const model = GeminiAssessmentService.getModel();
      const apiRes = await model.generateContent(prompt);
      const responseText = apiRes.response.text();
      const parsed = this.parseResponse(responseText);

      if (parsed && typeof parsed === 'object') {
         unclustered.forEach(l => {
            const canonical = parsed[l] || l;
            result[l] = canonical;
            this.clusterCache.set(l, canonical);
         });
         this.saveCache();
         return result;
      }
    } catch (error) {
      console.error('Hotspot clustering error:', error.message);
    }

    // Fallback if AI fails or returns invalid JSON
    unclustered.forEach(l => {
      result[l] = l;
      this.clusterCache.set(l, l);
    });
    this.saveCache();
    return result;
  }

  static pruneCache(resolvedReports) {
    // Only keeping this method so it doesn't break analytics.js if called
    // Since we now use a persistent cache, pruning everything we don't currently have active
    // would mean throwing away AI clusters that we paid for and might need again if similar reports occur!
    // So we make pruneCache a no-op to preserve our precious cache permanently.
  }
}

module.exports = HotspotExtractionService;

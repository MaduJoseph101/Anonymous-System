const fs = require('fs');
const sharp = require('sharp');
const exifr = require('exifr');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Strips metadata from images and videos securely.
 * Extracts metadata for AI credibility assessment.
 */
class MetadataHelper {

  /**
   * Scans text values for typical AI generator signatures
   */
  static detectAISignatures(text) {
    if (!text || typeof text !== 'string') return [];
    
    const aiKeywords = [
      'stable diffusion', 'midjourney', 'dall-e', 'dall·e',
      'adobe firefly', 'bing image creator', 'leonardo.ai',
      'artificial intelligence', 'ai generated', 'generative ai'
    ];
    
    const textLower = text.toLowerCase();
    const foundKeywords = [];
    
    for (const kw of aiKeywords) {
      if (textLower.includes(kw)) {
        foundKeywords.push(kw);
      }
    }
    
    return foundKeywords;
  }

  /**
   * Main scrub function: scrubs metadata from the file on disk and returns findings.
   */
  static async processAndScrubFile(filePath, mimeType) {
    try {
      if (!fs.existsSync(filePath)) return [];
      
      let findings = [];
      
      // 1. Extract comprehensive metadata using exifr (supports images & some videos)
      try {
        const extractedMeta = await exifr.parse(filePath, {
          xmp: true, tiff: true, ifd0: true, exif: true, gps: true, ipTC: true
        });
        
        if (extractedMeta) {
           const metaString = JSON.stringify(extractedMeta);
           findings = this.detectAISignatures(metaString);
        }
      } catch (parseError) {
        console.warn('[MetadataHelper] Exifr parsing failed (file may have no standard metadata):', parseError.message);
      }
      
      // 2. Scrub the file
      if (mimeType.startsWith('image/')) {
        // Use sharp to strip all metadata
        const buffer = fs.readFileSync(filePath);
        const scrubbedBuffer = await sharp(buffer)
          .withMetadata(false)
          .toBuffer();
        
        fs.writeFileSync(filePath, scrubbedBuffer);
        console.log(`[MetadataHelper] Processed & scrubbed image: ${filePath}`);
        
      } else if (mimeType.startsWith('video/')) {
        // Use fluent-ffmpeg to map streams without metadata
        const tempPath = `${filePath}.tmp.mp4`;
        
        await new Promise((resolve, reject) => {
          ffmpeg(filePath)
            .outputOptions([
              '-map_metadata', '-1', // Strip metadata
              '-c:v', 'copy',        // Copy video stream
              '-c:a', 'copy'         // Copy audio stream
            ])
            .save(tempPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });
        
        // Replace original with scrubbed video
        fs.renameSync(tempPath, filePath);
        console.log(`[MetadataHelper] Processed & scrubbed video: ${filePath}`);
      }
      
      return findings;
    } catch (e) {
      console.error('[MetadataHelper] Error processing file:', e.message);
      return [];
    }
  }
}

module.exports = MetadataHelper;

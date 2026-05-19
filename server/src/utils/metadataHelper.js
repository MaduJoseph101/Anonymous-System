const fs = require('fs');

/**
 * Strips metadata (EXIF/GPS/Text chunks) from JPEGs and PNGs
 * and checks for signature software markers that suggest AI generation.
 */
class MetadataHelper {

  /**
   * Scans a buffer or string for typical AI generator signatures
   */
  static detectAISignatures(text) {
    const aiKeywords = [
      'stable diffusion',
      'midjourney',
      'dall-e',
      'dall·e',
      'adobe firefly',
      'bing image creator',
      'leonardo.ai',
      'artificial intelligence',
      'ai generated',
      'generative ai'
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
   * Parses JPEG APP1 segment to find software markers before stripping
   */
  static extractJpegMetadata(buffer) {
    const findings = [];
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return findings;
    
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) break;
      
      const marker = buffer[offset + 1];
      if (marker === 0xD9) break; // EOI
      
      if (marker >= 0xD0 && marker <= 0xD7) {
        offset += 2;
        continue;
      }
      
      if (offset + 3 >= buffer.length) break;
      const length = buffer.readUInt16BE(offset + 2);
      
      // Look into APP1 (EXIF / XMP metadata)
      if (marker === 0xE1 && offset + 4 + length <= buffer.length) {
        const app1Segment = buffer.subarray(offset + 4, offset + 2 + length);
        const asciiStr = app1Segment.toString('ascii').replace(/[^\x20-\x7E]/g, ' ');
        const detected = this.detectAISignatures(asciiStr);
        if (detected.length > 0) {
          findings.push(...detected);
        }
      }
      
      offset += 2 + length;
    }
    return [...new Set(findings)];
  }

  /**
   * Parses PNG text and EXIF chunks to find software markers before stripping
   */
  static extractPngMetadata(buffer) {
    const findings = [];
    const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < 8; i++) {
      if (buffer[i] !== pngSig[i]) return findings;
    }
    
    let offset = 8;
    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) break;
      
      const length = buffer.readUInt32BE(offset);
      const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
      const totalChunkLength = 12 + length;
      
      if (offset + totalChunkLength > buffer.length) break;
      
      // Check metadata text or EXIF chunks
      if (['tEXt', 'zTXt', 'iTXt', 'eXIf'].includes(type)) {
        const dataSegment = buffer.subarray(offset + 8, offset + 8 + length);
        const asciiStr = dataSegment.toString('utf8').replace(/[^\x20-\x7E]/g, ' ');
        const detected = this.detectAISignatures(asciiStr);
        if (detected.length > 0) {
          findings.push(...detected);
        }
      }
      
      offset += totalChunkLength;
    }
    return [...new Set(findings)];
  }

  /**
   * Entrypoint to inspect a file buffer and extract AI metadata markers
   */
  static inspectMediaMetadata(buffer, mimeType) {
    try {
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return this.extractJpegMetadata(buffer);
      }
      if (mimeType === 'image/png') {
        return this.extractPngMetadata(buffer);
      }
    } catch (e) {
      console.error('[MetadataHelper] Inspection failed:', e.message);
    }
    return [];
  }

  /**
   * Entrypoint to scrub metadata (EXIF, tags, GPS, etc.) from an image buffer
   */
  static scrubJpegMetadata(buffer) {
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return buffer;
    
    const resultChunks = [Buffer.from([0xFF, 0xD8])];
    let offset = 2;
    
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) {
        resultChunks.push(buffer.subarray(offset));
        break;
      }
      
      const marker = buffer[offset + 1];
      if (marker === 0xD9) {
        resultChunks.push(Buffer.from([0xFF, 0xD9]));
        break;
      }
      
      if (marker >= 0xD0 && marker <= 0xD7) {
        resultChunks.push(Buffer.from([0xFF, marker]));
        offset += 2;
        continue;
      }
      
      if (offset + 3 >= buffer.length) {
        resultChunks.push(buffer.subarray(offset));
        break;
      }
      
      const length = buffer.readUInt16BE(offset + 2);
      
      // Strip APP1 (EXIF, GPS, XMP), APP2 (profiles - often contain metadata), APP13 (Photoshop metadata)
      const isMetadataMarker = (marker === 0xE1 || marker === 0xE2 || marker === 0xED);
      
      if (isMetadataMarker && offset + 2 + length <= buffer.length) {
        offset += 2 + length;
      } else {
        const clampLength = Math.min(buffer.length - offset, 2 + length);
        resultChunks.push(buffer.subarray(offset, offset + clampLength));
        offset += clampLength;
      }
    }
    
    return Buffer.concat(resultChunks);
  }

  static scrubPngMetadata(buffer) {
    const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < 8; i++) {
      if (buffer[i] !== pngSig[i]) return buffer;
    }
    
    const resultChunks = [buffer.subarray(0, 8)];
    let offset = 8;
    
    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) {
        resultChunks.push(buffer.subarray(offset));
        break;
      }
      
      const length = buffer.readUInt32BE(offset);
      const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
      const totalChunkLength = 12 + length;
      
      if (offset + totalChunkLength > buffer.length) {
        resultChunks.push(buffer.subarray(offset));
        break;
      }
      
      // Keep only chunks necessary for rendering (IHDR, PLTE, IDAT, IEND, tRNS)
      const isMetadata = ['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME'].includes(type);
      
      if (isMetadata) {
        offset += totalChunkLength;
      } else {
        resultChunks.push(buffer.subarray(offset, offset + totalChunkLength));
        offset += totalChunkLength;
      }
    }
    
    return Buffer.concat(resultChunks);
  }

  /**
   * Main scrub function: scrubs metadata from the file on disk and returns AI markers found.
   */
  static processAndScrubFile(filePath, mimeType) {
    try {
      if (!fs.existsSync(filePath)) return [];
      
      const buffer = fs.readFileSync(filePath);
      const findings = this.inspectMediaMetadata(buffer, mimeType);
      
      let scrubbedBuffer = buffer;
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        scrubbedBuffer = this.scrubJpegMetadata(buffer);
      } else if (mimeType === 'image/png') {
        scrubbedBuffer = this.scrubPngMetadata(buffer);
      }
      
      // Save scrubbed file back to disk
      fs.writeFileSync(filePath, scrubbedBuffer);
      console.log(`[MetadataHelper] Processed & scrubbed media: ${filePath}. Findings:`, findings);
      
      return findings;
    } catch (e) {
      console.error('[MetadataHelper] Error processing file:', e.message);
      return [];
    }
  }
}

module.exports = MetadataHelper;

/**
 * Media Service Abstraction (Phase 9)
 *
 * Dedicated to handling external media URLs cleanly and securely.
 * Requirements:
 * - Validate media URL
 * - Resolve media type (image, audio, video, document, webpage)
 * - Return safe display URL
 * - Handle unavailable/invalid links
 * - Open external links safely with rel="noopener noreferrer"
 * - Supports legacy base64 image inspection without embedding new ones
 */
export class MediaService {
  /**
   * Validates if a string is a valid web URL (http: or https:)
   * @param {string} value
   * @returns {string} Sanitized URL or empty string
   */
  static validateWebUrl(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      const u = new URL(value.trim());
      return ['https:', 'http:'].includes(u.protocol) ? u.href : '';
    } catch {
      return '';
    }
  }

  /**
   * Validates if a string is a safe image URL (web URL or valid legacy base64)
   * @param {string} value
   * @returns {string} Valid URL or empty string
   */
  static validateImageUrl(value) {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    // Allow legacy base64 images for backward compatibility
    if (/^data:image\/(png|jpeg|webp|jpg);base64,[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
      return trimmed;
    }
    // Web URL
    return this.validateWebUrl(trimmed);
  }

  /**
   * Checks whether a value is a base64 data URL
   * @param {string} value
   * @returns {boolean}
   */
  static isBase64(value) {
    if (!value || typeof value !== 'string') return false;
    return /^data:image\/[a-zA-Z]+;base64,/.test(value.trim());
  }

  /**
   * Resolves media type from a URL
   * @param {string} url
   * @returns {'image'|'audio'|'video'|'document'|'webpage'}
   */
  static resolveMediaType(url) {
    if (!url) return 'webpage';
    if (this.isBase64(url)) return 'image';

    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    if (/\.(png|jpe?g|webp|gif|svg|avif)$/.test(clean)) return 'image';
    if (/\.(mp3|wav|ogg|m4a|aac)$/.test(clean)) return 'audio';
    if (/\.(mp4|webm|mov|mkv)$/.test(clean)) return 'video';
    if (/\.(pdf|docx?|xlsx?|pptx?|txt)$/.test(clean)) return 'document';
    return 'webpage';
  }

  /**
   * Generates safe anchor HTML attributes
   * @returns {string}
   */
  static getSafeLinkAttributes() {
    return 'target="_blank" rel="noopener noreferrer"';
  }
}

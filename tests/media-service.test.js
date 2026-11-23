import assert from 'node:assert/strict';
import { MediaService } from '../src/services/media-service.js';

console.log('Testing MediaService (Phase 9)...');

// 1. Web URL validation
assert.equal(MediaService.validateWebUrl('https://example.com/test.jpg'), 'https://example.com/test.jpg');
assert.equal(MediaService.validateWebUrl('http://example.com/article'), 'http://example.com/article');
assert.equal(MediaService.validateWebUrl('javascript:alert(1)'), '');
assert.equal(MediaService.validateWebUrl('not a url'), '');
assert.equal(MediaService.validateWebUrl(''), '');
assert.equal(MediaService.validateWebUrl(null), '');

// 2. Safe image URL validation (web URL and legacy base64)
assert.equal(MediaService.validateImageUrl('https://images.example.com/photo.webp'), 'https://images.example.com/photo.webp');
const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
assert.equal(MediaService.validateImageUrl(validBase64), validBase64);
assert.equal(MediaService.validateImageUrl('data:text/html;base64,PHNjcmlwdD4='), '');
assert.equal(MediaService.validateImageUrl('ftp://example.com/photo.png'), '');

// 3. Base64 detection
assert.equal(MediaService.isBase64(validBase64), true);
assert.equal(MediaService.isBase64('https://example.com/photo.png'), false);

// 4. Media type resolution
assert.equal(MediaService.resolveMediaType('https://example.com/photo.jpg'), 'image');
assert.equal(MediaService.resolveMediaType('https://example.com/photo.png?v=1'), 'image');
assert.equal(MediaService.resolveMediaType('https://example.com/audio.mp3'), 'audio');
assert.equal(MediaService.resolveMediaType('https://example.com/video.mp4'), 'video');
assert.equal(MediaService.resolveMediaType('https://example.com/paper.pdf'), 'document');
assert.equal(MediaService.resolveMediaType('https://example.com/article'), 'webpage');

// 5. Safe Link attributes
assert.equal(MediaService.getSafeLinkAttributes(), 'target="_blank" rel="noopener noreferrer"');

console.log('✓ MediaService tests passed.');

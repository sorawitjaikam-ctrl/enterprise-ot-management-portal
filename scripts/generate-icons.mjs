import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePngIcon(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) * (isMaskable ? 0.48 : 0.44);
  const innerR = outerR * 0.72;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset);
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark slate theme (#0f172a)
      let r = 15, g = 23, b = 42, a = 255;

      if (!isMaskable && dist > outerR + 1) {
        // Transparent margin for non-maskable rounded icon
        r = 15; g = 23; b = 42; a = 0;
      } else if (dist <= outerR && dist > innerR) {
        // Blue glowing ring (#2563eb to #38bdf8)
        const angle = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
        r = Math.floor(37 + angle * (56 - 37));
        g = Math.floor(99 + angle * (189 - 99));
        b = Math.floor(235 + angle * (248 - 235));
      } else if (dist <= innerR) {
        // Center slate-800 (#1e293b) + stylized emblem
        r = 30; g = 41; b = 59;
        const nx = dx / innerR;
        const ny = dy / innerR;
        if (Math.abs(nx) < 0.45 && Math.abs(ny) < 0.15) {
          r = 56; g = 189; b = 248; // Cyan crossbar
        } else if (Math.abs(nx) < 0.15 && Math.abs(ny) < 0.45) {
          r = 96; g = 165; b = 250; // Blue vertical bar
        }
      }

      rawData.writeUInt8(r, pxOffset);
      rawData.writeUInt8(g, pxOffset + 1);
      rawData.writeUInt8(b, pxOffset + 2);
      rawData.writeUInt8(a, pxOffset + 3);
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), generatePngIcon(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192x192-maskable.png'), generatePngIcon(192, 192, true));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), generatePngIcon(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512-maskable.png'), generatePngIcon(512, 512, true));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generatePngIcon(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generatePngIcon(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePngIcon(180, 180, true));
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), generatePngIcon(32, 32, false));
fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.png'), generatePngIcon(16, 16, false));
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), generatePngIcon(32, 32, false));

console.log('Successfully generated all PWA icon assets in public/icons/ and public/favicon.ico');

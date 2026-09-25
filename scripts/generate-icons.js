import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Minimal PNG generator using zlib
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdr);

  // Raw image data with scanlines (filter byte 0)
  // Let's draw a nice rounded square / teal background with a centered white card
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(height * rowSize);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Inner white card
      const inInnerCard = Math.abs(dx) < width * 0.28 && Math.abs(dy) < height * 0.28;
      // Border / icon color
      if (inInnerCard) {
        // Draw white card with teal symbol area
        if (Math.abs(dy + height * 0.08) < height * 0.03 && Math.abs(dx) < width * 0.18) {
          // Top bar on card
          raw[pxOffset] = 15;
          raw[pxOffset + 1] = 118;
          raw[pxOffset + 2] = 110;
        } else if (dist < width * 0.14) {
          // Centered badge
          raw[pxOffset] = 15;
          raw[pxOffset + 1] = 118;
          raw[pxOffset + 2] = 110;
        } else {
          raw[pxOffset] = 255;
          raw[pxOffset + 1] = 255;
          raw[pxOffset + 2] = 255;
        }
      } else {
        // Teal background (#0f766e)
        raw[pxOffset] = r;
        raw[pxOffset + 1] = g;
        raw[pxOffset + 2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, 15, 118, 110));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, 15, 118, 110));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, 15, 118, 110));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, 15, 118, 110));

console.log('Icons generated successfully!');

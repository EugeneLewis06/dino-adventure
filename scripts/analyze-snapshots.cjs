// Snapshot PNG dosyalarını analiz eder
const fs = require('fs');
const path = require('path');

const dir = 'tests/visual/__snapshots__/visual.spec.js-snapshots';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

console.log('=== SNAPSHOT DOSYA DOĞRULAMASI ===\n');

files.forEach(f => {
  const data = fs.readFileSync(path.join(dir, f));

  // PNG imzası: 137 80 78 71 13 10 26 10
  const isPNG = data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71;

  // IHDR: offset 8 (signature) + 4 (length) = 12, sonra 'IHDR' (4 byte),
  // sonra 4 byte width, 4 byte height, 1 byte bitDepth, 1 byte colorType
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  const bitDepth = data[24];
  const colorType = data[25];
  const colorTypes = {
    0: 'Grayscale', 2: 'RGB', 3: 'Indexed',
    4: 'Grayscale+Alpha', 6: 'RGBA'
  };

  const sizeKB = (data.length / 1024).toFixed(1);
  const expectedPixels = 800 * 600; // viewport 800x600
  const pixelMatch = width === 800 && height === 600 ? '✓' : '✗ BEKLENENDEN FARKLI!';

  // IEND chunk kontrolü: dosyanın son 12 byte'ı
  const tail = data.slice(data.length - 12);
  const iendTag = tail.toString('ascii', 0, 4);
  const hasIEND = iendTag === 'IEND';

  console.log(`${f}:`);
  console.log(`  Dosya: ${sizeKB} KB | Piksel: ${width}x${height} ${pixelMatch}`);
  console.log(`  Format: ${colorTypes[colorType] || '?'} ${bitDepth}-bit | PNG: ${isPNG ? 'GEÇERLİ' : 'GEÇERSİZ'} | IEND: ${hasIEND ? 'TAM' : 'HASARLI'}`);

  // RGB/RGBA dosyalar için renk dağılımı analizi (boş canvas kontrolü)
  let samplePixels = 0;
  let uniqueColors = new Set();
  // Basit örnekleme: her 100. piksel
  if (colorType === 6 || colorType === 2) {
    const bpp = colorType === 6 ? 4 : 3; // bytes per pixel
    // IDAT verisi zlib sıkıştırmalı olduğu için direkt piksel analizi yapamayız
    // Bunun yerine ham veriyi kontrol edelim (piksel sayısı yeterli mi?)
    const expectedMin = expectedPixels * bpp * 0.3; // en az %30 sıkıştırma oranı
    const dataEstimate = data.length - 33 - 12; // kabaca IDAT boyutu
    console.log(`  Tahmini veri: ${(dataEstimate/1024).toFixed(1)}KB (boş olsa ~${(expectedPixels*0.1/1024).toFixed(1)}KB olurdu)`);
  }

  console.log('');
});

// Özet
console.log('=== ÖZET ===');
console.log(`Toplam snapshot: ${files.length}`);
const sizes = files.map(f => fs.statSync(path.join(dir, f)).size);
const minSize = Math.min(...sizes);
const maxSize = Math.max(...sizes);
console.log(`Boyut aralığı: ${(minSize/1024).toFixed(1)}KB - ${(maxSize/1024).toFixed(1)}KB`);
console.log('Tüm dosyalar 800x600 RGBA formatında olmalı.');

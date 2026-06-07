// Test raporu oluşturucu — Vitest + Playwright çıktılarını işler
const fs = require('fs');
const path = require('path');

const reportDir = path.resolve(__dirname, '..', 'test-reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

// Vitest çıktısını oku
const vitestRaw = safeRead('vitest-output.txt');
const vitest = parseVitest(vitestRaw);

// Playwright çıktısını oku
const pwRaw = safeRead('playwright-output.txt');
const pw = parsePlaywright(pwRaw);

const totalPassed = vitest.passed + pw.passed;
const totalFailed = vitest.failed + pw.failed;
const total = totalPassed + totalFailed;

const status = totalFailed === 0 ? '✅ TÜM TESTLER GEÇTİ' : '❌ BAŞARISIZ TEST VAR';

const now = new Date();
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
const sha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : 'local';
const branch = process.env.GITHUB_REF_NAME || 'main';

const report = `# Test Raporu

**Tarih:** ${dateStr} ${timeStr}  
**Dal:** \`${branch}\`  
**Commit:** \`${sha}\`  
**CI:** GitHub Actions  

---

## ${status}

| Test Tipi | Geçti | Kaldı | Toplam |
|-----------|-------|-------|--------|
| Vitest (birim) | ${vitest.passed} | ${vitest.failed} | ${vitest.passed + vitest.failed} |
| Playwright (görsel) | ${pw.passed} | ${pw.failed} | ${pw.passed + pw.failed} |
| **Genel** | **${totalPassed}** | **${totalFailed}** | **${total}** |

---

## Vitest — Birim Testleri

${vitest.table}

---

## Playwright — Görsel Regresyon Testleri

${pw.table}

**Ortam:** Headless Chromium 800×600, PRNG seed=42  
**Tolerans:** %2 piksel farkı, eşik 0.5  
`;

fs.writeFileSync(path.join(reportDir, 'TEST-REPORT.md'), report, 'utf-8');
console.log(`Rapor yazıldı: test-reports/TEST-REPORT.md (${totalPassed}/${total} geçti)`);

// ---------------------------------------------------------------------------

function safeRead(filename) {
  try { return fs.readFileSync(filename, 'utf-8'); } catch { return ''; }
}

function parseVitest(output) {
  if (!output) return { passed: 0, failed: 0, table: '*Test çıktısı bulunamadı*' };

  // Vitest verbose çıktısından geçen/kalan sayısını çıkar
  const testFilesMatch = output.match(/Test Files\s+(\d+)\s+passed.*?(\d+)\s+failed/i);
  const testsMatch = output.match(/Tests\s+(\d+)\s+passed.*?(\d+)\s+failed/i);

  const filesPassed = testFilesMatch ? parseInt(testFilesMatch[1]) : 0;
  const filesFailed = testFilesMatch ? parseInt(testFilesMatch[2]) : 0;

  // Test dosyalarını gruplandır
  const fileResults = [];
  const lines = output.split('\n');
  let currentFile = null;

  for (const line of lines) {
    const fileMatch = line.match(/^✓\s+(.+?\.test\.js)\s+>/);
    const fileFailMatch = line.match(/^×\s+(.+?\.test\.js)\s+>/);
    if (fileMatch || fileFailMatch) {
      const filename = (fileMatch || fileFailMatch)[1].replace(/.*[\\/]/, '');
      if (!currentFile || currentFile.name !== filename) {
        if (currentFile) fileResults.push(currentFile);
        currentFile = { name: filename, passed: 0, failed: 0 };
      }
      if (fileMatch) currentFile.passed++;
      if (fileFailMatch) currentFile.failed++;
    }
  }
  if (currentFile) fileResults.push(currentFile);

  // Eğer detaylı parse çalışmazsa özet sayıları kullan
  if (fileResults.length === 0) {
    const allPassed = testsMatch ? parseInt(testsMatch[1]) : 0;
    const allFailed = testsMatch ? parseInt(testsMatch[2]) : 0;
    return {
      passed: allPassed,
      failed: allFailed,
      table: `Toplam: ${allPassed} geçti, ${allFailed} kaldı`,
    };
  }

  const totalPassed = fileResults.reduce((s, f) => s + f.passed, 0);
  const totalFailed = fileResults.reduce((s, f) => s + f.failed, 0);

  const table = [
    '| Dosya | Geçti | Kaldı |',
    '|-------|-------|-------|',
    ...fileResults.map(f => `| ${f.name} | ${f.passed} ✅ | ${f.failed} |`),
  ].join('\n');

  return { passed: totalPassed, failed: totalFailed, table };
}

function parsePlaywright(output) {
  if (!output) return { passed: 0, failed: 0, table: '*Test çıktısı bulunamadı*' };

  const results = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // "ok 1 ... › test adı (1.2s)" veya "x 1 ... › test adı"
    const okMatch = line.match(/^\s*ok\s+\d+\s+.+?›\s+(.+?)\s+\(([\d.]+)s\)/);
    const failMatch = line.match(/^\s*x\s+\d+\s+.+?›\s+(.+?)\s+\(([\d.]+)s\)/);

    if (okMatch) {
      results.push({ name: okMatch[1].trim(), status: '✅', duration: okMatch[2] });
    } else if (failMatch) {
      results.push({ name: failMatch[1].trim(), status: '❌', duration: failMatch[2] });
    }
  }

  // Düz parse ile de toplamları al
  const summaryMatch = output.match(/(\d+)\s+passed/);
  const failSummaryMatch = output.match(/(\d+)\s+failed/);

  let passed = summaryMatch ? parseInt(summaryMatch[1]) : 0;
  let failed = failSummaryMatch ? parseInt(failSummaryMatch[1]) : 0;

  // Detaylı parse daha doğruysa onu kullan
  if (results.length > 0) {
    passed = results.filter(r => r.status === '✅').length;
    failed = results.filter(r => r.status === '❌').length;
  }

  let table;
  if (results.length > 0) {
    table = [
      '| # | Test | Süre | Durum |',
      '|---|------|------|-------|',
      ...results.map((r, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `| ${num} | ${r.name} | ${r.duration}s | ${r.status} |`;
      }),
    ].join('\n');
  } else {
    table = `Toplam: ${passed} geçti, ${failed} kaldı`;
  }

  return { passed, failed, table };
}

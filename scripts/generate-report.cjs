// Test raporu oluşturucu — Vitest JSON + Playwright list çıktılarını işler
const fs = require('fs');
const path = require('path');

const reportDir = path.resolve(__dirname, '..', 'test-reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

// Vitest JSON çıktısını oku
const vitest = parseVitestJSON(safeRead('vitest-output.json'));

// Playwright list çıktısını oku
const pw = parsePlaywright(safeRead('playwright-output.txt'));

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

// Vitest JSON reporter çıktısını parse et
function parseVitestJSON(raw) {
  if (!raw) return { passed: 0, failed: 0, table: '*Test çıktısı bulunamadı*' };

  try {
    const data = JSON.parse(raw);
    const files = (data.testResults || []).filter(f => f.assertionResults);

    const fileResults = files.map(f => {
      const assertions = f.assertionResults || [];
      const passed = assertions.filter(a => a.status === 'passed').length;
      const failed = assertions.filter(a => a.status === 'failed').length;
      const name = f.name ? path.basename(f.name) : '?';
      return { name, passed, failed };
    });

    const totalPassed = fileResults.reduce((s, f) => s + f.passed, 0);
    const totalFailed = fileResults.reduce((s, f) => s + f.failed, 0);

    const table = fileResults.length > 0
      ? [
          '| Dosya | Geçti | Kaldı |',
          '|-------|-------|-------|',
          ...fileResults.map(f =>
            `| ${f.name} | ${f.passed} ✅ | ${f.failed} |`
          ),
        ].join('\n')
      : '*Çıktı parse edilemedi*';

    return { passed: totalPassed, failed: totalFailed, table };
  } catch {
    // JSON parse başarısız — ham çıktıdan çıkarmaya çalış
    const passed = (raw.match(/"status"\s*:\s*"passed"/g) || []).length;
    const failed = (raw.match(/"status"\s*:\s*"failed"/g) || []).length;
    return {
      passed, failed,
      table: `Toplam: ${passed} geçti, ${failed} kaldı (ham JSON'dan)`,
    };
  }
}

// Playwright list reporter çıktısını parse et
function parsePlaywright(output) {
  if (!output) return { passed: 0, failed: 0, table: '*Test çıktısı bulunamadı*' };

  const results = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const okMatch = line.match(/^\s*ok\s+\d+\s+.+?›\s+(.+?)\s+\(([\d.]+)s\)/);
    const failMatch = line.match(/^\s*x\s+\d+\s+.+?›\s+(.+?)\s+\(([\d.]+)s\)/);

    if (okMatch) {
      results.push({ name: okMatch[1].trim(), status: '✅', duration: okMatch[2] });
    } else if (failMatch) {
      results.push({ name: failMatch[1].trim(), status: '❌', duration: failMatch[2] });
    }
  }

  const summaryMatch = output.match(/(\d+)\s+passed/);
  const failSummaryMatch = output.match(/(\d+)\s+failed/);

  let passed = summaryMatch ? parseInt(summaryMatch[1]) : 0;
  let failed = failSummaryMatch ? parseInt(failSummaryMatch[1]) : 0;

  if (results.length > 0) {
    passed = results.filter(r => r.status === '✅').length;
    failed = results.filter(r => r.status === '❌').length;
  }

  const table = results.length > 0
    ? [
        '| # | Test | Süre | Durum |',
        '|---|------|------|-------|',
        ...results.map((r, i) =>
          `| ${String(i + 1).padStart(2, '0')} | ${r.name} | ${r.duration}s | ${r.status} |`
        ),
      ].join('\n')
    : `Toplam: ${passed} geçti, ${failed} kaldı`;

  return { passed, failed, table };
}

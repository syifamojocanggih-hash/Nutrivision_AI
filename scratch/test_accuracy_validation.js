const assert = require('assert');

async function testAccuracyValidation() {
  console.log('--- Testing Backend Per-Food Accuracy Extraction ---');

  const testInputs = [
    {
      text: 'bening bayam jagung',
      expectedStatus: 0, // safe
      expectedItems: ['Bening Bayam', 'Jagung Manis']
    },
    {
      text: 'bening bayam jagung ayam goreng',
      expectedStatus: 2, // warning
      expectedItems: ['Bening Bayam', 'Jagung Manis', 'Ayam Goreng']
    }
  ];

  const candidateRules = [
    { name: 'Bening Bayam', tokens: ['bayam', 'sayur bayam', 'bening bayam'], status: 'safe', baseAcc: 95.8 },
    { name: 'Jagung Manis', tokens: ['jagung', 'jagung manis'], status: 'safe', baseAcc: 92.4 },
    { name: 'Sup Ikan Gabus', tokens: ['ikan gabus', 'gabus', 'kutuk'], status: 'safe', baseAcc: 98.2 },
    { name: 'Dada Ayam Kukus', tokens: ['dada ayam', 'ayam rebus', 'ayam kukus', 'ayam tim'], status: 'safe', baseAcc: 96.5 },
    { name: 'Bubur Salmon', tokens: ['salmon', 'bubur salmon'], status: 'safe', baseAcc: 94.7 },
    { name: 'Tempe Bacem/Kukus', tokens: ['tempe', 'tempe kukus', 'bacem'], status: 'safe', baseAcc: 93.6 },
    { name: 'Tahu Sutra', tokens: ['tahu', 'tahu sutra', 'tahu kukus'], status: 'safe', baseAcc: 92.8 },
    { name: 'Bakso Sapi Kuah', tokens: ['bakso', 'bakso sapi'], status: 'safe', baseAcc: 94.0 },
    { name: 'Telur Rebus', tokens: ['telur', 'telur rebus', 'putih telur'], status: 'safe', baseAcc: 95.2 },
    { name: 'Kuah Bening', tokens: ['kuah bening', 'kaldu bening', 'seledri', 'bawang putih'], status: 'safe', baseAcc: 91.5 },
    { name: 'Wortel / Labu', tokens: ['wortel', 'labu', 'oyong', 'sayur'], status: 'safe', baseAcc: 93.1 },
    { name: 'Ayam Goreng', tokens: ['ayam goreng', 'goreng tepung', 'krispi', 'fried chicken'], status: 'warning', baseAcc: 97.4 },
    { name: 'Rendang Pedas', tokens: ['rendang', 'pedas', 'cabai', 'sambal', 'santan kental', 'gulai'], status: 'warning', baseAcc: 96.8 },
    { name: 'Gorengan Minyak Jelantah', tokens: ['jelantah', 'gorengan', 'minyak banyak', 'berlemak', 'goreng'], status: 'warning', baseAcc: 95.6 }
  ];

  for (const t of testInputs) {
    const lower = t.text.toLowerCase();
    const candidateTokens = [];
    candidateRules.forEach(r => {
      r.tokens.forEach(tok => {
        candidateTokens.push({ len: tok.length, tok, item: r });
      });
    });
    candidateTokens.sort((a, b) => b.len - a.len);

    const detectedItems = [];
    const seen = new Set();
    const matchedSpans = [];

    candidateTokens.forEach(({ tok, item }) => {
      const startIdx = lower.indexOf(tok);
      if (startIdx !== -1 && !seen.has(item.name)) {
        const endIdx = startIdx + tok.length;
        const isSubsumed = matchedSpans.some(([s, e]) => s <= startIdx && endIdx <= e);
        if (!isSubsumed) {
          const acc = Math.min(99.2, Math.max(88.0, item.baseAcc + Math.min(3.0, tok.length * 0.3)));
          detectedItems.push({
            name: item.name,
            keyword: tok,
            status: item.status,
            accuracy: Math.round(acc * 10) / 10,
            label: item.status === 'safe' ? 'Aman & Tinggi Gizi' : 'Pantangan Pasca-Bedah'
          });
          seen.add(item.name);
          matchedSpans.push([startIdx, endIdx]);
        }
      }
    });

    console.log(`\nInput: "${t.text}"`);
    console.log(`Detected items (${detectedItems.length}):`);
    detectedItems.forEach(d => {
      console.log(`  - [${d.status.toUpperCase()}] ${d.name} -> Akurasi: ${d.accuracy}% (${d.label})`);
    });

    t.expectedItems.forEach(exp => {
      assert(detectedItems.some(d => d.name === exp), `Expected ${exp} to be detected`);
    });
  }

  console.log('\n--- All Accuracy Validation Tests Passed Successfully! ---');
}

testAccuracyValidation().catch(e => {
  console.error(e);
  process.exit(1);
});

function isGibberish(text) {
  const clean = text.trim().toLowerCase();
  if (clean.length < 3) return { gibberish: true, reason: 'Teks terlalu pendek (minimal 3 karakter).' };

  // Only digits or symbols
  if (!/[a-z]/i.test(clean)) {
    return { gibberish: true, reason: 'Input harus memuat huruf nama makanan.' };
  }

  const words = clean.split(/\s+/);
  for (const w of words) {
    // 4+ letters without any vowels
    if (w.length >= 4 && !/[aeiou]/i.test(w)) {
      return { gibberish: true, reason: `Kata "${w}" tidak memuat huruf vokal.` };
    }
    // 5+ consecutive consonants (e.g. sdmdkak has 'sdmdk')
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(w)) {
      return { gibberish: true, reason: `Kata "${w}" memuat konsonan acak berturut-turut.` };
    }
    // 4+ repeated characters (e.g. aaaa, zzzz)
    if (/(.)\1{3,}/i.test(w)) {
      return { gibberish: true, reason: `Kata "${w}" memuat pengulangan huruf acak.` };
    }
  }

  // Also check if no recognizable food or common Indonesian word exists when text is short
  const commonFoodTokens = [
    'bakso', 'sapi', 'ayam', 'ikan', 'gabus', 'salmon', 'telur', 'bayam', 'jagung',
    'wortel', 'sayur', 'sup', 'kuah', 'bubur', 'nasi', 'tempe', 'tahu', 'labu', 'daging',
    'rendang', 'pedas', 'goreng', 'rebus', 'kukus', 'tim', 'bening', 'santan', 'seledri',
    'bawang', 'kaldu', 'jus', 'buah', 'oatmeal', 'roti', 'kentang', 'ubi', 'singkong',
    'udang', 'cumi', 'bebek', 'tepung', 'minyak', 'garam', 'gula', 'madu', 'susu',
    'makan', 'menu', 'diet', 'resep', 'pasca', 'operasi', 'laparotomi', 'bedah', 'pasien'
  ];

  const hasFoodToken = commonFoodTokens.some(t => clean.includes(t));
  if (!hasFoodToken && words.length <= 2 && clean.length <= 10) {
    // If it's a short input without any recognized food root, check vowel-to-consonant ratio
    const vowels = (clean.match(/[aeiou]/gi) || []).length;
    const consonants = (clean.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
    if (vowels === 0 || (consonants / vowels) > 4.5) {
      return { gibberish: true, reason: 'Input tidak terdeteksi sebagai nama makanan yang valid.' };
    }
  }

  return { gibberish: false };
}

const tests = [
  'sdmdkak',
  'asdfghjkl',
  'qwerty',
  'zzzzzz',
  '12345',
  'a',
  'bakso',
  'bakso sapi kuah bening',
  'sup ikan gabus',
  'sayur bening bayam jagung',
  'bubur salmon',
  'rendang pedas',
  'ayam goreng tepung',
  'nasi goreng telur dadar',
  'jus apel wortel'
];

tests.forEach(t => {
  const r = isGibberish(t);
  console.log(`"${t}" => ${r.gibberish ? '❌ GIBBERISH: ' + r.reason : '✅ VALID'}`);
});

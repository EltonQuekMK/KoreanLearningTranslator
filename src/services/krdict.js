const API_BASE = '/krdict';

function cleanText(value) {
  if (!value) return '';

  return value
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

function getFirstText(node, selectors) {
  if (!node) return '';
  for (const selector of selectors) {
    const found = node.querySelector(selector);
    if (found?.textContent) {
      return cleanText(found.textContent);
    }
  }
  return '';
}

function normalizeRomanization(value) {
  const cleaned = cleanText(value || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }

  return romanizeWithSpacing(cleaned);
}

const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const INITIAL_MAP = { 'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h' };
const MEDIAL_MAP = { 'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i' };
const FINAL_MAP = { '': '', 'ㄱ': 'k', 'ㄲ': 'kk', 'ㄳ': 'ks', 'ㄴ': 'n', 'ㄵ': 'nj', 'ㄶ': 'nh', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'lk', 'ㄻ': 'lm', 'ㄼ': 'lp', 'ㄽ': 'ls', 'ㄾ': 'lt', 'ㄿ': 'lp', 'ㅀ': 'lh', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'ps', 'ㅅ': 't', 'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't' };

// Helper maps for sound-change rules and cluster splits
const FINAL_SPLIT = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
};

const NASAL_MAP = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };
const ASPIRATED_MAP = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㅈ': 'ㅊ' };

/* some rules for the language have not yet been implemented
Batchim (Final Consonants) (Implemented)
The consonant(s) at the bottom of a syllable block are called Batchim. Regardless of their base sound, final consonants simplify into just seven core sounds when not followed by a vowel:
ㄱ, ㅋ, ㄲ sound like [k]
ㄷ, ㅌ, ㅅ, ㅆ, ㅈ, ㅊ, ㅎ sound like [t]
ㅂ, ㅍ sound like [p]
ㄴ, ㄹ, ㅁ, ㅇ retain their regular sounds [n], [l/r], [m], [ng]

The Linking Rule (Resyllabification) 
When a word ends in a final consonant (Batchim) and the very next word or syllable starts with a vowel (ㅇ), the final consonant moves over to replace the silent ㅇ.
For example: 맛이 (mat-i) becomes 마시 (ma-si).
Double consonants in the final position split up. 
For example: 값이 (gabs-i) is pronounced 갑시 (gab-si).

Sound Change Rules (Assimilation)
When certain consonants collide, their sounds change to make the word flow more smoothly.
Nasalization: When final consonants (ㄱ, ㄷ, ㅂ) meet ㄴ or ㅁ, they become their nasal equivalents (ㅇ, ㄴ, ㅁ).
Example: 한국말 (Han-guk-mal) becomes 한궁말 (Han-gung-mal).
Liquefaction: When ㄴ and ㄹ meet, the ㄴ often turns into a ㄹ.
Example: 연락 (yeon-rak) becomes 열락 (yeol-lak).
Aspiration: When ㅎ meets ㄱ, ㄷ, ㅂ, or ㅈ, they combine to form the aspirated sounds ㅋ, ㅌ, ㅍ, or ㅊ.
Example: 좋다 (joh-da) becomes 조타 (jo-ta).

*/

function isHangulSyllable(char) {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

function decomposeHangulSyllable(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) {
    return null;
  }

  const initialIndex = Math.floor(code / 588);
  const medialIndex = Math.floor((code % 588) / 28);
  const finalIndex = code % 28;

  return {
    initial: INITIALS[initialIndex],
    medial: MEDIALS[medialIndex],
    final: FINALS[finalIndex],
  };
}

function transliterateHangul(text) {
  const chars = Array.from(text || '');
  if (!chars.length) return '';

  // Build syllable objects
  const syllables = chars.map((char) => {
    if (!isHangulSyllable(char)) return { char, isHangul: false };
    const parts = decomposeHangulSyllable(char) || {};
    return {
      char,
      isHangul: true,
      initial: parts.initial || '',
      medial: parts.medial || '',
      final: parts.final || '',
    };
  });

  // Apply linking (resyllabification) and assimilation rules left-to-right
  for (let i = 0; i < syllables.length - 1; i += 1) {
    const cur = syllables[i];
    const next = syllables[i + 1];
    if (!cur.isHangul || !next.isHangul) continue;

    // Aspiration: final ㅎ + next initial ㄱ/ㄷ/ㅂ/ㅈ -> aspirated initial, drop ㅎ
    if (cur.final === 'ㅎ' && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(next.initial)) {
      next.initial = ASPIRATED_MAP[next.initial] || next.initial;
      cur.final = '';
    }

    // Nasalization: final ㄱ/ㄷ/ㅂ before next initial ㄴ or ㅁ -> become nasal equivalents
    if (['ㄱ', 'ㄷ', 'ㅂ'].includes(cur.final) && ['ㄴ', 'ㅁ'].includes(next.initial)) {
      cur.final = NASAL_MAP[cur.final] || cur.final;
    }

    // Liquefaction: final ㄴ before next initial ㄹ -> final becomes ㄹ
    if (cur.final === 'ㄴ' && next.initial === 'ㄹ') {
      cur.final = 'ㄹ';
    }

    // Linking / resyllabification: if next initial is silent ㅇ and current has a final
    if (next.initial === 'ㅇ' && cur.final) {
      // If final is a complex cluster, split it; otherwise move the single final
      if (FINAL_SPLIT[cur.final]) {
        const [keep, move] = FINAL_SPLIT[cur.final];
        cur.final = keep;
        next.initial = move;
      } else {
        next.initial = cur.final;
        cur.final = '';
      }
    }
  }

  // Build romanization from (possibly modified) syllables
  return syllables
    .map((s) => {
      if (!s.isHangul) return s.char;
      const pieces = [INITIAL_MAP[s.initial] ?? '', MEDIAL_MAP[s.medial] ?? ''];
      if (s.final) pieces.push(FINAL_MAP[s.final] ?? '');
      return pieces.join('');
    })
    .join('');
}

function formatKoreanWithSpacing(text) {
  const trimmed = cleanText(text || '').replace(/\s+/g, '');
  if (!trimmed) {
    return '';
  }

  const particleMatches = ['은', '는', '이', '가', '을', '를', '의', '과', '와', '도', '만', '에', '에서', '에게', '한테', '처럼'];
  const boundaryMatches = ['아름다운', '학교', '입니다', '니다', '어요', '세요', '죠', '다']; //why 아름다운
  const multiSyllableEndings = ['입니다', '습니까', '어요', '세요', '네요', '죠', '니다', '다'];
  const tokens = [];
  let current = '';

  const chars = Array.from(trimmed);
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];

    if (!isHangulSyllable(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
      continue;
    }

    const remaining = chars.slice(index).join('');
    const nextParticle = particleMatches.find((particle) => remaining.startsWith(particle));
    const nextEnding = multiSyllableEndings.find((ending) => remaining.startsWith(ending));
    const nextBoundary = boundaryMatches.find((word) => remaining.startsWith(word));

    // Prefer attaching particles and multi-syllable endings to the current token
    // before splitting by boundary words. This ensures endings like "입니다"
    // are appended to the preceding token instead of slipping through.
    if (current && nextParticle) {
      current += nextParticle;
      index += nextParticle.length - 1;
      continue;
    }

    if (current && nextEnding) {
      current += nextEnding;
      index += nextEnding.length - 1;
      continue;
    }

    // If there's no current token and the remaining text starts with a
    // multi-syllable ending or particle, treat that ending/particle as its
    // own token (handles inputs that are exactly "입니다", etc.).
    if (!current && nextEnding) {
      tokens.push(nextEnding);
      index += nextEnding.length - 1;
      continue;
    }

    if (!current && nextParticle) {
      tokens.push(nextParticle);
      index += nextParticle.length - 1;
      continue;
    }

    if (current && nextBoundary) {
      tokens.push(current);
      current = '';
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens.join(' ');
}

function romanizeWithSpacing(text) {
  const trimmed = cleanText(text || '').replace(/\s+/g, '');
  if (!trimmed) {
    return '';
  }
  // Use the same spacing decisions as formatKoreanWithSpacing, then transliterate each token
  const spaced = formatKoreanWithSpacing(trimmed);
  if (!spaced) return '';
  return spaced
    .split(' ')
    .map((token) => transliterateHangul(token))
    .join(' ');
}

function buildBreakdown(korean) {
  const trimmedKorean = cleanText(korean || '');

  if (!trimmedKorean) {
    return [];
  }

  // Build syllable objects first so we can apply cross-syllable rules
  const chars = Array.from(trimmedKorean);
  const syllables = chars.map((char) => {
    if (!isHangulSyllable(char)) return { char, isHangul: false };
    const parts = decomposeHangulSyllable(char) || {};
    return {
      char,
      isHangul: true,
      initial: parts.initial || '',
      medial: parts.medial || '',
      final: parts.final || '',
      originalInitial: parts.initial || '',
      originalFinal: parts.final || '',
    };
  });

  // Apply assimilation/linking rules (mirrors transliterateHangul logic)
  for (let i = 0; i < syllables.length - 1; i += 1) {
    const cur = syllables[i];
    const next = syllables[i + 1];
    if (!cur.isHangul || !next.isHangul) continue;

    // Aspiration: final ㅎ + next initial ㄱ/ㄷ/ㅂ/ㅈ -> aspirated initial, drop ㅎ
    if (cur.final === 'ㅎ' && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(next.initial)) {
      next.initial = ASPIRATED_MAP[next.initial] || next.initial;
      cur.final = '';
    }

    // Nasalization: final ㄱ/ㄷ/ㅂ before next initial ㄴ or ㅁ -> become nasal equivalents
    if (['ㄱ', 'ㄷ', 'ㅂ'].includes(cur.final) && ['ㄴ', 'ㅁ'].includes(next.initial)) {
      cur.final = NASAL_MAP[cur.final] || cur.final;
    }

    // Liquefaction: final ㄴ before next initial ㄹ -> final becomes ㄹ
    if (cur.final === 'ㄴ' && next.initial === 'ㄹ') {
      cur.final = 'ㄹ';
    }

    // Linking / resyllabification: if next initial is silent ㅇ and current has a final
    if (next.initial === 'ㅇ' && cur.final) {
      // If final is a complex cluster, split it; otherwise move the single final
      if (FINAL_SPLIT[cur.final]) {
        const [keep, move] = FINAL_SPLIT[cur.final];
        cur.final = keep;
        next.initial = move;
      } else {
        next.initial = cur.final;
        cur.final = '';
      }
    }
  }

  // Build breakdown from possibly modified syllables, marking changed sounds
  return syllables.flatMap((s) => {
    if (!s.isHangul) return [];

    const breakdownParts = [];

    // Initial
    if (s.originalInitial) {
      const origSound = INITIAL_MAP[s.originalInitial] || '∅';
      const effSound = INITIAL_MAP[s.initial] || '∅';
      breakdownParts.push({
        char: s.originalInitial,
        sound: effSound,
        originalSound: origSound,
        changed: origSound !== effSound,
      });
    }

    // Medial
    if (s.medial) {
      const medSound = MEDIAL_MAP[s.medial] || '∅';
      breakdownParts.push({ char: s.medial, sound: medSound, changed: false });
    }

    // Final
    if (s.originalFinal) {
      const origFinalSound = FINAL_MAP[s.originalFinal] || '∅';
      const effFinalSound = FINAL_MAP[s.final] || '∅';
      breakdownParts.push({
        char: s.originalFinal,
        sound: effFinalSound,
        originalSound: origFinalSound,
        changed: origFinalSound !== effFinalSound,
      });
    }

    const romanizationPieces = [INITIAL_MAP[s.initial] ?? '', MEDIAL_MAP[s.medial] ?? ''];
    if (s.final) romanizationPieces.push(FINAL_MAP[s.final] ?? '');
    const romanization = romanizationPieces.join('');

    return [{
      syllable: s.char,
      romanization,
      parts: breakdownParts,
    }];
  });
}

function extractTranslationText(data) {
  return cleanText(Array.isArray(data?.[0]) ? data[0].map((item) => item?.[0]).filter(Boolean).join(' ') : '');
}

async function translateText(text, baseUrl) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return '';
  }

  const response = await fetch(`${baseUrl}?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`);

  if (!response.ok) {
    throw new Error(`Free translation lookup failed with status ${response.status}`);
  }

  const data = await response.json();
  return extractTranslationText(data);
}

export async function searchTranslation(query, baseUrl = 'https://translate.googleapis.com/translate_a/single') {
  const trimmed = query?.trim();
  if (!trimmed) return null;

  const english = await translateText(trimmed, baseUrl).catch(() => '');
  if (!english) return null;

  const spacedTokens = formatKoreanWithSpacing(trimmed).split(' ').filter(Boolean);
  const tokenMeanings = spacedTokens.length > 1
    ? await Promise.all(spacedTokens.map((token) => translateText(token, baseUrl).catch(() => '')))
    : [];

  const translatedTokens = spacedTokens.length > 1
    ? spacedTokens.map((token, index) => ({
        char: token,
        meaning: cleanText(tokenMeanings[index]) || english,
      }))
    : [{ char: trimmed, meaning: english }];

  return {
    korean: formatKoreanWithSpacing(trimmed),
    english,
    romanization: normalizeRomanization(trimmed),
    breakdown: buildBreakdown(trimmed),
    meaningParts: translatedTokens,
  };
}

export async function searchKoreanDictionary(query, apiKey = import.meta.env.VITE_KRDICT_API_KEY) {
  console.log(`Searching Korean dictionary for query: "${query}"`);
  const trimmed = query?.trim();
  if (!trimmed) return null;

  return searchTranslation(trimmed);
}

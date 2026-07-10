#!/usr/bin/env node

function cleanText(value) {
  return value ? value.replace(/\s+/g, ' ').trim() : '';
}

function isHangulSyllable(char) {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

function formatKoreanWithSpacing(text) {
  const trimmed = cleanText(text || '').replace(/\s+/g, '');
  if (!trimmed) {
    return '';
  }

  const particleMatches = ['은', '는', '이', '가', '을', '를', '의', '과', '와', '도', '만', '에', '에서', '에게', '한테', '처럼'];
  const boundaryMatches = ['아름다운', '학교', '입니다', '니다', '어요', '세요', '죠', '다'];
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

const samples = [
  '학교입니다',
  '아름다운집입니다',
  '안녕하세요',
  '맛입니다',
  '값입니다',
  '입니다',
  '학교 는',
  '감사합니다',
];

for (const s of samples) {
  console.log(s, '=>', formatKoreanWithSpacing(s));
}

function getRandomElement(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomNickname(): string {
  const adjectivesAndVerbs: string[] = [
    '불타는',
    '차가운',
    '따뜻한',
    '어두운',
    '밝은',
    '빠른',
    '느린',
    '커다란',
    '작은',
    '이상한',
    '달리는',
    '뛰는',
    '춤추는',
    '노래하는',
    '잠자는',
    '웃는',
    '우는',
    '사냥하는',
    '먹는',
    '타는',
    '비오는',
    '흐린',
    '맑은',
    '뜨거운',
    '차가운',
    '깨끗한',
    '더러운',
    '빛나는',
    '말하는',
    '숨쉬는',
  ];

  const nouns: string[] = [
    '사자',
    '호랑이',
    '토끼',
    '곰',
    '늑대',
    '도마뱀',
    '독수리',
    '고래',
    '하마',
    '감자',
    '물고기',
    '나무',
    '꽃',
    '바다',
    '산',
    '바람',
    '구름',
    '별',
    '달',
    '햇살',
    '돌',
    '모래',
    '불',
    '얼음',
    '강',
    '숲',
    '늪',
    '잎사귀',
    '새',
    '개구리',
  ];

  const postfixs = ['AI', 'GPT', 'BOT'];

  const adjectiveOrVerb = getRandomElement(adjectivesAndVerbs);
  const noun = getRandomElement(nouns);
  const postfix = getRandomElement(postfixs);

  return `${adjectiveOrVerb} ${noun} ${postfix}`;
}

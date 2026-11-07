import { Vocabulary } from '../types';

export interface ValidationResult {
  isCorrect: boolean;
  matchType: 'exact' | 'variant' | 'article_missed' | 'incorrect';
  message: string;
  expectedAnswer: string;
  normalizedUser: string;
}

/**
 * Normalizes a string by trimming extra whitespace, collapsing multiple spaces,
 * and normalizing unicode.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC');
}

/**
 * Splits comma, semicolon, slash, or parentheses separated variants into a list of strings.
 * e.g. "rumah / kediaman, tempat tinggal (residence)" -> ["rumah", "kediaman", "tempat tinggal"]
 */
export function extractVariants(text: string): string[] {
  if (!text) return [];
  // Remove content inside parentheses for loose comparison, or keep both
  const clean = text.replace(/\([^)]*\)/g, ' ');
  const parts = clean.split(/[,;/|]|\batau\b|\boder\b/i);
  
  const variants = parts
    .map(p => normalizeText(p.toLowerCase()))
    .filter(p => p.length > 0);

  // Also include the original trimmed lowercased string
  const base = normalizeText(text.toLowerCase());
  if (!variants.includes(base)) {
    variants.push(base);
  }

  return variants;
}

/**
 * Validates German -> Indonesian answer.
 */
export function validateDeToId(userInput: string, vocab: Vocabulary): ValidationResult {
  const normUser = normalizeText(userInput).toLowerCase();
  const expected = vocab.indonesian;
  const acceptableVariants = extractVariants(expected);

  if (!normUser) {
    return {
      isCorrect: false,
      matchType: 'incorrect',
      message: 'No answer provided',
      expectedAnswer: expected,
      normalizedUser: normUser,
    };
  }

  // Check if user answer matches any variant
  const matched = acceptableVariants.some(v => {
    return v === normUser || (v.length > 3 && normUser.includes(v)) || (normUser.length > 3 && v.includes(normUser));
  });

  if (matched) {
    return {
      isCorrect: true,
      matchType: 'exact',
      message: 'Richtig! (Correct!)',
      expectedAnswer: expected,
      normalizedUser: normUser,
    };
  }

  return {
    isCorrect: false,
    matchType: 'incorrect',
    message: 'Leider falsch (Incorrect)',
    expectedAnswer: expected,
    normalizedUser: normUser,
  };
}

/**
 * Validates Indonesian -> German answer.
 * Handles German articles (der, die, das) and German noun capitalization.
 */
export function validateIdToDe(userInput: string, vocab: Vocabulary): ValidationResult {
  const normUser = normalizeText(userInput);
  const userLower = normUser.toLowerCase();

  const article = vocab.article ? vocab.article.toLowerCase().trim() : '';
  const word = vocab.word.trim();
  const wordLower = word.toLowerCase();

  const fullGerman = article ? `${article} ${word}` : word;

  if (!normUser) {
    return {
      isCorrect: false,
      matchType: 'incorrect',
      message: 'No answer provided',
      expectedAnswer: fullGerman,
      normalizedUser: normUser,
    };
  }

  // Check for exact match with article (case-insensitive on article, allows matching noun)
  if (article) {
    const fullExpectedLower = `${article} ${wordLower}`;
    
    // Exact full match: "das Haus" or "das haus"
    if (userLower === fullExpectedLower) {
      return {
        isCorrect: true,
        matchType: 'exact',
        message: 'Perfekt! Word and article matched.',
        expectedAnswer: fullGerman,
        normalizedUser: normUser,
      };
    }

    // Word matched without article: "Haus" or "haus"
    if (userLower === wordLower) {
      return {
        isCorrect: true,
        matchType: 'article_missed',
        message: `Word is correct! Don't forget the article "${article}".`,
        expectedAnswer: fullGerman,
        normalizedUser: normUser,
      };
    }

    // User provided wrong article: e.g. "der Haus" when it is "das Haus"
    const userTokens = userLower.split(' ');
    if (userTokens.length === 2 && ['der', 'die', 'das'].includes(userTokens[0]) && userTokens[1] === wordLower) {
      return {
        isCorrect: false,
        matchType: 'incorrect',
        message: `Incorrect article! It's "${article} ${word}", not "${userTokens[0]} ${word}".`,
        expectedAnswer: fullGerman,
        normalizedUser: normUser,
      };
    }
  } else {
    // No article (e.g., verb, adjective, adverb)
    if (userLower === wordLower) {
      return {
        isCorrect: true,
        matchType: 'exact',
        message: 'Perfekt! Correct answer.',
        expectedAnswer: fullGerman,
        normalizedUser: normUser,
      };
    }
  }

  return {
    isCorrect: false,
    matchType: 'incorrect',
    message: 'Leider falsch (Incorrect)',
    expectedAnswer: fullGerman,
    normalizedUser: normUser,
  };
}


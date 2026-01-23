/**
 * Fuzzy Search Utility
 * Implements Levenshtein distance for typo tolerance
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[s1.length][s2.length];
};

/**
 * Calculate similarity score (0-1, higher is better)
 */
export const similarityScore = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return (maxLen - distance) / maxLen;
};

/**
 * Check if a string fuzzy matches a query
 * @param text The text to search in
 * @param query The search query
 * @param threshold Minimum similarity score (default 0.6)
 */
export const fuzzyMatch = (
  text: string,
  query: string,
  threshold = 0.6
): boolean => {
  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match or contains
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // Check each word in the text against the query
  const textWords = normalizedText.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);

  for (const queryWord of queryWords) {
    // Skip very short query words
    if (queryWord.length < 2) continue;

    let found = false;
    for (const textWord of textWords) {
      // For short words, require higher similarity
      const minThreshold = queryWord.length <= 3 ? 0.8 : threshold;
      
      if (
        textWord.includes(queryWord) ||
        queryWord.includes(textWord) ||
        similarityScore(textWord, queryWord) >= minThreshold
      ) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Check if the whole text contains a fuzzy match for the query word
      if (similarityScore(normalizedText, queryWord) < threshold) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Sort results by relevance score
 */
export const sortByRelevance = <T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] => {
  return [...items].sort((a, b) => {
    const textA = getSearchableText(a).toLowerCase();
    const textB = getSearchableText(b).toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact start match gets highest priority
    const aStartsWith = textA.startsWith(queryLower);
    const bStartsWith = textB.startsWith(queryLower);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;

    // Exact contains match gets second priority
    const aContains = textA.includes(queryLower);
    const bContains = textB.includes(queryLower);
    if (aContains && !bContains) return -1;
    if (bContains && !aContains) return 1;

    // Sort by similarity score
    const scoreA = similarityScore(textA, queryLower);
    const scoreB = similarityScore(textB, queryLower);
    return scoreB - scoreA;
  });
};

/**
 * Filter and sort items with fuzzy matching
 */
export const fuzzySearch = <T>(
  items: T[],
  query: string,
  getSearchableFields: (item: T) => string[],
  threshold = 0.5
): T[] => {
  if (!query.trim()) return items;

  const filtered = items.filter((item) => {
    const fields = getSearchableFields(item);
    return fields.some((field) => fuzzyMatch(field, query, threshold));
  });

  return sortByRelevance(filtered, query, (item) => 
    getSearchableFields(item).join(" ")
  );
};

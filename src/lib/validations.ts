
/**
 * Utility for common validation patterns across the platform
 */

export const patterns = {
  // Letters, spaces, and common name characters (-, .)
  letters: /^[a-zA-Z\s\-.]+$/,
  
  // Only digits
  numbers: /^[0-9]+$/,
  
  // Alpha-numeric
  alphaNumeric: /^[a-zA-Z0-9\s\-.]+$/,
};

export const validators = {
  /**
   * Validates if a string contains only letters and common name symbols
   */
  isLetters: (value: string) => patterns.letters.test(value),

  /**
   * Validates if a string contains only numbers
   */
  isNumbers: (value: string) => patterns.numbers.test(value),

  /**
   * Sanitizes input to only allow letters (used for onChange)
   */
  sanitizeLetters: (value: string) => value.replace(/[^a-zA-Z\s\-.]/g, ''),

  /**
   * Sanitizes input to only allow numbers (used for onChange)
   */
  sanitizeNumbers: (value: string) => value.replace(/[^0-9]/g, ''),

  /**
   * Gets word count of a string
   */
  getWordCount: (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  /**
   * Validates minimum word count
   */
  minWords: (text: string, min: number) => {
    return validators.getWordCount(text) >= min;
  },

  /**
   * Validates maximum word count
   */
  maxWords: (text: string, max: number) => {
    return validators.getWordCount(text) <= max;
  }
};

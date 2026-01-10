import { franc } from "franc-min";
import { LANGUAGE_MAP, RTL_LANGUAGES } from "./constants";

/**
 * Language detection utilities using franc-min library
 */

export interface LanguageDetectionResult {
  language: string;
  confidence: "high" | "low";
  code: string;
  isRTL: boolean;
}

/**
 * Detect the language of a given text
 * @param text - The text to analyze
 * @returns Language detection result with language name, confidence, code, and RTL flag
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  // Default to English for short or empty text
  if (!text || text.trim().length < 10) {
    return {
      language: "English",
      confidence: "low",
      code: "eng",
      isRTL: false,
    };
  }

  // Detect language using franc
  const langCode = franc(text, { minLength: 10 });

  // Handle undetermined language
  if (langCode === "und") {
    return {
      language: "English",
      confidence: "low",
      code: "eng",
      isRTL: false,
    };
  }

  // Get language name from map
  const language = LANGUAGE_MAP[langCode] || "English";

  // Determine if RTL
  const isRTL = RTL_LANGUAGES.includes(language as (typeof RTL_LANGUAGES)[number]);

  // Confidence is high if text is long enough
  const confidence = text.length >= 50 ? "high" : "low";

  return {
    language,
    confidence,
    code: langCode,
    isRTL,
  };
}

/**
 * Get all supported languages sorted alphabetically
 * @returns Array of supported language names
 */
export function getSupportedLanguages(): string[] {
  return Object.values(LANGUAGE_MAP).sort();
}

/**
 * Get language code from language name
 * @param languageName - The name of the language
 * @returns The ISO 639-3 code or undefined
 */
export function getLanguageCode(languageName: string): string | undefined {
  return Object.entries(LANGUAGE_MAP).find(
    ([, name]) => name.toLowerCase() === languageName.toLowerCase()
  )?.[0];
}

/**
 * Check if a language is RTL
 * @param language - The language name
 * @returns True if the language is RTL
 */
export function isRTLLanguage(language: string): boolean {
  return RTL_LANGUAGES.includes(language as (typeof RTL_LANGUAGES)[number]);
}

/**
 * Get the text direction for a language
 * @param language - The language name
 * @returns "rtl" or "ltr"
 */
export function getTextDirection(language: string): "rtl" | "ltr" {
  return isRTLLanguage(language) ? "rtl" : "ltr";
}

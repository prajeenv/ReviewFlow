# Multi-Language Support: ReviewFlow MVP Phase 1
## Native Multi-Language AI Response Generation

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Development  
**Supported Languages:** 40+ languages via Claude 3.5 Sonnet

---

## Document Purpose

This document provides complete implementation guide for ReviewFlow's multi-language capabilities. Use this as:
- **Implementation reference** for language detection and response generation
- **Supported languages reference** for all 40+ languages
- **Testing guide** for multi-language quality assurance
- **User documentation** for language features

**Related Documents:**
- See `02_PRD_MVP_PHASE1.md` for multi-language user stories and acceptance criteria
- See `01_PRODUCT_ONE_PAGER.md` for product positioning as multi-language platform
- See `04_DATA_MODEL.md` for language storage in Review model
- See `05_API_CONTRACTS.md` for language parameters in API endpoints

---

## Table of Contents

1. [Multi-Language Architecture](#multi-language-architecture)
2. [Language Detection](#language-detection)
3. [Supported Languages](#supported-languages)
4. [AI Response Generation](#ai-response-generation)
5. [UI Components](#ui-components)
6. [API Implementation](#api-implementation)
7. [Testing Multi-Language Features](#testing-multi-language-features)
8. [Quality Assurance](#quality-assurance)
9. [Troubleshooting](#troubleshooting)

---

## Multi-Language Architecture

### How Multi-Language Works in ReviewFlow

```
User Flow:

1. User pastes review in ANY language
   ↓
2. System detects language automatically (franc library)
   ↓
3. Language shown in UI: "🌍 Detected: Spanish"
   ↓
4. User can override if wrong (manual dropdown)
   ↓
5. User clicks "Generate Response"
   ↓
6. Claude generates response in SAME language
   ↓
7. Response is native-quality (not translated)
   ↓
8. User can edit and publish
```

### Why This Approach?

**✅ Native Generation (What We Use):**
```typescript
// One API call - Claude generates directly in Spanish
Input: "Excelente servicio!"
Prompt: "Respond in Spanish. Write natively..."
Output: "¡Muchas gracias por sus amables palabras!..."

Pros:
- Native-quality writing (sounds natural)
- Cultural nuances preserved
- Idioms used correctly
- One API call (fast, cheap)
- No translation errors
```

**❌ Translation Approach (What We DON'T Use):**
```typescript
// Two API calls - Generate in English, then translate
Input: "Excelente servicio!"
Translate to English: "Excellent service!"
Generate in English: "Thank you for your kind words!..."
Translate back to Spanish: "¡Gracias por sus amables palabras!..."

Cons:
- Sounds translated (awkward)
- Cultural nuances lost
- Two API calls (slow, expensive)
- Translation errors compound
```

---

## Language Detection

### Installation

```bash
npm install franc
npm install franc-min  # Lightweight version (recommended)

# TypeScript types
npm install -D @types/franc
```

### Language Detection Implementation

```typescript
// lib/language-detection.ts

import { franc } from "franc-min";  // Lightweight version

// ISO 639-3 to readable language name mapping
const LANGUAGE_MAP: Record<string, string> = {
  eng: "English",
  spa: "Spanish",
  fra: "French",
  deu: "German",
  ita: "Italian",
  por: "Portuguese",
  nld: "Dutch",
  pol: "Polish",
  rus: "Russian",
  jpn: "Japanese",
  cmn: "Chinese (Simplified)",
  kor: "Korean",
  ara: "Arabic",
  heb: "Hebrew",
  hin: "Hindi",
  tur: "Turkish",
  vie: "Vietnamese",
  tha: "Thai",
  ind: "Indonesian",
  msa: "Malay",
  fil: "Filipino",
  swe: "Swedish",
  dan: "Danish",
  fin: "Finnish",
  nor: "Norwegian",
  ces: "Czech",
  hun: "Hungarian",
  ron: "Romanian",
  ukr: "Ukrainian",
  cat: "Catalan",
  hrv: "Croatian",
  srp: "Serbian",
  slv: "Slovenian",
  bul: "Bulgarian",
  lit: "Lithuanian",
  lav: "Latvian",
  est: "Estonian",
  ben: "Bengali",
  tam: "Tamil",
  tel: "Telugu",
  mar: "Marathi",
  urd: "Urdu",
  fas: "Persian",
  // Add more as needed
};

interface LanguageDetectionResult {
  language: string;        // Readable name (e.g., "Spanish")
  confidence: "high" | "low";
  code: string;            // ISO 639-3 code
}

export function detectLanguage(text: string): LanguageDetectionResult {
  // Handle empty or very short text
  if (!text || text.trim().length < 10) {
    return {
      language: "English",
      confidence: "low",
      code: "eng"
    };
  }
  
  // Detect language with franc
  const langCode = franc(text, { minLength: 10 });
  
  // Check if detection failed
  if (langCode === "und") {
    return {
      language: "English",
      confidence: "low",
      code: "eng"
    };
  }
  
  // Map to readable name
  const language = LANGUAGE_MAP[langCode] || "English";
  
  // Determine confidence based on text length
  const confidence = text.length >= 50 ? "high" : "low";
  
  return {
    language,
    confidence,
    code: langCode
  };
}

// Alternative: Detect with options
export function detectLanguageAdvanced(
  text: string,
  options?: {
    minLength?: number;
    whitelist?: string[];  // Only consider these languages
    ignore?: string[];     // Ignore these languages
  }
): LanguageDetectionResult {
  if (!text || text.trim().length < (options?.minLength || 10)) {
    return {
      language: "English",
      confidence: "low",
      code: "eng"
    };
  }
  
  const francOptions: any = {
    minLength: options?.minLength || 10
  };
  
  if (options?.whitelist) {
    francOptions.only = options.whitelist;
  }
  
  if (options?.ignore) {
    francOptions.ignore = options.ignore;
  }
  
  const langCode = franc(text, francOptions);
  
  if (langCode === "und") {
    return {
      language: "English",
      confidence: "low",
      code: "eng"
    };
  }
  
  return {
    language: LANGUAGE_MAP[langCode] || "English",
    confidence: text.length >= 50 ? "high" : "low",
    code: langCode
  };
}

// Get all supported languages
export function getSupportedLanguages(): string[] {
  return Object.values(LANGUAGE_MAP).sort();
}
```

### Client-Side Language Detection

```typescript
// components/ReviewForm.tsx

"use client";

import { useState, useEffect } from "react";
import { detectLanguage } from "@/lib/language-detection";

export function ReviewForm() {
  const [reviewText, setReviewText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<"high" | "low">("low");
  
  // Detect language on blur or after typing stops
  useEffect(() => {
    if (!reviewText || reviewText.length < 10) {
      setDetectedLanguage(null);
      return;
    }
    
    // Debounce detection
    const timeoutId = setTimeout(() => {
      const result = detectLanguage(reviewText);
      setDetectedLanguage(result.language);
      setConfidence(result.confidence);
    }, 500);  // Wait 500ms after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [reviewText]);
  
  return (
    <div>
      <label>Review Text</label>
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Paste review here..."
        rows={6}
        className="w-full p-3 border rounded-md"
      />
      
      {detectedLanguage && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-gray-600">🌍 Detected:</span>
          <span className="font-medium text-gray-900">{detectedLanguage}</span>
          {confidence === "low" && (
            <span className="text-yellow-600 text-xs">(Low confidence)</span>
          )}
        </div>
      )}
      
      <p className="mt-1 text-sm text-gray-500">
        Language detected automatically. Wrong? Select manually below.
      </p>
    </div>
  );
}
```

### Manual Language Override

```typescript
// components/LanguageSelector.tsx

"use client";

import { useState } from "react";
import { getSupportedLanguages } from "@/lib/language-detection";

interface LanguageSelectorProps {
  detectedLanguage: string | null;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ 
  detectedLanguage, 
  onLanguageChange 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(detectedLanguage || "English");
  
  const supportedLanguages = getSupportedLanguages();
  
  const handleSelect = (language: string) => {
    setSelectedLanguage(language);
    onLanguageChange(language);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <span>Language: {selectedLanguage}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search languages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  // Filter languages (implement if needed)
                }}
              />
            </div>
            <div className="py-1">
              {supportedLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleSelect(language)}
                  className={`
                    block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                    ${language === selectedLanguage ? "bg-indigo-50 text-indigo-600" : "text-gray-700"}
                  `}
                >
                  {language}
                  {language === detectedLanguage && (
                    <span className="ml-2 text-xs text-gray-500">(Detected)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Supported Languages

### Complete Language List (40+ Languages)

ReviewFlow supports all languages that Claude 3.5 Sonnet supports natively:

**Western European Languages:**
```
✅ English
✅ Spanish (Español)
✅ French (Français)
✅ German (Deutsch)
✅ Italian (Italiano)
✅ Portuguese (Português)
✅ Dutch (Nederlands)
✅ Swedish (Svenska)
✅ Danish (Dansk)
✅ Norwegian (Norsk)
✅ Finnish (Suomi)
✅ Catalan (Català)
```

**Eastern European Languages:**
```
✅ Polish (Polski)
✅ Russian (Ру́сский)
✅ Czech (Čeština)
✅ Hungarian (Magyar)
✅ Romanian (Română)
✅ Ukrainian (Українська)
✅ Croatian (Hrvatski)
✅ Serbian (Српски)
✅ Slovenian (Slovenščina)
✅ Bulgarian (Български)
✅ Lithuanian (Lietuvių)
✅ Latvian (Latviešu)
✅ Estonian (Eesti)
```

**Asian Languages:**
```
✅ Chinese Simplified (简体中文)
✅ Chinese Traditional (繁體中文)
✅ Japanese (日本語)
✅ Korean (한국어)
✅ Hindi (हिन्दी)
✅ Bengali (বাংলা)
✅ Tamil (தமிழ்)
✅ Telugu (తెలుగు)
✅ Marathi (मराठी)
✅ Thai (ไทย)
✅ Vietnamese (Tiếng Việt)
✅ Indonesian (Bahasa Indonesia)
✅ Malay (Bahasa Melayu)
✅ Filipino (Tagalog)
```

**Middle Eastern Languages:**
```
✅ Arabic (العربية)
✅ Hebrew (עברית)
✅ Turkish (Türkçe)
✅ Persian (فارسی)
✅ Urdu (اردو)
```

### Language Support Matrix

| Language | Detection Accuracy | AI Response Quality | Notes |
|----------|-------------------|---------------------|-------|
| English | Excellent | Excellent | Default language |
| Spanish | Excellent | Excellent | High usage expected |
| French | Excellent | Excellent | High usage expected |
| German | Excellent | Excellent | High usage expected |
| Portuguese | Excellent | Excellent | Brazil + Portugal |
| Italian | Excellent | Excellent | - |
| Chinese (Simplified) | Excellent | Excellent | Mainland China |
| Japanese | Excellent | Excellent | - |
| Korean | Excellent | Excellent | - |
| Russian | Excellent | Excellent | - |
| Arabic | Very Good | Excellent | RTL supported |
| Hindi | Very Good | Excellent | - |
| Turkish | Very Good | Excellent | - |
| Polish | Very Good | Excellent | - |
| Dutch | Very Good | Excellent | - |
| All Others | Good | Very Good | Less common |

---

## AI Response Generation

### Prompt Engineering for Multi-Language

```typescript
// lib/ai/prompt-builder.ts

interface PromptOptions {
  reviewText: string;
  rating: number | null;
  language: string;
  brandVoice: {
    tone: string;
    formality: number;
    keyPhrases: string[];
    styleNotes?: string;
  };
}

export function buildMultiLanguagePrompt(options: PromptOptions): string {
  const { reviewText, rating, language, brandVoice } = options;
  
  return `You are responding to a customer review on behalf of a business.

CRITICAL LANGUAGE INSTRUCTION:
- The review is in ${language}
- You MUST respond in ${language}
- Write natively in ${language} as if you are a native speaker
- Do NOT translate from English
- Use natural ${language} expressions and idioms
- Match the formality level of the original review

Review Details:
- Rating: ${rating ? `${rating} stars` : "Not specified"}
- Review Text: "${reviewText}"

Brand Voice Guidelines:
- Tone: ${brandVoice.tone}
- Formality Level: ${brandVoice.formality}/5 (1=very casual, 5=very formal)
${brandVoice.keyPhrases.length > 0 ? `- Key Phrases to Include: ${brandVoice.keyPhrases.join(", ")}` : ""}
${brandVoice.styleNotes ? `- Style Notes: ${brandVoice.styleNotes}` : ""}

Response Instructions:
1. Write ONLY in ${language} (absolutely critical)
2. Keep response 50-150 words (concise but personal)
3. Match the brand voice and formality level
4. Be genuine and empathetic
5. For positive reviews: Thank them sincerely, reinforce positive elements
6. For negative reviews: Apologize genuinely, address concerns, offer solution
7. For neutral reviews: Thank them, encourage future business

Cultural Considerations:
- Use culturally appropriate greetings and sign-offs for ${language}
- Respect cultural communication norms
- Use appropriate levels of politeness for ${language}-speaking cultures

Generate ONLY the response text in ${language}. No labels, no explanations in English, no meta-commentary.`;
}

// Example usage
const prompt = buildMultiLanguagePrompt({
  reviewText: "Excelente servicio! El equipo fue muy atento.",
  rating: 5,
  language: "Spanish",
  brandVoice: {
    tone: "friendly",
    formality: 3,
    keyPhrases: ["Thank you", "We appreciate"],
    styleNotes: "Be warm and genuine"
  }
});
```

### AI Response Generation API

```typescript
// lib/ai/generate-response.ts

import Anthropic from "@anthropic-ai/sdk";
import { buildMultiLanguagePrompt } from "./prompt-builder";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateMultiLanguageResponse(
  reviewText: string,
  rating: number | null,
  language: string,
  brandVoice: any
): Promise<string> {
  // Build prompt with language instructions
  const prompt = buildMultiLanguagePrompt({
    reviewText,
    rating,
    language,
    brandVoice
  });
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    const generatedText = response.content[0].text;
    
    // Quality check: Verify response is in correct language
    const detectedResponseLanguage = detectLanguage(generatedText);
    
    if (detectedResponseLanguage.language !== language && detectedResponseLanguage.confidence === "high") {
      console.warn(`Warning: Expected ${language} but detected ${detectedResponseLanguage.language}`);
      // Could retry here, but Claude is usually accurate
    }
    
    return generatedText;
    
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate response");
  }
}
```

### Response Regeneration with Language Override

```typescript
// Allow user to regenerate in different language

export async function regenerateInDifferentLanguage(
  originalReviewText: string,
  originalRating: number | null,
  originalLanguage: string,
  targetLanguage: string,
  brandVoice: any,
  toneModifier?: string
): Promise<string> {
  // User wants response in different language than review
  // Example: Review in Spanish, but user wants to respond in English
  
  const prompt = `You are responding to a customer review on behalf of a business.

The review is in ${originalLanguage}, but you should respond in ${targetLanguage}.

Review (in ${originalLanguage}):
"${originalReviewText}"
Rating: ${originalRating} stars

Respond in ${targetLanguage}, addressing the points made in the review.
${toneModifier ? `Make the response ${toneModifier}.` : ""}

Keep response 50-150 words, ${brandVoice.tone} tone, formality level ${brandVoice.formality}/5.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }]
  });
  
  return response.content[0].text;
}
```

---

## UI Components

### Review Card with Language Display

```typescript
// components/ReviewCard.tsx

interface ReviewCardProps {
  review: {
    id: string;
    reviewText: string;
    rating: number | null;
    platform: string;
    detectedLanguage: string;
    sentiment: "positive" | "neutral" | "negative" | null;
    createdAt: Date;
  };
  onGenerateResponse: (reviewId: string) => void;
}

export function ReviewCard({ review, onGenerateResponse }: ReviewCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{review.platform}</span>
          {review.rating && (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < review.rating! ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
        
        {/* Language & Sentiment Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            🌍 {review.detectedLanguage}
          </span>
          {review.sentiment && (
            <span className={`
              inline-flex px-2 py-1 text-xs font-medium rounded
              ${review.sentiment === "positive" ? "bg-green-100 text-green-800" : ""}
              ${review.sentiment === "neutral" ? "bg-yellow-100 text-yellow-800" : ""}
              ${review.sentiment === "negative" ? "bg-red-100 text-red-800" : ""}
            `}>
              {review.sentiment === "positive" ? "😊 Positive" : ""}
              {review.sentiment === "neutral" ? "😐 Neutral" : ""}
              {review.sentiment === "negative" ? "😞 Negative" : ""}
            </span>
          )}
        </div>
      </div>
      
      {/* Review Text */}
      <p className="text-gray-900 mb-4">
        {review.reviewText}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
        
        <button
          onClick={() => onGenerateResponse(review.id)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          Generate Response
        </button>
      </div>
    </div>
  );
}
```

### Language Detection Indicator

```typescript
// components/LanguageDetectionIndicator.tsx

interface LanguageDetectionIndicatorProps {
  language: string;
  confidence: "high" | "low";
  onManualSelect: () => void;
}

export function LanguageDetectionIndicator({
  language,
  confidence,
  onManualSelect
}: LanguageDetectionIndicatorProps) {
  return (
    <div className={`
      flex items-center justify-between p-3 rounded-lg
      ${confidence === "high" ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}
    `}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Detected language: {language}
          </p>
          {confidence === "low" && (
            <p className="text-xs text-yellow-700">
              Low confidence - please verify
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={onManualSelect}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Change language
      </button>
    </div>
  );
}
```

---

## Multi-Language Text Editing

### Overview: Can Users Edit in 40+ Languages?

**YES!** ✅ Modern browsers natively support all 40+ languages through their built-in text input systems. You just need to configure the editor properly with:
1. UTF-8 encoding (standard)
2. Auto-detect text direction (RTL for Arabic/Hebrew)
3. Appropriate fonts for CJK languages
4. Let the browser handle input methods (Chinese pinyin, Japanese IME, Korean Hangul)

### Editor Strategy for ReviewFlow

**Phase 1 MVP: Plain Textarea (RECOMMENDED)** ✅

For review response editing, a plain textarea is sufficient and provides:
- ✅ Perfect multi-language support (all 40+ languages)
- ✅ Browser handles input methods automatically
- ✅ Zero compatibility issues
- ✅ Fast, simple, reliable
- ✅ No external dependencies

**Phase 2+: Rich Text Editor (Optional)** ⚠️

Only add rich text (bold, italic, etc.) if:
- Users explicitly request formatting
- You've validated it works with all languages
- You're willing to handle edge cases

For customer review responses, plain text is typically sufficient.

---

### Plain Textarea Implementation (Phase 1)

```typescript
// components/ResponseEditor.tsx

"use client";

import { useState, useEffect } from "react";

interface ResponseEditorProps {
  initialText: string;
  language: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function ResponseEditor({
  initialText,
  language,
  onSave,
  onCancel
}: ResponseEditorProps) {
  const [text, setText] = useState(initialText);
  const [charCount, setCharCount] = useState(initialText.length);
  const [isDirty, setIsDirty] = useState(false);
  
  // Auto-detect RTL languages
  const RTL_LANGUAGES = ["Arabic", "Hebrew", "Persian", "Urdu"];
  const isRTL = RTL_LANGUAGES.includes(language);
  
  // Get language code for browser optimization
  const getLanguageCode = (lang: string): string => {
    const codes: Record<string, string> = {
      "English": "en",
      "Spanish": "es",
      "French": "fr",
      "German": "de",
      "Italian": "it",
      "Portuguese": "pt",
      "Dutch": "nl",
      "Polish": "pl",
      "Russian": "ru",
      "Japanese": "ja",
      "Chinese (Simplified)": "zh-CN",
      "Chinese (Traditional)": "zh-TW",
      "Korean": "ko",
      "Arabic": "ar",
      "Hebrew": "he",
      "Hindi": "hi",
      "Turkish": "tr",
      "Vietnamese": "vi",
      "Thai": "th",
      "Indonesian": "id",
      "Swedish": "sv",
      "Danish": "da",
      "Finnish": "fi",
      "Norwegian": "no",
      "Czech": "cs",
      "Hungarian": "hu",
      "Romanian": "ro",
      "Ukrainian": "uk",
      "Bengali": "bn",
      "Tamil": "ta",
      "Telugu": "te",
      "Persian": "fa"
    };
    return codes[lang] || "en";
  };
  
  // Get appropriate font for CJK languages
  const getCJKFont = (lang: string): string => {
    const fonts: Record<string, string> = {
      "Chinese (Simplified)": '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
      "Chinese (Traditional)": '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif',
      "Japanese": '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif',
      "Korean": '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
    };
    return fonts[lang] || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  };
  
  // Accurate character count (handles emoji and multi-byte characters)
  useEffect(() => {
    setCharCount(Array.from(text).length);
  }, [text]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
  };
  
  const handleSave = () => {
    if (text.trim().length === 0) {
      alert("Response cannot be empty");
      return;
    }
    onSave(text);
  };
  
  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Edit Response
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            🌍 {language}
          </span>
          {isDirty && (
            <span className="text-xs text-yellow-600">
              (Unsaved changes)
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {charCount} characters
        </div>
      </div>
      
      {/* Multi-language textarea */}
      <textarea
        value={text}
        onChange={handleChange}
        dir={isRTL ? "rtl" : "ltr"}           // RTL support
        lang={getLanguageCode(language)}      // Browser optimization
        spellCheck={true}                     // Browser spell check
        className={`
          w-full p-4 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          resize-none
          ${isRTL ? "text-right" : "text-left"}
          transition-colors
        `}
        rows={12}
        placeholder={
          isRTL 
            ? "...قم بتحرير الرد هنا" 
            : "Edit response here..."
        }
        style={{
          fontFamily: getCJKFont(language),
          fontSize: "15px",
          lineHeight: "1.6",
        }}
      />
      
      {/* Helper text for special languages */}
      {isRTL && (
        <p className="text-xs text-gray-500 text-right">
          💡 نص من اليمين إلى اليسار تلقائياً
        </p>
      )}
      
      {["Japanese", "Chinese (Simplified)", "Chinese (Traditional)", "Korean"].includes(language) && (
        <p className="text-xs text-gray-500">
          💡 Your browser's input method will activate automatically for {language}
        </p>
      )}
      
      {/* Character limit warning */}
      {charCount > 450 && (
        <p className="text-xs text-yellow-600">
          ⚠️ Response is getting long ({charCount} chars). Consider keeping it under 500 characters.
        </p>
      )}
      
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setText(initialText)}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={text.trim().length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Response
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### How Browser Input Methods Work

**Users don't need to do anything special!** The browser automatically detects the language and provides the appropriate input method:

#### Latin Scripts (English, Spanish, French, German, etc.)
```
User types: "Hello" → Appears instantly
User types: "Hola" → Appears instantly
User types: "Bonjour" → Appears instantly

No special input method needed - just type normally.
```

#### Chinese Input (Pinyin)
```
User types: "ni hao"
Browser shows: [ 你好 | 您好 | 尼浩 | ... ]
User selects: "你好"
Text appears: "你好"

Browser handles this automatically with lang="zh-CN"!
```

#### Japanese Input (IME)
```
User types: "arigatou"
Browser shows: [ ありがとう | アリガトウ | 有難う | ... ]
User selects: "ありがとう"
Text appears: "ありがとう"

Browser handles this automatically with lang="ja"!
```

#### Korean Input (Hangul Composition)
```
User types: "ㄱ" + "ㅏ" + "ㅁ" + "ㅅ" + "ㅏ"
Browser composes: "감사"
Text appears: "감사"

Browser handles composition automatically with lang="ko"!
```

#### Arabic/Hebrew (RTL)
```
User types Arabic characters
Text flows: ← من اليمين إلى اليسار
Cursor moves: Right to left automatically

Browser handles RTL with dir="rtl"!
```

---

### Font Configuration for Multi-Language

```typescript
// styles/fonts.css

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');  /* Chinese Simplified */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap');  /* Chinese Traditional */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap');  /* Japanese */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap');  /* Korean */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic&display=swap');  /* Arabic */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew&display=swap');  /* Hebrew */

/* Or use system fonts for better performance */
.multi-language-text {
  font-family: 
    /* System fonts */
    -apple-system, BlinkMacSystemFont, "Segoe UI",
    /* CJK fonts */
    "Noto Sans SC", "Noto Sans TC", "Noto Sans JP", "Noto Sans KR",
    "Microsoft YaHei", "Hiragino Kaku Gothic Pro", "Malgun Gothic",
    /* Fallback */
    sans-serif;
}
```

**For MVP:** System fonts are sufficient. Only load web fonts if you need consistent branding across all platforms.

---

### RTL (Right-to-Left) Support

```typescript
// lib/text-direction.ts

export function isRTLLanguage(language: string): boolean {
  const RTL_LANGUAGES = [
    "Arabic",
    "Hebrew", 
    "Persian",
    "Urdu"
  ];
  return RTL_LANGUAGES.includes(language);
}

export function getTextDirection(language: string): "ltr" | "rtl" {
  return isRTLLanguage(language) ? "rtl" : "ltr";
}

// Usage in component
<div dir={getTextDirection(language)}>
  <p>{reviewText}</p>
  <textarea dir={getTextDirection(language)} />
</div>
```

**Important RTL Considerations:**
```
✅ DO:
- Set dir="rtl" on textarea
- Align text right for RTL
- Test with mixed bidirectional text (English + Arabic)
- Use logical properties (padding-inline-start instead of padding-left)

❌ DON'T:
- Assume all text is LTR
- Use fixed left/right positioning
- Forget to test Arabic/Hebrew
- Mirror UI elements (buttons stay in same position)
```

---

### Bidirectional Text (BiDi)

When mixing LTR and RTL text:

```typescript
// Example: English name in Arabic text
const text = "مرحبا John Smith كيف حالك؟";

// Browser automatically handles this!
// Display: "مرحبا John Smith كيف حالك؟"
//          ←RTL  →LTR       ←RTL

// Just set dir="auto" to let browser decide
<div dir="auto">{text}</div>
```

---

### Character Counting for Multi-Byte Characters

```typescript
// ❌ WRONG - Doesn't handle emoji/CJK properly
const count = text.length;  
// "Hello" = 5 ✅
// "你好" = 2 ✅  
// "👨‍👩‍👧‍👦" = 11 ❌ (should be 1)

// ✅ CORRECT - Handles all Unicode properly
const count = Array.from(text).length;
// "Hello" = 5 ✅
// "你好" = 2 ✅
// "👨‍👩‍👧‍👦" = 1 ✅

// Even better - count graphemes (user-perceived characters)
import { Segmenter } from 'intl-segmenter-polyfill';

function countCharacters(text: string): number {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(text)).length;
}
```

---

### Testing Multi-Language Editor

#### Manual Testing Checklist

**Latin Scripts:**
```
□ Type English - works normally
□ Type Spanish with accents (á, é, í, ó, ú, ñ) - displays correctly
□ Type French with accents (è, é, ê, ç, œ) - displays correctly
□ Type German with umlauts (ä, ö, ü, ß) - displays correctly
□ Copy/paste text - preserves all characters
□ Backspace/delete works correctly
```

**CJK (Chinese, Japanese, Korean):**
```
□ Type Chinese - pinyin input method appears automatically
□ Select characters from pinyin popup - inserts correctly
□ Type Japanese - IME shows kana → kanji conversion
□ Select kanji - inserts correctly
□ Type Korean - Hangul composition works (ㄱ+ㅏ = 가)
□ Cursor position correct during composition
□ Backspace during composition works correctly
□ Font displays all characters (no squares □)
```

**RTL (Right-to-Left):**
```
□ Type Arabic - text flows right-to-left automatically
□ Type Hebrew - text flows right-to-left automatically
□ Type Persian - text flows right-to-left automatically
□ Cursor starts at right edge
□ Cursor moves right-to-left as you type
□ Backspace removes character to the right
□ Mix English + Arabic - bidirectional text works
□ Selection highlights correctly in RTL
□ Copy/paste preserves directionality
```

**Complex Scripts:**
```
□ Type Hindi - Devanagari characters display correctly
□ Type Thai - tone marks position correctly above/below letters
□ Type Vietnamese - combining diacritics work (á, ă, â, đ, ê)
□ Type Bengali - ligatures form correctly
```

**Editor Features:**
```
□ Character count accurate for all scripts
□ Character count handles emoji correctly
□ Text wraps correctly for all languages
□ Scrolling works smoothly
□ Undo (Ctrl+Z / Cmd+Z) works
□ Redo (Ctrl+Y / Cmd+Shift+Z) works
□ Select all (Ctrl+A / Cmd+A) works
□ Cut (Ctrl+X / Cmd+X) preserves characters
□ Copy (Ctrl+C / Cmd+C) preserves characters
□ Paste (Ctrl+V / Cmd+V) preserves characters
□ Tab key inserts tab (if enabled)
□ Enter key creates new line
```

**Browser Spell Check:**
```
□ Spell check works for English
□ Spell check works for Spanish
□ Spell check works for French
□ Spell check disabled for CJK (browser handles this)
□ Red underline appears for misspelled words
□ Right-click shows spelling suggestions
```

---

### Common Issues & Solutions

#### Issue 1: RTL text displays left-to-right

**Symptom:**
```
Arabic text: "مرحبا بكم"
Displays as: "مرحبا بكم" (wrong direction)
```

**Solution:**
```typescript
// Add dir attribute to textarea
<textarea 
  dir={isRTL(language) ? "rtl" : "ltr"}
  className={isRTL(language) ? "text-right" : "text-left"}
/>

function isRTL(language: string): boolean {
  return ["Arabic", "Hebrew", "Persian", "Urdu"].includes(language);
}
```

---

#### Issue 2: Chinese/Japanese input method doesn't appear

**Symptom:**
```
User types "ni hao" but no pinyin popup appears
Just shows "ni hao" as English text
```

**Solution:**
```typescript
// Add lang attribute - browser activates IME automatically
<textarea 
  lang="zh-CN"  // Chinese Simplified
  // OR
  lang="ja"     // Japanese
  // OR
  lang="ko"     // Korean
/>

// Make sure you're not blocking browser defaults
// Don't use onKeyDown/onKeyPress that prevents composition
```

---

#### Issue 3: CJK characters display as squares (□□□)

**Symptom:**
```
Chinese text: "你好"
Displays as: "□□"
```

**Solution:**
```typescript
// Use fonts that support CJK
<textarea 
  style={{
    fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif'
  }}
/>

// Or load web fonts
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC" rel="stylesheet">
```

---

#### Issue 4: Emoji breaks character count

**Symptom:**
```
Text: "Hello 👨‍👩‍👧‍👦"
text.length = 16 (WRONG - should be 7)
```

**Solution:**
```typescript
// Use Array.from() for accurate count
const charCount = Array.from(text).length;  // ✅ 7

// NOT this:
const charCount = text.length;  // ❌ 16
```

---

#### Issue 5: Cursor position wrong during composition

**Symptom:**
```
Typing Japanese: "arigatou"
Cursor jumps around during IME composition
```

**Solution:**
```typescript
// Don't manipulate cursor during composition events
// Let browser handle it naturally

// ❌ DON'T do this:
onChange={(e) => {
  setText(e.target.value);
  e.target.setSelectionRange(0, 0);  // This breaks IME!
}}

// ✅ DO this:
onChange={(e) => {
  setText(e.target.value);
  // Don't touch cursor position
}}
```

---

#### Issue 6: Copy/paste loses special characters

**Symptom:**
```
Copy: "Café"
Paste: "Caf" (lost the é)
```

**Solution:**
```typescript
// Ensure UTF-8 encoding in HTML
<head>
  <meta charset="UTF-8" />
</head>

// Use proper event handlers
<textarea 
  onChange={(e) => setText(e.target.value)}  // ✅ Preserves all chars
/>

// Don't sanitize or filter input unless necessary
```

---

### Rich Text Editor (Phase 2+ Optional)

**Only consider rich text if:**
- ✅ Users explicitly request formatting features
- ✅ You've validated it works with all 40+ languages
- ✅ You're willing to handle edge cases and bugs

**Recommended editors with good multi-language support:**

#### 1. Lexical (by Meta) - BEST
```bash
npm install lexical @lexical/react

# Pros:
✅ Excellent multi-language support
✅ Maintained by Meta
✅ RTL support built-in
✅ CJK input methods work well
✅ Modern, extensible

# Cons:
⚠️ More complex than plain textarea
⚠️ Larger bundle size
```

#### 2. Tiptap
```bash
npm install @tiptap/react @tiptap/starter-kit

# Pros:
✅ Good multi-language support
✅ Built on ProseMirror
✅ Nice API
✅ Many extensions

# Cons:
⚠️ Test RTL carefully
⚠️ Some CJK edge cases
```

#### 3. ProseMirror
```bash
npm install prosemirror-state prosemirror-view prosemirror-model

# Pros:
✅ Rock-solid foundation
✅ Good multi-language support
✅ Very customizable

# Cons:
⚠️ Low-level API (complex)
⚠️ Steeper learning curve
```

**For ReviewFlow Phase 1: Stick with plain textarea.** Rich text adds complexity without significant value for review responses.

---

### Editor Accessibility (a11y)

```typescript
// Make editor accessible for all users
<div>
  <label 
    htmlFor="response-editor"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Edit Your Response ({language})
  </label>
  
  <textarea
    id="response-editor"
    aria-label={`Edit response in ${language}`}
    aria-describedby="editor-help"
    dir={isRTL(language) ? "rtl" : "ltr"}
    lang={getLanguageCode(language)}
    value={text}
    onChange={(e) => setText(e.target.value)}
  />
  
  <p id="editor-help" className="text-sm text-gray-500 mt-1">
    Response will be sent in {language}. Character count: {charCount}
  </p>
</div>
```

---

### Performance Considerations

**Plain Textarea:**
```
✅ Instant rendering
✅ No JavaScript overhead
✅ Browser-native performance
✅ Works offline
✅ Tiny bundle size (~0 KB)
```

**Rich Text Editor:**
```
⚠️ Slower initial render
⚠️ JavaScript overhead (50-200 KB)
⚠️ May lag with very long text
⚠️ Needs internet for CDN fonts
⚠️ Larger bundle size
```

**For 1,000+ character responses:** Plain textarea performs better.

---

### Recommendation Summary

**For ReviewFlow MVP (Phase 1):**

```typescript
✅ Use plain textarea
✅ Set dir="rtl" for Arabic/Hebrew/Persian/Urdu
✅ Set lang attribute for browser optimization
✅ Use system fonts (or load Noto Sans for CJK)
✅ Use Array.from() for character counting
✅ Let browser handle input methods (IME)
✅ Test with real multi-language text
✅ Keep it simple and reliable
```

**Skip for Phase 1:**
```
❌ Rich text formatting
❌ Complex editor libraries
❌ Custom input methods
❌ Markdown support (unless explicitly needed)
```

**Consider for Phase 2+ (if users request):**
```
⏳ Bold/italic/underline formatting
⏳ Bullet lists
⏳ Links in responses
⏳ But only if there's clear demand!
```

---

## API Implementation

### Add Review with Language Detection

```typescript
// app/api/reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { detectLanguage } from "@/lib/language-detection";
import { z } from "zod";

const reviewSchema = z.object({
  reviewText: z.string().min(1).max(2000),
  rating: z.number().min(1).max(5).optional().nullable(),
  platform: z.string(),
  reviewerName: z.string().optional().nullable(),
  reviewDate: z.coerce.date().optional().nullable(),
  languageOverride: z.string().optional()  // User can override detection
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validation.error.errors[0].message } },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Detect language (or use override)
    const languageResult = data.languageOverride 
      ? { language: data.languageOverride, confidence: "high" as const, code: "override" }
      : detectLanguage(data.reviewText);
    
    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        reviewText: data.reviewText,
        rating: data.rating,
        platform: data.platform,
        reviewerName: data.reviewerName,
        reviewDate: data.reviewDate,
        detectedLanguage: languageResult.language
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        review: {
          id: review.id,
          detectedLanguage: languageResult.language,
          confidence: languageResult.confidence
        }
      }
    });
    
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create review" } },
      { status: 500 }
    );
  }
}
```

### Generate Response with Language

```typescript
// app/api/responses/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { generateMultiLanguageResponse } from "@/lib/ai/generate-response";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { reviewId, targetLanguage } = await request.json();
    
    // Get review
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: user.id }
    });
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 }
      );
    }
    
    // Check credits
    if (user.credits < 1) {
      return NextResponse.json(
        { success: false, error: { code: "INSUFFICIENT_CREDITS", message: "Not enough credits" } },
        { status: 402 }
      );
    }
    
    // Get brand voice
    const brandVoice = await prisma.brandVoice.findUnique({
      where: { userId: user.id }
    });
    
    // Generate response in target language (default to review language)
    const language = targetLanguage || review.detectedLanguage;
    
    const responseText = await generateMultiLanguageResponse(
      review.reviewText,
      review.rating,
      language,
      brandVoice
    );
    
    // Save response and deduct credit (atomic transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credit
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
      });
      
      // Create response
      const response = await tx.reviewResponse.create({
        data: {
          reviewId: review.id,
          responseText,
          creditsUsed: 1
        }
      });
      
      // Log credit usage
      await tx.creditUsage.create({
        data: {
          userId: user.id,
          reviewId: review.id,
          reviewResponseId: response.id,
          creditsUsed: 1,
          action: "GENERATE_RESPONSE",
          details: JSON.stringify({
            reviewSnapshot: {
              text: review.reviewText.substring(0, 200),
              rating: review.rating,
              language: review.detectedLanguage
            },
            responseSnapshot: {
              text: responseText,
              generatedLanguage: language
            }
          })
        }
      });
      
      return response;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        response: {
          id: result.id,
          responseText: result.responseText,
          language
        },
        creditsRemaining: user.credits - 1
      }
    });
    
  } catch (error) {
    console.error("Response generation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "GENERATION_FAILED", message: "Failed to generate response" } },
      { status: 500 }
    );
  }
}
```

---

## Testing Multi-Language Features

### Manual Testing Checklist

**Language Detection:**
```
Test with various languages:
□ English text → Detects English
□ Spanish text → Detects Spanish
□ French text → Detects French
□ German text → Detects German
□ Chinese text → Detects Chinese
□ Arabic text → Detects Arabic
□ Very short text (<10 chars) → Defaults to English
□ Mixed language → Detects dominant language
□ Gibberish text → Defaults to English
```

**AI Response Generation:**
```
Test responses in each language:
□ English review → English response (native quality)
□ Spanish review → Spanish response (uses Spanish idioms)
□ French review → French response (proper formality)
□ German review → German response (compound words used naturally)
□ Japanese review → Japanese response (proper honorifics)
□ Arabic review → Arabic response (RTL formatting preserved)
□ Chinese review → Chinese response (appropriate characters)
□ Mixed review → Response in dominant language
```

**Language Override:**
```
Test manual language selection:
□ Auto-detect Spanish → Override to English → Response in English
□ Auto-detect wrong → Select correct → Response in correct language
□ Select rare language → Response generated successfully
```

**Quality Checks:**
```
□ Responses sound natural (not translated)
□ Cultural nuances preserved
□ Appropriate formality level
□ Correct idioms and expressions used
□ No English mixed into non-English responses
□ Grammar and spelling correct
□ Tone matches brand voice
```

### Automated Testing

```typescript
// __tests__/language-detection.test.ts

import { detectLanguage } from "@/lib/language-detection";

describe("Language Detection", () => {
  it("detects English correctly", () => {
    const text = "This is an excellent product. I highly recommend it to everyone!";
    const result = detectLanguage(text);
    
    expect(result.language).toBe("English");
    expect(result.confidence).toBe("high");
  });
  
  it("detects Spanish correctly", () => {
    const text = "Excelente servicio! El equipo fue muy atento y profesional.";
    const result = detectLanguage(text);
    
    expect(result.language).toBe("Spanish");
  });
  
  it("detects French correctly", () => {
    const text = "Service excellent! L'équipe était très professionnelle et attentive.";
    const result = detectLanguage(text);
    
    expect(result.language).toBe("French");
  });
  
  it("defaults to English for very short text", () => {
    const text = "Good";
    const result = detectLanguage(text);
    
    expect(result.language).toBe("English");
    expect(result.confidence).toBe("low");
  });
  
  it("defaults to English for empty text", () => {
    const text = "";
    const result = detectLanguage(text);
    
    expect(result.language).toBe("English");
    expect(result.confidence).toBe("low");
  });
});
```

### Test Data: Sample Reviews in Multiple Languages

```typescript
// test-data/multilingual-reviews.ts

export const TEST_REVIEWS = [
  {
    language: "English",
    text: "Great service! The team was very helpful and professional.",
    expectedResponse: "Thank you so much for your kind words! We're thrilled..."
  },
  {
    language: "Spanish",
    text: "¡Excelente servicio! El equipo fue muy atento y profesional.",
    expectedResponse: "¡Muchas gracias por sus amables palabras! Nos encanta..."
  },
  {
    language: "French",
    text: "Service excellent! L'équipe était très professionnelle.",
    expectedResponse: "Merci beaucoup pour vos aimables commentaires! Nous sommes ravis..."
  },
  {
    language: "German",
    text: "Ausgezeichneter Service! Das Team war sehr hilfsbereit.",
    expectedResponse: "Vielen Dank für Ihre freundlichen Worte! Wir freuen uns..."
  },
  {
    language: "Japanese",
    text: "素晴らしいサービスです!チームはとても親切でプロフェッショナルでした。",
    expectedResponse: "温かいお言葉をいただき、誠にありがとうございます..."
  },
  {
    language: "Chinese (Simplified)",
    text: "服务很棒!团队非常专业和乐于助人。",
    expectedResponse: "非常感谢您的好评!我们很高兴..."
  }
];
```

---

## Quality Assurance

### Response Quality Criteria

**Native-Level Quality Checklist:**
```
□ Grammar: Perfect grammar in target language
□ Vocabulary: Uses native vocabulary (not translated words)
□ Idioms: Uses language-appropriate idioms and expressions
□ Tone: Matches cultural communication norms
□ Formality: Appropriate formality level for culture
□ Flow: Reads naturally, not like a translation
□ Characters: Correct character set (if applicable)
□ Honorifics: Uses appropriate titles/honorifics (Japanese, Korean, etc.)
□ RTL: Right-to-left formatting preserved (Arabic, Hebrew)
```

### Common Quality Issues to Watch For

**❌ Machine Translation Artifacts:**
```
Bad (Translated):
"Gracias por su palabras amables" (word-for-word from English)

Good (Native):
"Muchas gracias por sus amables palabras" (natural Spanish)
```

**❌ Wrong Formality Level:**
```
Bad (Too informal in Japanese):
"ありがとう!" (casual - inappropriate for business)

Good (Appropriate formality):
"誠にありがとうございます。" (polite - appropriate)
```

**❌ Cultural Insensitivity:**
```
Bad (Western perspective in Chinese):
"God bless you!" (religious reference, not common in China)

Good (Culturally appropriate):
"祝您生活愉快!" (wishing happiness - more universal)
```

### Quality Monitoring

```typescript
// lib/quality/language-quality.ts

export async function validateResponseQuality(
  reviewLanguage: string,
  responseText: string
): Promise<{
  passed: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  // Check 1: Response is not empty
  if (!responseText || responseText.trim().length === 0) {
    issues.push("Response is empty");
  }
  
  // Check 2: Response language matches expected language
  const detectedLanguage = detectLanguage(responseText);
  if (detectedLanguage.language !== reviewLanguage && detectedLanguage.confidence === "high") {
    issues.push(`Expected ${reviewLanguage} but detected ${detectedLanguage.language}`);
  }
  
  // Check 3: Response length is reasonable (50-500 words)
  const wordCount = responseText.split(/\s+/).length;
  if (wordCount < 10) {
    issues.push("Response too short");
  }
  if (wordCount > 500) {
    issues.push("Response too long");
  }
  
  // Check 4: No obvious English mixed in (for non-English responses)
  if (reviewLanguage !== "English") {
    const englishWords = ["the", "and", "is", "are", "was", "were", "thank you"];
    const hasEnglish = englishWords.some(word => 
      responseText.toLowerCase().includes(` ${word} `)
    );
    if (hasEnglish) {
      issues.push("English words detected in non-English response");
    }
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}
```

---

## Troubleshooting

### Common Issues

#### 1. Language detection returns "English" for everything

**Cause:** Text too short or franc not installed properly

**Solution:**
```bash
# Reinstall franc
npm uninstall franc franc-min
npm install franc-min

# Check text length
console.log("Text length:", reviewText.length);
// Should be >10 characters for reliable detection

# Test manually
import { franc } from "franc-min";
console.log(franc("Excelente servicio!"));  // Should output "spa"
```

---

#### 2. AI response in wrong language

**Cause:** Prompt not emphasizing language strongly enough

**Solution:**
```typescript
// Add even more emphasis in prompt
const prompt = `CRITICAL: You MUST respond ONLY in ${language}.
DO NOT respond in English.
DO NOT translate.
Write natively in ${language}.

Review (in ${language}): "${reviewText}"

Response (in ${language}):`;
```

---

#### 3. Response quality is poor (sounds translated)

**Cause:** Claude falling back to English-first thinking

**Solution:**
```typescript
// Restructure prompt to prevent translation thinking
const prompt = `You are a native ${language} speaker responding to a customer.

Think in ${language}. Write in ${language}. Be natural.

Customer's review: "${reviewText}"

Your response:`;
```

---

#### 4. Incorrect language shown in UI

**Cause:** Language code mapping issue

**Solution:**
```typescript
// Check language map
console.log("Detected code:", langCode);
console.log("Mapped to:", LANGUAGE_MAP[langCode]);

// Add missing language to map
const LANGUAGE_MAP = {
  // ... existing mappings
  xxx: "Missing Language Name"  // Add missing mapping
};
```

---

#### 5. Chinese characters displaying incorrectly

**Cause:** Font or encoding issue

**Solution:**
```typescript
// Ensure UTF-8 encoding in HTML
<meta charset="UTF-8" />

// Use font that supports Chinese
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                 "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  }
</style>
```

---

#### 6. Arabic/Hebrew text not displaying right-to-left

**Cause:** Missing RTL directionality

**Solution:**
```typescript
// Detect RTL languages and set direction
const RTL_LANGUAGES = ["Arabic", "Hebrew", "Persian", "Urdu"];

function getTextDirection(language: string): "ltr" | "rtl" {
  return RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}

// Apply in component
<div dir={getTextDirection(review.detectedLanguage)}>
  {review.reviewText}
</div>
```

---

## Best Practices

### Do's ✅

```typescript
✅ Always detect language automatically first
✅ Allow user to override if detection is wrong
✅ Store detected language in database
✅ Emphasize language heavily in AI prompts
✅ Validate response is in correct language
✅ Support RTL languages (Arabic, Hebrew)
✅ Use appropriate fonts for all languages
✅ Test with native speakers when possible
✅ Log language quality issues for improvement
✅ Provide clear feedback about detected language
```

### Don'ts ❌

```typescript
❌ Don't translate responses (generate natively instead)
❌ Don't assume all users speak English
❌ Don't mix languages in single response
❌ Don't use English idioms in other languages
❌ Don't ignore cultural communication differences
❌ Don't force formality level across all languages
❌ Don't skip language validation
❌ Don't use narrow fonts that don't support CJK
❌ Don't ignore RTL text direction
❌ Don't make language selection mandatory
```

---

## Document Status

**Version:** 1.0  
**Status:** ✅ Ready for Development  
**Last Reviewed:** January 7, 2026  
**Next Review:** After MVP launch (Week 4)

**Related Documents:**
- See `02_PRD_MVP_PHASE1.md` for multi-language user stories
- See `01_PRODUCT_ONE_PAGER.md` for multi-language as core differentiator
- See `04_DATA_MODEL.md` for detectedLanguage field in Review model
- See `05_API_CONTRACTS.md` for language parameters in API

---

## Phase 0 Documentation Complete! 🎉

**All 9 Phase 0 documents are now finished:**
1. ✅ 01_PRODUCT_ONE_PAGER.md
2. ✅ 02_PRD_MVP_PHASE1.md
3. ✅ 03_USER_FLOWS.md
4. ✅ 04_DATA_MODEL.md
5. ✅ 05_API_CONTRACTS.md
6. ✅ 06_SECURITY_PRIVACY.md
7. ✅ 07_AUTHENTICATION_SYSTEM.md
8. ✅ 08_GDPR_COMPLIANCE.md
9. ✅ 09_MULTILANGUAGE_SUPPORT.md ⬅️ **COMPLETE**

**You're ready to start development!** 🚀

---

**This multi-language support system enables ReviewFlow to serve international customers with native-quality responses in 40+ languages.** 🌍

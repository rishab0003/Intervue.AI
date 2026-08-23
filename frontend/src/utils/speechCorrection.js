/**
 * speechCorrection.js — Intelligent Technical Speech-to-Text Aligner & Autocorrect
 * 
 * Corrects common Web Speech API phonetic mishearings, domain-specific tech jargon,
 * and aligns candidate spoken transcripts with the technical question context.
 */

// Comprehensive technical dictionary mapping phonetic misrecognitions to canonical terms
const TECHNICAL_DICTIONARY = [
  { pattern: /\btype\s*script(s|'s)?\b/gi, replacement: "TypeScript" },
  { pattern: /\bjava\s*script(s|'s)?\b/gi, replacement: "JavaScript" },
  { pattern: /\bre\s*act(s|ing)?\b/gi, replacement: "React" },
  { pattern: /\bno\s*d(\.|\s*)js\b/gi, replacement: "Node.js" },
  { pattern: /\bpost\s*gress?\s*(sql)?\b/gi, replacement: "PostgreSQL" },
  { pattern: /\bmongo\s*db\b/gi, replacement: "MongoDB" },
  { pattern: /\bmy\s*sequel\b/gi, replacement: "MySQL" },
  { pattern: /\bse\s*quel\b/gi, replacement: "SQL" },
  { pattern: /\ba\s*sync\b/gi, replacement: "async" },
  { pattern: /\ba\s*sync\s*(and|\/|\s*)\s*a\s*wait\b/gi, replacement: "async/await" },
  { pattern: /\bgraph\s*ql\b/gi, replacement: "GraphQL" },
  { pattern: /\bdoc\s*ker\b/gi, replacement: "Docker" },
  { pattern: /\bkube\s*rnetes?\b/gi, replacement: "Kubernetes" },
  { pattern: /\bmicro\s*service(s)?\b/gi, replacement: "microservices" },
  { pattern: /\bsee\s*eye\s*(and|\/|\s*)\s*see\s*dee\b/gi, replacement: "CI/CD" },
  { pattern: /\buse\s*state\b/gi, replacement: "useState" },
  { pattern: /\buse\s*effect\b/gi, replacement: "useEffect" },
  { pattern: /\buse\s*memo\b/gi, replacement: "useMemo" },
  { pattern: /\buse\s*call\s*back\b/gi, replacement: "useCallback" },
  { pattern: /\buse\s*context\b/gi, replacement: "useContext" },
  { pattern: /\buse\s*ref\b/gi, replacement: "useRef" },
  { pattern: /\bstar\s*method\b/gi, replacement: "STAR method" },
  { pattern: /\bbig\s*o(\s*notation)?\b/gi, replacement: "Big-O" },
  { pattern: /\blee?d\s*code\b/gi, replacement: "LeetCode" },
  { pattern: /\boop(s)?\b/gi, replacement: "OOP" },
  { pattern: /\bhttp(s)?\b/gi, replacement: "HTTP" },
  { pattern: /\brest\s*api(s)?\b/gi, replacement: "REST API" },
  { pattern: /\brest\s*ful\b/gi, replacement: "RESTful" },
  { pattern: /\bjwt\b/gi, replacement: "JWT" },
  { pattern: /\bjson\b/gi, replacement: "JSON" },
  { pattern: /\bhtml(5)?\b/gi, replacement: "HTML" },
  { pattern: /\bcss(3)?\b/gi, replacement: "CSS" },
  { pattern: /\btail\s*wind\b/gi, replacement: "Tailwind" },
  { pattern: /\bnext(\.|\s*)js\b/gi, replacement: "Next.js" },
  { pattern: /\bexpress(\.|\s*)js\b/gi, replacement: "Express.js" },
  { pattern: /\bweb\s*pack\b/gi, replacement: "Webpack" },
  { pattern: /\bvite\b/gi, replacement: "Vite" },
  { pattern: /\bgithub\b/gi, replacement: "GitHub" },
  { pattern: /\bgit\s*lab\b/gi, replacement: "GitLab" },
  { pattern: /\bredis\b/gi, replacement: "Redis" },
  { pattern: /\bkafka\b/gi, replacement: "Kafka" },
  { pattern: /\brabbit\s*mq\b/gi, replacement: "RabbitMQ" }
];

/**
 * Autocorrects raw spoken transcripts using technical dictionaries and question context alignment.
 * 
 * @param {string} rawTranscript - The raw string produced by Web Speech API
 * @param {string} questionText - Optional active interview question text for contextual fuzzy matching
 * @returns {string} Cleaned, phonetically aligned transcript
 */
export function correctSpeechTranscript(rawTranscript, questionText = "") {
  if (!rawTranscript || typeof rawTranscript !== "string") return "";

  let cleaned = rawTranscript;

  // Step 1: Run technical dictionary replacements
  TECHNICAL_DICTIONARY.forEach(({ pattern, replacement }) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  // Step 2: Contextual alignment with active question terms
  if (questionText && typeof questionText === "string") {
    // Extract prominent capitalized or technical terms from question
    const questionTerms = questionText.match(/\b[A-Z][a-zA-Z0-9\.\+\#\-]+\b/g) || [];
    const uniqueTerms = Array.from(new Set(questionTerms));

    uniqueTerms.forEach((term) => {
      if (term.length > 2 && !["What", "How", "Why", "Can", "You", "When", "Which", "Where", "Explain", "Describe", "Tell"].includes(term)) {
        // Create fuzzy pattern for space-separated version of term (e.g. "TypeScript" -> "type script")
        const spacedPattern = term.replace(/([a-z])([A-Z])/g, "$1\\s*$2");
        try {
          const reg = new RegExp(`\\b${spacedPattern}\\b`, "gi");
          cleaned = cleaned.replace(reg, term);
        } catch (e) {}
      }
    });
  }

  // Step 3: Punctuation and spacing cleanup
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\s+([,\.\?!])/g, "$1")
    .trim();

  // Capitalize first letter of transcript
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

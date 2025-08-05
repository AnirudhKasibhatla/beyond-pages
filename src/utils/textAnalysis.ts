// Simple heuristics to detect potential book quotes in text
export const detectPotentialQuote = (text: string): string | null => {
  // Remove extra whitespace and normalize
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  // Skip very short text
  if (cleanText.length < 20) return null;
  
  // Check for common quote indicators
  const quotePatterns = [
    // Text in quotes
    /"([^"]{20,})"/g,
    /'([^']{20,})'/g,
    // Text that starts with capital and ends with punctuation (potential quote)
    /\b[A-Z][^.!?]*[.!?]\s*$/g,
    // Poetic or literary patterns
    /\b[A-Z][^.!?]*(?:love|life|heart|soul|dreams?|hope|fear|death|time|world|beauty|truth|pain|joy|sorrow)[^.!?]*[.!?]/gi,
  ];
  
  for (const pattern of quotePatterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      // Return the longest match that seems like a meaningful quote
      const longestMatch = matches.reduce((longest, current) => 
        current.length > longest.length ? current : longest, ''
      );
      
      // Clean up the match (remove quotes if present)
      const cleaned = longestMatch.replace(/^["']|["']$/g, '').trim();
      
      // Ensure it's substantial enough
      if (cleaned.length >= 20 && cleaned.length <= 500) {
        return cleaned;
      }
    }
  }
  
  // Check for sentences that might be inspirational or quote-like
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    
    // Look for philosophical, inspirational, or literary language
    const literaryKeywords = [
      'life', 'love', 'heart', 'soul', 'dreams', 'hope', 'fear', 'death', 
      'time', 'world', 'beauty', 'truth', 'pain', 'joy', 'sorrow', 'wisdom',
      'forever', 'always', 'never', 'everything', 'nothing', 'universe',
      'destiny', 'journey', 'path', 'light', 'darkness', 'freedom'
    ];
    
    const hasLiteraryLanguage = literaryKeywords.some(keyword => 
      trimmed.toLowerCase().includes(keyword)
    );
    
    // Check for poetic structure (metaphors, imagery)
    const poeticPatterns = [
      /like\s+(?:a|an|the)\s+\w+/i, // similes
      /is\s+(?:a|an|the)\s+\w+/i,   // metaphors
      /\b(?:whisper|dance|shine|glow|flow|flutter|soar)\b/i, // imagery words
    ];
    
    const hasPoetry = poeticPatterns.some(pattern => pattern.test(trimmed));
    
    if ((hasLiteraryLanguage || hasPoetry) && trimmed.length >= 30 && trimmed.length <= 300) {
      return trimmed;
    }
  }
  
  return null;
};
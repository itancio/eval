import { TextAnalyzer } from '../types';

export class RelevancyAnalyzer implements TextAnalyzer {
  analyze(text: string): number {
    if (!text) return 0;
    
    let score = 0;
    
    // Check for direct answer patterns
    if (/^(here|to answer|regarding|about)/i.test(text)) {
      score += 0.2;
    }
    
    // Check for question-specific keywords
    const questionKeywords = text.toLowerCase().match(/\b(how|what|why|when|where|which)\b/g) || [];
    score += Math.min(questionKeywords.length * 0.1, 0.2);
    
    // Check for technical accuracy
    const technicalPatterns = [
      /\b\w+\(\)/g, // Function calls
      /\bnew\s+\w+/g, // Object instantiation
      /\b(async|await)\b/g, // Async patterns
      /\b(try|catch)\b/g, // Error handling
      /\b(import|export)\b/g // Module syntax
    ];
    
    for (const pattern of technicalPatterns) {
      if (pattern.test(text)) {
        score += 0.1;
      }
    }
    
    // Check for code examples when discussing code
    if (text.toLowerCase().includes('code') && text.includes('```')) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }
}
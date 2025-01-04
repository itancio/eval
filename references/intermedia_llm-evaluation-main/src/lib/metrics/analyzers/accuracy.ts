import { TextAnalyzer } from '../types';

export class AccuracyAnalyzer implements TextAnalyzer {
  analyze(text: string): number {
    if (!text) return 0;
    
    let score = 0;
    
    // Check for code blocks
    const codeBlocks = text.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      score += 0.2;
      // Check for proper syntax in code blocks
      if (codeBlocks.some(block => /function|class|const|let|var/g.test(block))) {
        score += 0.1;
      }
    }
    
    // Check for technical terms
    const technicalTerms = /\b(function|api|component|server|database|algorithm|interface|class|method)\b/gi;
    const termMatches = text.match(technicalTerms) || [];
    score += Math.min(termMatches.length * 0.05, 0.2);
    
    // Check for explanations
    if (/because|therefore|thus|hence|as a result/i.test(text)) {
      score += 0.2;
    }
    
    // Check for examples
    if (/for example|such as|like|consider/i.test(text)) {
      score += 0.15;
    }
    
    // Check for structured content
    if (text.includes('\n') && /^[-*•]|\d+\./m.test(text)) {
      score += 0.15;
    }
    
    return Math.min(score, 1);
  }
}
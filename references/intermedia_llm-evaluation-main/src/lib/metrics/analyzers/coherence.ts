import { TextAnalyzer } from '../types';

export class CoherenceAnalyzer implements TextAnalyzer {
  analyze(text: string): number {
    if (!text) return 0;
    
    let score = 0;
    
    // Check for logical flow markers
    const flowMarkers = [
      'first', 'second', 'third', 'finally',
      'next', 'then', 'after', 'before',
      'however', 'therefore', 'thus', 'consequently'
    ];
    
    for (const marker of flowMarkers) {
      if (new RegExp(`\\b${marker}\\b`, 'i').test(text)) {
        score += 0.1;
      }
    }
    
    // Check for paragraph structure
    const paragraphs = text.split('\n\n');
    if (paragraphs.length >= 2) {
      score += 0.2;
    }
    
    // Check for section headers
    if (/^#+\s.+$/m.test(text)) {
      score += 0.2;
    }
    
    // Check for consistent terminology
    const terms = new Set(text.toLowerCase().match(/\b\w+\b/g) || []);
    if (terms.size > 20) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }
}
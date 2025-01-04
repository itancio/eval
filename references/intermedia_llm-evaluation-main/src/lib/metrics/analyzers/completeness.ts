import { TextAnalyzer } from '../types';

export class CompletenessAnalyzer implements TextAnalyzer {
  analyze(text: string): number {
    if (!text) return 0;
    
    let score = 0;
    
    // Check for comprehensive structure
    if (text.length > 200) score += 0.2;
    if (text.length > 500) score += 0.1;
    
    // Check for code examples when needed
    if (text.toLowerCase().includes('code') || text.toLowerCase().includes('implementation')) {
      score += text.includes('```') ? 0.2 : 0;
    }
    
    // Check for explanations
    const explanationPatterns = [
      /because/i, /this means/i, /in other words/i,
      /specifically/i, /for instance/i, /namely/i
    ];
    
    for (const pattern of explanationPatterns) {
      if (pattern.test(text)) score += 0.1;
    }
    
    // Check for examples
    const exampleCount = (text.match(/(?:for example|such as|like|consider)/gi) || []).length;
    score += Math.min(exampleCount * 0.1, 0.2);
    
    // Check for conclusion
    if (/(finally|in conclusion|to summarize|in summary)/i.test(text)) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }
}
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDciyXKlYPJGvwHmnYJwIIodBTyrp5Wy64';

export interface SnippetRequest {
  packageName: string;
  usageDescription: string;
  readme?: string;
}

export interface SnippetResponse {
  code: string;
  explanation?: string;
  error?: string;
}

export class GeminiApiService {
  private static genAI = new GoogleGenerativeAI(API_KEY);
  private static model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  static async generateSnippet(request: SnippetRequest): Promise<SnippetResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract code from the response
      const codeMatch = text.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1].trim() : text.trim();

      // Extract explanation if present
      const explanationMatch = text.match(/```[\s\S]*?```\n\n([\s\S]*)/);
      const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

      return {
        code,
        explanation
      };
    } catch (error) {
      console.error('Error generating snippet:', error);
      return {
        code: '',
        error: error instanceof Error ? error.message : 'Failed to generate snippet'
      };
    }
  }

  private static buildPrompt(request: SnippetRequest): string {
    let prompt = `Generate a JavaScript code snippet demonstrating how to use the npm package "${request.packageName}" to ${request.usageDescription}.

Make it concise, clear, and beginner-friendly. Include basic import/require statements and example usage.

Requirements:
- Use modern ES6+ syntax with import statements
- Include practical, working examples
- Add brief comments explaining key parts
- Keep it under 50 lines of code
- Focus on the most common use cases
- Make it copy-paste ready

Package: ${request.packageName}
Usage: ${request.usageDescription}`;

    if (request.readme && request.readme.length > 0) {
      // Truncate readme if too long to avoid token limits
      const truncatedReadme = request.readme.length > 2000 
        ? request.readme.substring(0, 2000) + '...'
        : request.readme;
      
      prompt += `\n\nPackage README (for context):\n${truncatedReadme}`;
    }

    prompt += `\n\nPlease respond with ONLY the JavaScript code wrapped in \`\`\`javascript code blocks. Do not include any explanatory text outside the code block.`;

    return prompt;
  }

  static getCommonUsageDescriptions(packageName: string): string[] {
    const commonUsages = [
      'perform basic operations',
      'handle HTTP requests',
      'manipulate data',
      'create a simple example',
      'set up basic configuration',
      'implement common functionality'
    ];

    // Package-specific suggestions
    const packageSpecific: Record<string, string[]> = {
      'react': [
        'create a functional component',
        'manage state with hooks',
        'handle events',
        'render a list of items'
      ],
      'express': [
        'create a basic server',
        'handle GET and POST routes',
        'add middleware',
        'serve static files'
      ],
      'lodash': [
        'manipulate arrays',
        'work with objects',
        'perform data transformations',
        'use utility functions'
      ],
      'axios': [
        'make HTTP GET requests',
        'make HTTP POST requests',
        'handle API responses',
        'configure request interceptors'
      ],
      'moment': [
        'format dates',
        'parse date strings',
        'calculate date differences',
        'work with timezones'
      ]
    };

    const specific = packageSpecific[packageName.toLowerCase()] || [];
    return [...specific, ...commonUsages];
  }
}
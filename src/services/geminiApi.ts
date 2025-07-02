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

export interface SecurityAnalysisRequest {
  scanResults: Array<{
    package: string;
    version: string;
    vulnerabilities: Array<{
      id: string;
      summary: string;
      severity: string;
    }>;
    deprecated: boolean;
    license: string;
  }>;
}

export interface SecurityAnalysisResponse {
  vulnerabilityExplanations: string;
  fixSuggestions: string;
  riskSummary: string;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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

  static async analyzeSecurityScan(request: SecurityAnalysisRequest): Promise<SecurityAnalysisResponse> {
    try {
      const prompt = this.buildSecurityAnalysisPrompt(request);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the structured response
      const sections = this.parseSecurityAnalysisResponse(text);
      
      return {
        vulnerabilityExplanations: sections.explanations,
        fixSuggestions: sections.fixes,
        riskSummary: sections.summary,
        overallRiskLevel: sections.riskLevel
      };
    } catch (error) {
      console.error('Error analyzing security scan:', error);
      return {
        vulnerabilityExplanations: '',
        fixSuggestions: '',
        riskSummary: '',
        overallRiskLevel: 'MEDIUM',
        error: error instanceof Error ? error.message : 'Failed to analyze security scan'
      };
    }
  }

  private static buildSecurityAnalysisPrompt(request: SecurityAnalysisRequest): string {
    const { scanResults } = request;
    
    const vulnerablePackages = scanResults.filter(pkg => pkg.vulnerabilities.length > 0 || pkg.deprecated);
    const totalVulnerabilities = scanResults.reduce((acc, pkg) => acc + pkg.vulnerabilities.length, 0);
    const criticalCount = scanResults.reduce((acc, pkg) => 
      acc + pkg.vulnerabilities.filter(v => v.severity === 'CRITICAL').length, 0);
    const highCount = scanResults.reduce((acc, pkg) => 
      acc + pkg.vulnerabilities.filter(v => v.severity === 'HIGH').length, 0);
    const deprecatedCount = scanResults.filter(pkg => pkg.deprecated).length;

    let prompt = `You are a cybersecurity expert analyzing npm package vulnerabilities. Please provide a comprehensive security analysis based on the following scan results:

SCAN SUMMARY:
- Total packages scanned: ${scanResults.length}
- Packages with vulnerabilities: ${vulnerablePackages.length}
- Total vulnerabilities found: ${totalVulnerabilities}
- Critical severity: ${criticalCount}
- High severity: ${highCount}
- Deprecated packages: ${deprecatedCount}

DETAILED SCAN RESULTS:
`;

    scanResults.forEach(pkg => {
      prompt += `\nPackage: ${pkg.package}@${pkg.version}
License: ${pkg.license}
Deprecated: ${pkg.deprecated ? 'Yes' : 'No'}
Vulnerabilities (${pkg.vulnerabilities.length}):
`;
      
      pkg.vulnerabilities.forEach(vuln => {
        prompt += `  - ${vuln.id}: ${vuln.summary} (${vuln.severity})\n`;
      });
    });

    prompt += `

Please provide your analysis in the following structured format:

## VULNERABILITY EXPLANATIONS ##
[Explain the most critical vulnerabilities found, what they mean, and their potential impact. Focus on the highest severity issues first. Be clear and non-technical for developers who may not be security experts.]

## FIX SUGGESTIONS ##
[Provide specific, actionable recommendations for fixing the vulnerabilities. Include version upgrades, alternative packages, configuration changes, or mitigation strategies. Prioritize fixes by severity and impact.]

## RISK SUMMARY ##
[Provide an overall assessment of the security posture. Explain the business risk, urgency of fixes needed, and any immediate actions required. Include a final risk level: LOW, MEDIUM, HIGH, or CRITICAL.]

RISK_LEVEL: [LOW|MEDIUM|HIGH|CRITICAL]

Keep your response practical, actionable, and focused on helping developers understand and fix security issues quickly.`;

    return prompt;
  }

  private static parseSecurityAnalysisResponse(text: string): {
    explanations: string;
    fixes: string;
    summary: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  } {
    // Extract sections using regex patterns
    const explanationsMatch = text.match(/## VULNERABILITY EXPLANATIONS ##\s*([\s\S]*?)(?=## FIX SUGGESTIONS ##|$)/);
    const fixesMatch = text.match(/## FIX SUGGESTIONS ##\s*([\s\S]*?)(?=## RISK SUMMARY ##|$)/);
    const summaryMatch = text.match(/## RISK SUMMARY ##\s*([\s\S]*?)(?=RISK_LEVEL:|$)/);
    const riskLevelMatch = text.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/);

    return {
      explanations: explanationsMatch ? explanationsMatch[1].trim() : 'No vulnerability explanations available.',
      fixes: fixesMatch ? fixesMatch[1].trim() : 'No fix suggestions available.',
      summary: summaryMatch ? summaryMatch[1].trim() : 'No risk summary available.',
      riskLevel: (riskLevelMatch ? riskLevelMatch[1] : 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    };
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
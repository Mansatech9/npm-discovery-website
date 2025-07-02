import { GeminiApiService } from './geminiApi';
import { BonsaiApiService, EnhancedSearchResult } from './bonsaiApi';
import { NPMApiService } from './npmApi';

export class EnhancedSearchApiService {
  static async searchWithAI(
    originalQuery: string, 
    size: number = 20, 
    from: number = 0
  ): Promise<EnhancedSearchResult> {
    try {
      // Step 1: Check if Bonsai is available
      const isBonsaiHealthy = await BonsaiApiService.checkIndexHealth();
      
      if (!isBonsaiHealthy) {
        console.warn('Bonsai unavailable, falling back to NPM registry');
        return this.fallbackToNPMSearch(originalQuery, size, from);
      }

      // Step 2: Use AI to rewrite the query semantically
      const rewrittenQuery = await this.rewriteQueryWithAI(originalQuery);
      console.log('Original query:', originalQuery);
      console.log('Rewritten query:', rewrittenQuery);
      
      // Step 3: Search Bonsai with the enhanced query
      const bonsaiResponse = await BonsaiApiService.searchWithSemanticQuery(
        rewrittenQuery, 
        size, 
        from
      );

      // Step 4: Convert Bonsai results to NPM format
      const packages = BonsaiApiService.convertBonsaiToNPMFormat(bonsaiResponse.hits.hits);

      // Step 5: If no results from Bonsai, try NPM as fallback
      if (packages.length === 0) {
        console.log('No Bonsai results, trying NPM fallback');
        return this.fallbackToNPMSearch(originalQuery, size, from);
      }

      return {
        packages,
        total: bonsaiResponse.hits.total.value,
        source: 'bonsai',
        rewrittenQuery
      };

    } catch (error) {
      console.error('Enhanced search failed, falling back to NPM:', error);
      return this.fallbackToNPMSearch(originalQuery, size, from);
    }
  }

  private static async rewriteQueryWithAI(originalQuery: string): Promise<string> {
    try {
      const prompt = `You are a smart search assistant for npm packages. Transform the user's query into search terms that will find relevant packages.

Rules:
1. Include the original terms
2. Add synonyms and related technical terms
3. Include common package naming patterns
4. Add related technologies
5. Separate terms with spaces (not commas)
6. Keep it concise and focused

Examples:
- "react print" → "react print printing react-to-print jspdf html2canvas pdf browser-print"
- "chart library" → "chart charting visualization graph plot d3 canvas svg data"
- "http client" → "http https request client fetch axios ajax api rest"

User query: "${originalQuery}"

Respond with ONLY the enhanced search terms separated by spaces:`;

      const result = await GeminiApiService.model.generateContent(prompt);
      const response = await result.response;
      let rewrittenQuery = response.text().trim();

      // Clean up the response - remove quotes and extra formatting
      rewrittenQuery = rewrittenQuery
        .replace(/['"]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Fallback to original query if AI fails or returns empty
      return rewrittenQuery || originalQuery;
    } catch (error) {
      console.warn('AI query rewriting failed, using original query:', error);
      return originalQuery;
    }
  }

  private static async fallbackToNPMSearch(
    query: string, 
    size: number, 
    from: number
  ): Promise<EnhancedSearchResult> {
    try {
      const npmResponse = await NPMApiService.searchPackages(query, size, from);
      return {
        packages: npmResponse.objects,
        total: npmResponse.total,
        source: 'npm'
      };
    } catch (error) {
      console.error('NPM fallback search failed:', error);
      return {
        packages: [],
        total: 0,
        source: 'npm'
      };
    }
  }

  private static async enhanceWithNPMData(packages: any[]): Promise<any[]> {
    // For now, return packages as-is
    // In the future, we could fetch additional data from NPM registry
    // for packages that need more complete information
    return packages;
  }

  static async getPackageDownloadStats(packageNames: string[]): Promise<Record<string, any>> {
    const downloadStats: Record<string, any> = {};
    
    // Batch fetch download stats from NPM registry
    const promises = packageNames.slice(0, 10).map(async (packageName) => {
      try {
        const response = await fetch(`https://api.npmjs.org/downloads/point/last-month/${packageName}`);
        if (response.ok) {
          const data = await response.json();
          downloadStats[packageName] = {
            monthly: data.downloads || 0,
            weekly: Math.round((data.downloads || 0) / 4)
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch downloads for ${packageName}:`, error);
      }
    });

    await Promise.allSettled(promises);
    return downloadStats;
  }
}
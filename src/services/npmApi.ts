import { NPMSearchResponse, PackageDetails } from '../types/npm';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';

export class NPMApiService {
  static async searchPackages(query: string, size: number = 20, from: number = 0): Promise<NPMSearchResponse> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`${NPM_SEARCH_URL}?text=${encodedQuery}&size=${size}&from=${from}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching packages:', error);
      throw error;
    }
  }

  static async getPackageDetails(packageName: string): Promise<PackageDetails> {
    try {
      const response = await fetch(`${NPM_REGISTRY_URL}/${packageName}`);
      
      if (!response.ok) {
        throw new Error(`Package fetch failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  }

  static formatDownloadCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  static getPackageScore(score: number): string {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  }

  static getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-blue-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  }
}
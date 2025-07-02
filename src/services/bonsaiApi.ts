export interface BonsaiSearchResult {
  _source: {
    name: string;
    description: string;
    keywords: string[];
    version: string;
    author?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    downloads?: {
      monthly: number;
      weekly: number;
    };
    score?: {
      final: number;
      detail: {
        quality: number;
        popularity: number;
        maintenance: number;
      };
    };
  };
  _score: number;
}

export interface BonsaiSearchResponse {
  hits: {
    total: {
      value: number;
    };
    hits: BonsaiSearchResult[];
  };
}

export interface EnhancedSearchResult {
  packages: any[];
  total: number;
  source: 'bonsai' | 'npm' | 'hybrid';
  rewrittenQuery?: string;
}

export class BonsaiApiService {
  private static readonly BONSAI_BASE_URL = 'https://npm-discovery-3909985304.us-east-1.bonsaisearch.net:443';
  private static readonly BONSAI_USERNAME = 'tk57ldrt5a';
  private static readonly BONSAI_PASSWORD = 'zx1x6ny91i';
  private static readonly INDEX_NAME = 'npm-packages';

  private static getAuthHeaders(): HeadersInit {
    const credentials = btoa(`${this.BONSAI_USERNAME}:${this.BONSAI_PASSWORD}`);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    };
  }

  static async searchPackages(query: string, size: number = 20, from: number = 0): Promise<BonsaiSearchResponse> {
    try {
      const searchBody = {
        size,
        from,
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'description', 'keywords^2', 'author'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        },
        sort: [
          { '_score': { order: 'desc' } },
          { 'downloads.monthly': { order: 'desc', missing: '_last' } }
        ]
      };

      const response = await fetch(`${this.BONSAI_BASE_URL}/${this.INDEX_NAME}/_search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Bonsai search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bonsai search error:', error);
      throw error;
    }
  }

  static async searchWithSemanticQuery(semanticQuery: string, size: number = 20, from: number = 0): Promise<BonsaiSearchResponse> {
    try {
      const searchBody = {
        size,
        from,
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: semanticQuery,
                  fields: ['name^4', 'description^2', 'keywords^3'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  boost: 2
                }
              },
              {
                match: {
                  description: {
                    query: semanticQuery,
                    operator: 'or',
                    boost: 1.5
                  }
                }
              },
              {
                terms: {
                  keywords: semanticQuery.toLowerCase().split(' '),
                  boost: 1.8
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        sort: [
          { '_score': { order: 'desc' } },
          { 'downloads.monthly': { order: 'desc', missing: '_last' } }
        ],
        highlight: {
          fields: {
            name: {},
            description: {},
            keywords: {}
          }
        }
      };

      const response = await fetch(`${this.BONSAI_BASE_URL}/${this.INDEX_NAME}/_search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Bonsai semantic search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bonsai semantic search error:', error);
      throw error;
    }
  }

  static convertBonsaiToNPMFormat(bonsaiResults: BonsaiSearchResult[]): any[] {
    return bonsaiResults.map(result => ({
      package: {
        name: result._source.name,
        version: result._source.version || 'latest',
        description: result._source.description || '',
        keywords: result._source.keywords || [],
        date: new Date().toISOString(), // Fallback date
        license: result._source.license,
        links: {
          npm: `https://www.npmjs.com/package/${result._source.name}`,
          homepage: result._source.homepage,
          repository: result._source.repository
        },
        author: result._source.author,
        publisher: {
          username: 'unknown',
          email: 'unknown'
        },
        maintainers: []
      },
      score: result._source.score || {
        final: result._score / 10, // Normalize Elasticsearch score
        detail: {
          quality: 0.5,
          popularity: 0.5,
          maintenance: 0.5
        }
      },
      downloads: result._source.downloads,
      searchScore: result._score,
      flags: {}
    }));
  }

  static async checkIndexHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BONSAI_BASE_URL}/_cluster/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        return false;
      }

      const health = await response.json();
      return health.status === 'green' || health.status === 'yellow';
    } catch (error) {
      console.error('Bonsai health check failed:', error);
      return false;
    }
  }
}
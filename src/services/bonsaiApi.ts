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

  static async checkIndexExists(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BONSAI_BASE_URL}/${this.INDEX_NAME}`, {
        method: 'HEAD',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Index existence check failed:', error);
      return false;
    }
  }

  static async createIndex(): Promise<boolean> {
    try {
      const indexMapping = {
        mappings: {
          properties: {
            name: {
              type: 'text',
              analyzer: 'standard',
              fields: {
                keyword: {
                  type: 'keyword'
                },
                ngram: {
                  type: 'text',
                  analyzer: 'ngram_analyzer'
                }
              }
            },
            description: {
              type: 'text',
              analyzer: 'standard',
              fields: {
                ngram: {
                  type: 'text',
                  analyzer: 'ngram_analyzer'
                }
              }
            },
            keywords: {
              type: 'keyword',
              fields: {
                text: {
                  type: 'text',
                  analyzer: 'standard'
                }
              }
            },
            version: {
              type: 'keyword'
            },
            author: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword'
                }
              }
            },
            license: {
              type: 'keyword'
            },
            homepage: {
              type: 'keyword'
            },
            repository: {
              type: 'keyword'
            },
            downloads: {
              properties: {
                monthly: {
                  type: 'long'
                },
                weekly: {
                  type: 'long'
                }
              }
            },
            score: {
              properties: {
                final: {
                  type: 'float'
                },
                detail: {
                  properties: {
                    quality: {
                      type: 'float'
                    },
                    popularity: {
                      type: 'float'
                    },
                    maintenance: {
                      type: 'float'
                    }
                  }
                }
              }
            },
            created_at: {
              type: 'date'
            }
          }
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              ngram_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'ngram_filter']
              }
            },
            filter: {
              ngram_filter: {
                type: 'ngram',
                min_gram: 2,
                max_gram: 10
              }
            }
          }
        }
      };

      const response = await fetch(`${this.BONSAI_BASE_URL}/${this.INDEX_NAME}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(indexMapping)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Index creation failed:', errorText);
        return false;
      }

      console.log('Index created successfully');
      return true;
    } catch (error) {
      console.error('Index creation error:', error);
      return false;
    }
  }

  static async indexSampleData(): Promise<boolean> {
    try {
      // Enhanced sample packages with more printing-related packages
      const samplePackages = [
        {
          name: 'react',
          description: 'A JavaScript library for building user interfaces',
          keywords: ['react', 'javascript', 'ui', 'library', 'frontend', 'component'],
          version: '18.2.0',
          author: 'React Team',
          license: 'MIT',
          downloads: { monthly: 20000000, weekly: 5000000 },
          score: { final: 0.95, detail: { quality: 0.98, popularity: 0.99, maintenance: 0.95 } }
        },
        {
          name: 'react-to-print',
          description: 'Print React components in the browser',
          keywords: ['react', 'print', 'printing', 'browser', 'component', 'pdf'],
          version: '2.14.13',
          author: 'Matthew Herbst',
          license: 'MIT',
          downloads: { monthly: 500000, weekly: 125000 },
          score: { final: 0.85, detail: { quality: 0.88, popularity: 0.82, maintenance: 0.85 } }
        },
        {
          name: 'jspdf',
          description: 'PDF generation library for JavaScript',
          keywords: ['pdf', 'javascript', 'generation', 'print', 'document'],
          version: '2.5.1',
          author: 'James Hall',
          license: 'MIT',
          downloads: { monthly: 2000000, weekly: 500000 },
          score: { final: 0.88, detail: { quality: 0.85, popularity: 0.90, maintenance: 0.89 } }
        },
        {
          name: 'html2canvas',
          description: 'Screenshots with JavaScript',
          keywords: ['html', 'canvas', 'screenshot', 'print', 'image', 'pdf'],
          version: '1.4.1',
          author: 'Niklas von Hertzen',
          license: 'MIT',
          downloads: { monthly: 3000000, weekly: 750000 },
          score: { final: 0.87, detail: { quality: 0.84, popularity: 0.91, maintenance: 0.86 } }
        },
        {
          name: 'puppeteer',
          description: 'Headless Chrome Node.js API',
          keywords: ['chrome', 'headless', 'pdf', 'print', 'automation', 'scraping'],
          version: '21.5.2',
          author: 'Chrome DevTools team',
          license: 'Apache-2.0',
          downloads: { monthly: 5000000, weekly: 1250000 },
          score: { final: 0.92, detail: { quality: 0.94, popularity: 0.89, maintenance: 0.93 } }
        },
        {
          name: 'express',
          description: 'Fast, unopinionated, minimalist web framework for node',
          keywords: ['express', 'web', 'framework', 'server', 'http'],
          version: '4.18.2',
          author: 'TJ Holowaychuk',
          license: 'MIT',
          downloads: { monthly: 25000000, weekly: 6000000 },
          score: { final: 0.92, detail: { quality: 0.90, popularity: 0.95, maintenance: 0.91 } }
        },
        {
          name: 'lodash',
          description: 'A modern JavaScript utility library delivering modularity, performance, & extras',
          keywords: ['lodash', 'utility', 'javascript', 'functional', 'helpers'],
          version: '4.17.21',
          author: 'John-David Dalton',
          license: 'MIT',
          downloads: { monthly: 30000000, weekly: 7500000 },
          score: { final: 0.88, detail: { quality: 0.85, popularity: 0.92, maintenance: 0.87 } }
        },
        {
          name: 'axios',
          description: 'Promise based HTTP client for the browser and node.js',
          keywords: ['axios', 'http', 'client', 'promise', 'ajax'],
          version: '1.6.0',
          author: 'Matt Zabriskie',
          license: 'MIT',
          downloads: { monthly: 28000000, weekly: 7000000 },
          score: { final: 0.90, detail: { quality: 0.88, popularity: 0.93, maintenance: 0.89 } }
        },
        {
          name: 'typescript',
          description: 'TypeScript is a language for application scale JavaScript development',
          keywords: ['typescript', 'javascript', 'language', 'compiler', 'types'],
          version: '5.3.0',
          author: 'Microsoft Corp.',
          license: 'Apache-2.0',
          downloads: { monthly: 45000000, weekly: 11000000 },
          score: { final: 0.94, detail: { quality: 0.96, popularity: 0.94, maintenance: 0.92 } }
        },
        {
          name: 'react-pdf',
          description: 'Display PDFs in your React app as easily as if they were images',
          keywords: ['react', 'pdf', 'viewer', 'display', 'document'],
          version: '7.5.1',
          author: 'Wojciech Maj',
          license: 'MIT',
          downloads: { monthly: 800000, weekly: 200000 },
          score: { final: 0.86, detail: { quality: 0.87, popularity: 0.84, maintenance: 0.87 } }
        },
        {
          name: 'html-to-image',
          description: 'Generates an image from a DOM node using HTML5 canvas and SVG',
          keywords: ['html', 'image', 'canvas', 'svg', 'screenshot', 'print'],
          version: '1.11.11',
          author: 'bubkoo',
          license: 'MIT',
          downloads: { monthly: 600000, weekly: 150000 },
          score: { final: 0.83, detail: { quality: 0.81, popularity: 0.85, maintenance: 0.83 } }
        },
        {
          name: 'print-js',
          description: 'A tiny javascript library to help printing from the web',
          keywords: ['print', 'javascript', 'browser', 'pdf', 'html', 'image'],
          version: '1.6.0',
          author: 'Rodrigo Vieira',
          license: 'MIT',
          downloads: { monthly: 300000, weekly: 75000 },
          score: { final: 0.79, detail: { quality: 0.76, popularity: 0.82, maintenance: 0.79 } }
        }
      ];

      // Bulk index the sample data
      const bulkBody = samplePackages.flatMap(pkg => [
        { index: { _index: this.INDEX_NAME, _id: pkg.name } },
        { ...pkg, created_at: new Date().toISOString() }
      ]);

      const response = await fetch(`${this.BONSAI_BASE_URL}/_bulk`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: bulkBody.map(item => JSON.stringify(item)).join('\n') + '\n'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sample data indexing failed:', errorText);
        return false;
      }

      console.log('Sample data indexed successfully');
      return true;
    } catch (error) {
      console.error('Sample data indexing error:', error);
      return false;
    }
  }

  static async initializeIndex(): Promise<boolean> {
    try {
      const indexExists = await this.checkIndexExists();
      
      if (!indexExists) {
        console.log('Index does not exist, creating...');
        const created = await this.createIndex();
        
        if (created) {
          // Wait a moment for index to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Index sample data
          await this.indexSampleData();
          
          // Wait for indexing to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return created;
      }
      
      return true;
    } catch (error) {
      console.error('Index initialization failed:', error);
      return false;
    }
  }

  static parseSemanticQuery(semanticQuery: string): {
    mainTerms: string[];
    exactPhrases: string[];
    allTerms: string[];
  } {
    // Remove quotes and clean the query
    const cleanQuery = semanticQuery.replace(/['"]/g, '').trim();
    
    // Split by commas and clean each term
    const terms = cleanQuery
      .split(/[,\s]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 1);

    // Extract main terms (first few terms are usually most important)
    const mainTerms = terms.slice(0, 5);
    
    // Look for exact phrases (terms that should be together)
    const exactPhrases = [];
    if (cleanQuery.includes('react-print')) {
      exactPhrases.push('react-print');
    }
    if (cleanQuery.includes('print-to-pdf')) {
      exactPhrases.push('print-to-pdf');
    }
    if (cleanQuery.includes('html-to-pdf')) {
      exactPhrases.push('html-to-pdf');
    }

    return {
      mainTerms,
      exactPhrases,
      allTerms: terms
    };
  }

  static async searchWithSemanticQuery(semanticQuery: string, size: number = 20, from: number = 0): Promise<BonsaiSearchResponse> {
    try {
      // Ensure index exists before searching
      const initialized = await this.initializeIndex();
      if (!initialized) {
        throw new Error('Failed to initialize Bonsai index');
      }

      const { mainTerms, exactPhrases, allTerms } = this.parseSemanticQuery(semanticQuery);
      
      console.log('Parsed query:', { mainTerms, exactPhrases, allTerms });

      const searchBody = {
        size,
        from,
        query: {
          bool: {
            should: [
              // Exact phrase matches (highest priority)
              ...exactPhrases.map(phrase => ({
                multi_match: {
                  query: phrase,
                  fields: ['name^10', 'description^3', 'keywords^5'],
                  type: 'phrase',
                  boost: 5
                }
              })),
              
              // Main terms with high boost
              {
                multi_match: {
                  query: mainTerms.join(' '),
                  fields: ['name^8', 'description^2', 'keywords^4'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  boost: 3
                }
              },
              
              // Individual keyword matches
              ...mainTerms.slice(0, 3).map(term => ({
                multi_match: {
                  query: term,
                  fields: ['name^6', 'keywords^3', 'description'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  boost: 2
                }
              })),
              
              // Broader term matching
              {
                multi_match: {
                  query: allTerms.join(' '),
                  fields: ['name^2', 'description', 'keywords^2'],
                  type: 'cross_fields',
                  operator: 'or',
                  boost: 1
                }
              },
              
              // Ngram matching for partial matches
              {
                multi_match: {
                  query: mainTerms.join(' '),
                  fields: ['name.ngram', 'description.ngram'],
                  type: 'best_fields',
                  boost: 0.5
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

      console.log('Search body:', JSON.stringify(searchBody, null, 2));

      const response = await fetch(`${this.BONSAI_BASE_URL}/${this.INDEX_NAME}/_search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bonsai semantic search failed:', errorText);
        throw new Error(`Bonsai semantic search failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Search results:', result);
      
      return result;
    } catch (error) {
      console.error('Bonsai semantic search error:', error);
      throw error;
    }
  }

  static async searchPackages(query: string, size: number = 20, from: number = 0): Promise<BonsaiSearchResponse> {
    try {
      // Ensure index exists before searching
      const initialized = await this.initializeIndex();
      if (!initialized) {
        throw new Error('Failed to initialize Bonsai index');
      }

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
        final: Math.min(result._score / 10, 1), // Normalize Elasticsearch score
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
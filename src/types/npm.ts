export interface NPMPackage {
  package: {
    name: string;
    scope?: string;
    version: string;
    description: string;
    keywords?: string[];
    date: string;
    links: {
      npm: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
    author?: {
      name: string;
      email?: string;
      username?: string;
    };
    publisher: {
      username: string;
      email: string;
    };
    maintainers: Array<{
      username: string;
      email: string;
    }>;
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

export interface NPMSearchResponse {
  objects: NPMPackage[];
  total: number;
  time: string;
}

export interface PackageDetails {
  name: string;
  version: string;
  description: string;
  main?: string;
  scripts?: Record<string, string>;
  keywords?: string[];
  author?: string | { name: string; email?: string };
  license?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  readme?: string;
  readmeFilename?: string;
  time?: Record<string, string>;
  versions?: Record<string, any>;
  'dist-tags'?: Record<string, string>;
}
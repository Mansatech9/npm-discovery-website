export interface NPMPackage {
  package: {
    name: string;
    scope?: string;
    version: string;
    description: string;
    keywords?: string[];
    date: string;
    license?: string;
    sanitized_name?: string;
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
    } | string;
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
  downloads?: {
    monthly: number;
    weekly: number;
  };
  dependents?: number;
  updated?: string;
  searchScore: number;
  flags?: {
    insecure: number;
  };
}

export interface NPMSearchResponse {
  objects: NPMPackage[];
  total: number;
  time: string;
}

export interface PackageVersion {
  name: string;
  version: string;
  description: string;
  main?: string;
  bin?: Record<string, string>;
  scripts?: Record<string, string>;
  keywords?: string[];
  author?: string | { name: string; email?: string };
  license?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  dist?: {
    integrity: string;
    shasum: string;
    tarball: string;
    fileCount: number;
    unpackedSize: number;
  };
  _npmUser?: {
    name: string;
    email: string;
  };
  maintainers?: Array<{
    name: string;
    email: string;
  }>;
}

export interface PackageDetails {
  _id: string;
  _rev?: string;
  name: string;
  'dist-tags': Record<string, string>;
  versions: Record<string, PackageVersion>;
  time: Record<string, string>;
  bugs?: {
    url: string;
  };
  author?: string | { name: string; email?: string };
  license?: string;
  homepage?: string;
  keywords?: string[];
  repository?: {
    type: string;
    url: string;
  };
  description: string;
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  readme?: string;
  readmeFilename?: string;
  
  // Computed properties for easier access
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  bin?: Record<string, string>;
}
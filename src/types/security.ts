export interface VulnerabilityResult {
  package: string;
  version: string;
  vulnerabilities: Vulnerability[];
  deprecated: boolean;
  license: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

export interface Vulnerability {
  id: string;
  summary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  published: string;
  modified: string;
  aliases?: string[];
  affected?: Array<{
    package: {
      name: string;
      ecosystem: string;
    };
    ranges: Array<{
      type: string;
      events: Array<{
        introduced?: string;
        fixed?: string;
      }>;
    }>;
  }>;
}

export interface OSVResponse {
  vulns: Vulnerability[];
}

export interface PackageInput {
  name: string;
  version: string;
}

export interface ScanSummary {
  totalPackages: number;
  vulnerablePackages: number;
  deprecatedPackages: number;
  highSeverityCount: number;
  criticalSeverityCount: number;
}
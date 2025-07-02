import { VulnerabilityResult, Vulnerability, OSVResponse, PackageInput } from '../types/security';

export class SecurityApiService {
  private static readonly OSV_API_URL = 'https://api.osv.dev/v1/query';
  private static readonly NPM_REGISTRY_URL = 'https://registry.npmjs.org';

  static async scanPackage(packageInput: PackageInput): Promise<VulnerabilityResult> {
    const result: VulnerabilityResult = {
      package: packageInput.name,
      version: packageInput.version,
      vulnerabilities: [],
      deprecated: false,
      license: 'Unknown',
      status: 'loading'
    };

    try {
      // Fetch package metadata from npm registry
      const packageData = await this.fetchPackageMetadata(packageInput.name, packageInput.version);
      
      if (packageData) {
        result.deprecated = packageData.deprecated || false;
        result.license = packageData.license || 'Unknown';
      }

      // Fetch vulnerabilities from OSV.dev
      const vulnerabilities = await this.fetchVulnerabilities(packageInput);
      result.vulnerabilities = vulnerabilities;

      result.status = 'success';
    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    }

    return result;
  }

  private static async fetchPackageMetadata(packageName: string, version: string) {
    try {
      const url = version === 'latest' 
        ? `${this.NPM_REGISTRY_URL}/${packageName}/latest`
        : `${this.NPM_REGISTRY_URL}/${packageName}/${version}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Package not found: ${packageName}@${version}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${packageName}@${version}:`, error);
      return null;
    }
  }

  private static async fetchVulnerabilities(packageInput: PackageInput): Promise<Vulnerability[]> {
    try {
      const requestBody = {
        package: {
          name: packageInput.name,
          ecosystem: 'npm'
        }
      };

      // Add version if it's not 'latest'
      if (packageInput.version !== 'latest') {
        (requestBody as any).version = packageInput.version;
      }

      const response = await fetch(this.OSV_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`OSV API error: ${response.statusText}`);
      }

      const data: OSVResponse = await response.json();
      return data.vulns || [];
    } catch (error) {
      console.warn(`Failed to fetch vulnerabilities for ${packageInput.name}:`, error);
      return [];
    }
  }

  static parsePackageInput(input: string): PackageInput[] {
    const packages: PackageInput[] = [];
    const lines = input.trim().split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Try to parse as package.json dependencies
      if (trimmedLine.includes(':') && (trimmedLine.includes('"') || trimmedLine.includes("'"))) {
        const match = trimmedLine.match(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/);
        if (match) {
          const [, name, version] = match;
          packages.push({ name, version: this.cleanVersion(version) });
          continue;
        }
      }

      // Try to parse as package@version format
      if (trimmedLine.includes('@') && !trimmedLine.startsWith('@')) {
        const lastAtIndex = trimmedLine.lastIndexOf('@');
        const name = trimmedLine.substring(0, lastAtIndex);
        const version = trimmedLine.substring(lastAtIndex + 1);
        if (name && version) {
          packages.push({ name, version: this.cleanVersion(version) });
          continue;
        }
      }

      // Try to parse as scoped package@version format
      if (trimmedLine.startsWith('@')) {
        const parts = trimmedLine.split('@');
        if (parts.length >= 3) {
          const name = `@${parts[1]}`;
          const version = parts.slice(2).join('@');
          packages.push({ name, version: this.cleanVersion(version) });
          continue;
        }
      }

      // Treat as package name without version
      if (trimmedLine && !trimmedLine.includes(' ') && !trimmedLine.includes('{') && !trimmedLine.includes('}')) {
        packages.push({ name: trimmedLine, version: 'latest' });
      }
    }

    return packages;
  }

  private static cleanVersion(version: string): string {
    // Remove common version prefixes and suffixes
    return version
      .replace(/^[\^~>=<]+/, '')
      .replace(/[,\s].*$/, '')
      .trim() || 'latest';
  }

  static getSeverityColor(severity: string): string {
    const severityStr = String(severity || '').toUpperCase();
    switch (severityStr) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  }

  static getSeverityIcon(severity: string): string {
    const severityStr = String(severity || '').toUpperCase();
    switch (severityStr) {
      case 'CRITICAL':
        return '🔴';
      case 'HIGH':
        return '🟠';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🔵';
      default:
        return '⚪';
    }
  }
}
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Package,
  Clock,
  AlertCircle,
  XCircle,
  Loader,
  Brain
} from 'lucide-react';
import { VulnerabilityResult, ScanSummary } from '../types/security';
import { SecurityApiService } from '../services/securityApi';
import SecurityAnalysis from './SecurityAnalysis';

interface SecurityScanProps {
  onBack: () => void;
}

const SecurityScan: React.FC<SecurityScanProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<VulnerabilityResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [copiedResults, setCopiedResults] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleScan = async () => {
    if (!input.trim()) return;

    setIsScanning(true);
    setResults([]);
    setScanSummary(null);
    setShowAnalysis(false);

    try {
      const packages = SecurityApiService.parsePackageInput(input);
      
      if (packages.length === 0) {
        alert('No valid packages found in input. Please check your format.');
        setIsScanning(false);
        return;
      }

      // Initialize results with loading state
      const initialResults = packages.map(pkg => ({
        package: pkg.name,
        version: pkg.version,
        vulnerabilities: [],
        deprecated: false,
        license: 'Unknown',
        status: 'loading' as const
      }));
      setResults(initialResults);

      // Scan packages in parallel with some delay to avoid rate limiting
      const scanPromises = packages.map((pkg, index) => 
        new Promise<VulnerabilityResult>(resolve => {
          setTimeout(async () => {
            const result = await SecurityApiService.scanPackage(pkg);
            resolve(result);
          }, index * 200); // 200ms delay between requests
        })
      );

      const scanResults = await Promise.all(scanPromises);
      setResults(scanResults);

      // Calculate summary
      const summary: ScanSummary = {
        totalPackages: scanResults.length,
        vulnerablePackages: scanResults.filter(r => r.vulnerabilities.length > 0).length,
        deprecatedPackages: scanResults.filter(r => r.deprecated).length,
        highSeverityCount: scanResults.reduce((acc, r) => 
          acc + r.vulnerabilities.filter(v => v.severity === 'HIGH').length, 0),
        criticalSeverityCount: scanResults.reduce((acc, r) => 
          acc + r.vulnerabilities.filter(v => v.severity === 'CRITICAL').length, 0)
      };
      setScanSummary(summary);

    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const exportResults = async (format: 'json' | 'csv') => {
    if (results.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = 'security-scan-results.json';
      mimeType = 'application/json';
    } else {
      // CSV format
      const headers = ['Package', 'Version', 'Vulnerabilities Count', 'Deprecated', 'License', 'High Severity', 'Critical Severity'];
      const rows = results.map(result => [
        result.package,
        result.version,
        result.vulnerabilities.length.toString(),
        result.deprecated ? 'Yes' : 'No',
        result.license,
        result.vulnerabilities.filter(v => v.severity === 'HIGH').length.toString(),
        result.vulnerabilities.filter(v => v.severity === 'CRITICAL').length.toString()
      ]);
      
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = 'security-scan-results.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyResults = async () => {
    if (results.length === 0) return;

    const summary = results.map(result => 
      `${result.package}@${result.version}: ${result.vulnerabilities.length} vulnerabilities, ${result.deprecated ? 'deprecated' : 'active'}, ${result.license} license`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedResults(true);
      setTimeout(() => setCopiedResults(false), 2000);
    } catch (error) {
      console.error('Failed to copy results:', error);
    }
  };

  const getStatusIcon = (result: VulnerabilityResult) => {
    if (result.status === 'loading') {
      return <Loader className="h-4 w-4 text-blue-400 animate-spin" />;
    }
    if (result.status === 'error') {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
    if (result.vulnerabilities.length > 0 || result.deprecated) {
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  const getRowColor = (result: VulnerabilityResult) => {
    if (result.status === 'loading') return 'bg-slate-700/30';
    if (result.status === 'error') return 'bg-red-500/10 border-red-500/20';
    if (result.deprecated || result.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
      return 'bg-red-500/10 border-red-500/20';
    }
    if (result.vulnerabilities.some(v => v.severity === 'HIGH')) {
      return 'bg-orange-500/10 border-orange-500/20';
    }
    if (result.vulnerabilities.length > 0) {
      return 'bg-yellow-500/10 border-yellow-500/20';
    }
    return 'bg-green-500/10 border-green-500/20';
  };

  const hasVulnerabilities = results.some(result => 
    result.vulnerabilities.length > 0 || result.deprecated
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Search</span>
              </button>
              <div className="h-6 border-l border-slate-600"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Security Scan on the Fly</h1>
                  <p className="text-slate-400">Scan npm packages for vulnerabilities and security issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="mb-4">
            <label className="block text-lg font-semibold text-white mb-2">
              Package Input
            </label>
            <p className="text-slate-400 text-sm mb-4">
              Paste package names, package.json dependencies, or package@version format
            </p>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Examples:
react@18.2.0
express
lodash@4.17.21

Or paste package.json dependencies:
"react": "^18.2.0",
"express": "^4.18.2",
"lodash": "~4.17.21"`}
            className="w-full h-40 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isScanning}
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-400">
              {input.trim() ? `${SecurityApiService.parsePackageInput(input).length} packages detected` : 'Enter packages to scan'}
            </div>
            <button
              onClick={handleScan}
              disabled={!input.trim() || isScanning}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all font-medium flex items-center space-x-2"
            >
              {isScanning ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Run Security Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary */}
        {scanSummary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-white">{scanSummary.totalPackages}</div>
              <div className="text-sm text-slate-400">Total Packages</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{scanSummary.vulnerablePackages}</div>
              <div className="text-sm text-slate-400">Vulnerable</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{scanSummary.deprecatedPackages}</div>
              <div className="text-sm text-slate-400">Deprecated</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{scanSummary.highSeverityCount}</div>
              <div className="text-sm text-slate-400">High Severity</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{scanSummary.criticalSeverityCount}</div>
              <div className="text-sm text-slate-400">Critical</div>
            </div>
          </div>
        )}

        {/* AI Analysis Button */}
        {results.length > 0 && hasVulnerabilities && !showAnalysis && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Get AI Security Analysis</h3>
                    <p className="text-slate-400 text-sm">
                      Let AI explain vulnerabilities, suggest fixes, and summarize risks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25"
                >
                  <Brain className="h-5 w-5" />
                  <span>Analyze with AI</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        {showAnalysis && (
          <div className="mb-8">
            <SecurityAnalysis 
              scanResults={results} 
              onClose={() => setShowAnalysis(false)}
            />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Scan Results</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyResults}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    {copiedResults ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => exportResults('csv')}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => exportResults('json')}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Package</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Version</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Vulnerabilities</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Deprecated</th>
                    <th className="text-left p-4 text-slate-300 font-medium">License</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={`${result.package}-${index}`} className={`border-t border-slate-700/50 ${getRowColor(result)}`}>
                      <td className="p-4">
                        {getStatusIcon(result)}
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-white">{result.package}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-sm">
                          {result.version}
                        </span>
                      </td>
                      <td className="p-4">
                        {result.status === 'loading' ? (
                          <div className="text-slate-400">Scanning...</div>
                        ) : result.status === 'error' ? (
                          <div className="text-red-400">Error</div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              result.vulnerabilities.length > 0 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}>
                              {result.vulnerabilities.length}
                            </span>
                            {result.vulnerabilities.length > 0 && (
                              <div className="flex space-x-1">
                                {result.vulnerabilities
                                  .reduce((acc, vuln) => {
                                    const existing = acc.find(v => v.severity === vuln.severity);
                                    if (existing) {
                                      existing.count++;
                                    } else {
                                      acc.push({ severity: vuln.severity, count: 1 });
                                    }
                                    return acc;
                                  }, [] as Array<{ severity: string; count: number }>)
                                  .map(({ severity, count }) => (
                                    <span
                                      key={severity}
                                      className={`px-1 py-0.5 rounded text-xs border ${SecurityApiService.getSeverityColor(severity)}`}
                                      title={`${count} ${severity} severity`}
                                    >
                                      {SecurityApiService.getSeverityIcon(severity)} {count}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {result.status === 'loading' ? (
                          <div className="text-slate-400">Checking...</div>
                        ) : result.status === 'error' ? (
                          <div className="text-red-400">Error</div>
                        ) : (
                          <span className={`px-2 py-1 rounded text-sm border ${
                            result.deprecated 
                              ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                              : 'bg-green-500/20 text-green-300 border-green-500/30'
                          }`}>
                            {result.deprecated ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-300 text-sm">{result.license}</span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`https://www.npmjs.com/package/${result.package}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View on NPM"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {scanSummary && (scanSummary.criticalSeverityCount > 0 || scanSummary.deprecatedPackages > 0) && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Security Issues Detected</h3>
                <div className="text-red-200 space-y-1">
                  {scanSummary.criticalSeverityCount > 0 && (
                    <p>• {scanSummary.criticalSeverityCount} critical severity vulnerabilities found</p>
                  )}
                  {scanSummary.deprecatedPackages > 0 && (
                    <p>• {scanSummary.deprecatedPackages} deprecated packages detected</p>
                  )}
                  <p className="mt-2 text-sm">
                    Consider updating or replacing these packages to improve security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {scanSummary && scanSummary.vulnerablePackages === 0 && scanSummary.deprecatedPackages === 0 && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">All Clear!</h3>
                <p className="text-green-200">
                  No known vulnerabilities or deprecated packages detected in your scan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityScan;
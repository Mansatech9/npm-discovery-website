import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader,
  Brain,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import { VulnerabilityResult } from '../types/security';
import { GeminiApiService, SecurityAnalysisRequest } from '../services/geminiApi';

interface SecurityAnalysisProps {
  scanResults: VulnerabilityResult[];
  onClose?: () => void;
}

const SecurityAnalysis: React.FC<SecurityAnalysisProps> = ({ scanResults, onClose }) => {
  const [analysis, setAnalysis] = useState<{
    vulnerabilityExplanations: string;
    fixSuggestions: string;
    riskSummary: string;
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const request: SecurityAnalysisRequest = {
        scanResults: scanResults
          .filter(result => result.status === 'success')
          .map(result => ({
            package: result.package,
            version: result.version,
            vulnerabilities: result.vulnerabilities.map(vuln => ({
              id: vuln.id,
              summary: vuln.summary,
              severity: vuln.severity
            })),
            deprecated: result.deprecated,
            license: result.license
          }))
      };

      const response = await GeminiApiService.analyzeSecurityScan(request);

      if (response.error) {
        setError(response.error);
      } else {
        setAnalysis({
          vulnerabilityExplanations: response.vulnerabilityExplanations,
          fixSuggestions: response.fixSuggestions,
          riskSummary: response.riskSummary,
          overallRiskLevel: response.overallRiskLevel
        });
      }
    } catch (err) {
      setError('Failed to analyze security scan. Please try again.');
      console.error('Security analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <XCircle className="h-5 w-5" />;
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5" />;
      case 'MEDIUM':
        return <AlertCircle className="h-5 w-5" />;
      case 'LOW':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const validResults = scanResults.filter(result => result.status === 'success');
  const hasVulnerabilities = validResults.some(result => 
    result.vulnerabilities.length > 0 || result.deprecated
  );

  if (!hasVulnerabilities) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-300 mb-2">No Security Issues Found</h3>
            <p className="text-green-200">
              Your packages appear to be secure with no known vulnerabilities or deprecated packages detected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Security Analysis</h2>
            <p className="text-slate-400">Get expert insights powered by Google Gemini AI</p>
          </div>
        </div>

        {!analysis && !isAnalyzing && (
          <button
            onClick={handleAnalyze}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25"
          >
            <Brain className="h-5 w-5" />
            <span>Analyze with AI</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader className="h-8 w-8 text-purple-400 animate-spin" />
            <div className="text-center">
              <p className="text-white font-medium">Analyzing security vulnerabilities...</p>
              <p className="text-slate-400 text-sm mt-1">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-red-300 mb-2">Analysis Failed</h4>
              <p className="text-red-200 mb-3">{error}</p>
              <button
                onClick={handleAnalyze}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Risk Level */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Risk Assessment</h3>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getRiskLevelColor(analysis.overallRiskLevel)}`}>
                {getRiskLevelIcon(analysis.overallRiskLevel)}
                <span className="font-medium">{analysis.overallRiskLevel} RISK</span>
              </div>
            </div>
          </div>

          {/* Vulnerability Explanations */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="font-medium text-white">Vulnerability Explanations</span>
              </div>
              <button
                onClick={() => copyToClipboard(analysis.vulnerabilityExplanations, 'explanations')}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                {copiedSection === 'explanations' ? (
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
            </div>
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.vulnerabilityExplanations}
                </div>
              </div>
            </div>
          </div>

          {/* Fix Suggestions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-white">Fix Suggestions</span>
              </div>
              <button
                onClick={() => copyToClipboard(analysis.fixSuggestions, 'fixes')}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                {copiedSection === 'fixes' ? (
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
            </div>
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.fixSuggestions}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Risk Summary</span>
              </div>
              <button
                onClick={() => copyToClipboard(analysis.riskSummary, 'summary')}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                {copiedSection === 'summary' ? (
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
            </div>
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.riskSummary}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!analysis && !isAnalyzing && !error && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-blue-300 mb-2">AI Security Analysis</h4>
              <p className="text-blue-200 mb-3">
                Get expert insights about your security vulnerabilities, including:
              </p>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Detailed explanations of vulnerabilities and their impact</li>
                <li>• Specific fix suggestions and upgrade recommendations</li>
                <li>• Overall risk assessment and prioritization guidance</li>
                <li>• Business impact analysis and mitigation strategies</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAnalysis;
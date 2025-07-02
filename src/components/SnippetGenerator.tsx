import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Loader, 
  Sparkles, 
  Play,
  RefreshCw,
  ChevronDown,
  Lightbulb
} from 'lucide-react';
import { GeminiApiService, SnippetRequest } from '../services/geminiApi';

interface SnippetGeneratorProps {
  packageName: string;
  readme?: string;
}

const SnippetGenerator: React.FC<SnippetGeneratorProps> = ({ packageName, readme }) => {
  const [usageDescription, setUsageDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = GeminiApiService.getCommonUsageDescriptions(packageName);

  const handleGenerate = async () => {
    if (!usageDescription.trim()) {
      setError('Please describe what you want to do with this package');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCode('');
    setExplanation('');

    try {
      const request: SnippetRequest = {
        packageName,
        usageDescription: usageDescription.trim(),
        readme
      };

      const response = await GeminiApiService.generateSnippet(request);

      if (response.error) {
        setError(response.error);
      } else {
        setGeneratedCode(response.code);
        setExplanation(response.explanation || '');
      }
    } catch (err) {
      setError('Failed to generate snippet. Please try again.');
      console.error('Snippet generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsageDescription(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Code Snippet Generator</h3>
          <p className="text-slate-400 text-sm">Generate code examples powered by Google Gemini AI</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What do you want to do with <span className="text-purple-400 font-mono">{packageName}</span>?
            </label>
            <div className="relative">
              <textarea
                value={usageDescription}
                onChange={(e) => setUsageDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="e.g., create a simple HTTP server, format dates, validate form data..."
                className="w-full h-24 bg-slate-800 text-slate-100 border border-slate-600 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500"
                disabled={isGenerating}
              />
              <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                Press Ctrl+Enter to generate
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="relative">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Show suggestions</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
            </button>

            {showSuggestions && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm border border-slate-600/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Powered by Google Gemini AI
            </div>
            <button
              onClick={handleGenerate}
              disabled={!usageDescription.trim() || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all font-medium flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Generate Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-300">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-white">Generated Code Snippet</span>
              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30">
                {packageName}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-6 overflow-x-auto text-sm leading-relaxed">
              <code className="language-javascript">{generatedCode}</code>
            </pre>
            
            {/* Code highlighting overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 w-full h-full"></div>
            </div>
          </div>

          {explanation && (
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Explanation:</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Usage Tips */}
      {!generatedCode && !isGenerating && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-300 mb-2">Tips for better results:</h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Be specific about what you want to accomplish</li>
                <li>• Mention the context (e.g., "in a React component", "for a Node.js server")</li>
                <li>• Include any specific requirements or constraints</li>
                <li>• Use the suggestions above for common use cases</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetGenerator;
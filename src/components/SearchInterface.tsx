import React, { useState } from 'react';
import { Search, Sparkles, Code, Package, Zap, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onSecurityScan: () => void;
  isLoading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, onSecurityScan, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const quickSearches = [
    'React components',
    'Express middleware', 
    'Chart libraries',
    'Date utilities',
    'HTTP clients',
    'Form validation'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
              <Package className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Find Perfect
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              NPM Packages
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Describe what you need and discover the perfect packages with intelligent search
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={onSecurityScan}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Security Scan</span>
          </button>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'React component library with dark mode'"
                className="w-full pl-14 pr-32 py-4 text-lg bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Searches */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-slate-300 mb-4">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {quickSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    onSearch(search);
                  }}
                  className="bg-white/10 backdrop-blur-sm text-slate-300 px-4 py-2 rounded-full hover:bg-white/20 transition-all transform hover:scale-105 border border-white/10 text-sm"
                  disabled={isLoading}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Lightning Fast</h4>
            <p className="text-slate-400 text-sm">Instant search results from NPM registry</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Quality Insights</h4>
            <p className="text-slate-400 text-sm">Detailed quality scores and metrics</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Trending Packages</h4>
            <p className="text-slate-400 text-sm">Discover popular and trending libraries</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default SearchInterface;
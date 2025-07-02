import React, { useState, useMemo } from 'react';
import { ArrowLeft, Filter, SortDesc, Package2, X, ChevronDown } from 'lucide-react';
import { NPMPackage } from '../types/npm';
import PackageCard from './PackageCard';

interface SearchResultsProps {
  packages: NPMPackage[];
  query: string;
  total: number;
  isLoading: boolean;
  onBack: () => void;
  onViewDetails: (packageName: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

type SortOption = 'relevance' | 'quality' | 'popularity' | 'maintenance' | 'recent';
type FilterOption = 'all' | 'high-quality' | 'popular' | 'well-maintained';

const SearchResults: React.FC<SearchResultsProps> = ({
  packages,
  query,
  total,
  isLoading,
  onBack,
  onViewDetails,
  onLoadMore,
  hasMore
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedPackages = useMemo(() => {
    let filtered = [...packages];

    // Apply filters
    switch (filterBy) {
      case 'high-quality':
        filtered = filtered.filter(pkg => pkg.score.detail.quality >= 0.7);
        break;
      case 'popular':
        filtered = filtered.filter(pkg => pkg.score.detail.popularity >= 0.6);
        break;
      case 'well-maintained':
        filtered = filtered.filter(pkg => pkg.score.detail.maintenance >= 0.7);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'quality':
        filtered.sort((a, b) => b.score.detail.quality - a.score.detail.quality);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.score.detail.popularity - a.score.detail.popularity);
        break;
      case 'maintenance':
        filtered.sort((a, b) => b.score.detail.maintenance - a.score.detail.maintenance);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.package.date).getTime() - new Date(a.package.date).getTime());
        break;
      default: // relevance
        filtered.sort((a, b) => b.searchScore - a.searchScore);
    }

    return filtered;
  }, [packages, sortBy, filterBy]);

  if (isLoading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Searching NPM registry...</p>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-2xl font-bold text-white">Search Results</h1>
                <p className="text-slate-400">
                  Found <span className="font-semibold text-purple-400">{total.toLocaleString()}</span> packages for "{query}"
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 px-4 py-2 rounded-lg transition-colors text-slate-300"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-64 z-10">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Sort By</label>
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full bg-slate-700 text-slate-300 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="quality">Quality Score</option>
                          <option value="popularity">Popularity</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="recent">Recently Updated</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Filter By</label>
                        <select 
                          value={filterBy} 
                          onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                          className="w-full bg-slate-700 text-slate-300 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="all">All Packages</option>
                          <option value="high-quality">High Quality (70%+)</option>
                          <option value="popular">Popular (60%+)</option>
                          <option value="well-maintained">Well Maintained (70%+)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filteredAndSortedPackages.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <Package2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No packages found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your filters or search with different keywords
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Try Different Search
            </button>
          </div>
        ) : (
          <>
            {/* Active Filters */}
            {(filterBy !== 'all' || sortBy !== 'relevance') && (
              <div className="flex flex-wrap gap-2 mb-6">
                {sortBy !== 'relevance' && (
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                    <span>Sort: {sortBy}</span>
                    <button onClick={() => setSortBy('relevance')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filterBy !== 'all' && (
                  <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                    <span>Filter: {filterBy.replace('-', ' ')}</span>
                    <button onClick={() => setFilterBy('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredAndSortedPackages.map((pkg, index) => (
                <PackageCard
                  key={`${pkg.package.name}-${index}`}
                  package={pkg}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-all font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent inline mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Packages'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
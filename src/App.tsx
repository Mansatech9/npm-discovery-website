import React, { useState } from 'react';
import SearchInterface from './components/SearchInterface';
import SearchResults from './components/SearchResults';
import PackageDetails from './components/PackageDetails';
import SecurityScan from './components/SecurityScan';
import { NPMPackage } from './types/npm';
import { EnhancedSearchApiService } from './services/enhancedSearchApi';

type AppState = 'search' | 'results' | 'details' | 'security';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('search');
  const [packages, setPackages] = useState<NPMPackage[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [rewrittenQuery, setRewrittenQuery] = useState('');
  const [searchSource, setSearchSource] = useState<'npm' | 'bonsai' | 'hybrid'>('npm');
  const [totalPackages, setTotalPackages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setCurrentQuery(query);
      setCurrentPage(0);
      
      const response = await EnhancedSearchApiService.searchWithAI(query, 20);
      setPackages(response.packages);
      setTotalPackages(response.total);
      setSearchSource(response.source);
      setRewrittenQuery(response.rewrittenQuery || '');
      setHasMore(response.packages.length === 20);
      setCurrentState('results');
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      const response = await EnhancedSearchApiService.searchWithAI(
        currentQuery, 
        20, 
        nextPage * 20
      );
      
      setPackages(prev => [...prev, ...response.packages]);
      setCurrentPage(nextPage);
      setHasMore(response.packages.length === 20);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (packageName: string) => {
    setSelectedPackage(packageName);
    setCurrentState('details');
  };

  const handleBackToSearch = () => {
    setCurrentState('search');
    setPackages([]);
    setCurrentQuery('');
    setRewrittenQuery('');
    setTotalPackages(0);
    setCurrentPage(0);
    setHasMore(true);
  };

  const handleBackToResults = () => {
    setCurrentState('results');
    setSelectedPackage('');
  };

  const handleSecurityScan = () => {
    setCurrentState('security');
  };

  const handleBackFromSecurity = () => {
    setCurrentState('search');
  };

  return (
    <div className="min-h-screen">
      {currentState === 'search' && (
        <SearchInterface
          onSearch={handleSearch}
          onSecurityScan={handleSecurityScan}
          isLoading={isLoading}
        />
      )}
      
      {currentState === 'results' && (
        <SearchResults
          packages={packages}
          query={currentQuery}
          rewrittenQuery={rewrittenQuery}
          searchSource={searchSource}
          total={totalPackages}
          isLoading={isLoading}
          onBack={handleBackToSearch}
          onViewDetails={handleViewDetails}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      )}
      
      {currentState === 'details' && selectedPackage && (
        <PackageDetails
          packageName={selectedPackage}
          onBack={handleBackToResults}
        />
      )}

      {currentState === 'security' && (
        <SecurityScan
          onBack={handleBackFromSecurity}
        />
      )}
    </div>
  );
}

export default App;
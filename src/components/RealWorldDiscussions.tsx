import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  User, 
  TrendingUp,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';
import { Discussion, DiscussionsResponse } from '../types/discussions';
import { DiscussionsApiService } from '../services/discussionsApi';

interface RealWorldDiscussionsProps {
  packageName: string;
}

const RealWorldDiscussions: React.FC<RealWorldDiscussionsProps> = ({ packageName }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: DiscussionsResponse = await DiscussionsApiService.getPackageDiscussions(packageName);
      
      if (response.error) {
        setError(response.error);
      } else {
        setDiscussions(response.discussions);
        setLastFetched(new Date());
      }
    } catch (err) {
      setError('Failed to fetch discussions. Please try again.');
      console.error('Error fetching discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (packageName) {
      fetchDiscussions();
    }
  }, [packageName]);

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'reddit':
        return 'Reddit';
      case 'stackoverflow':
        return 'Stack Overflow';
      case 'github':
        return 'GitHub Issues';
      default:
        return 'Discussion';
    }
  };

  if (isLoading && discussions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <span>Real-World Discussions</span>
          </h3>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400">Fetching discussions from Reddit, Stack Overflow, and GitHub...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && discussions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <span>Real-World Discussions</span>
          </h3>
          <button
            onClick={fetchDiscussions}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Discussions</h4>
              <p className="text-red-200 mb-3">{error}</p>
              <button
                onClick={fetchDiscussions}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          <span>Real-World Discussions</span>
          {discussions.length > 0 && (
            <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs border border-purple-500/30">
              {discussions.length} found
            </span>
          )}
        </h3>
        
        <div className="flex items-center space-x-3">
          {lastFetched && (
            <span className="text-xs text-slate-500">
              Updated {DiscussionsApiService.formatTimeAgo(lastFetched.toISOString())}
            </span>
          )}
          <button
            onClick={fetchDiscussions}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-slate-400 mb-2">No Discussions Found</h4>
          <p className="text-slate-500 max-w-md mx-auto">
            No recent discussions found for this package on Reddit, Stack Overflow, or GitHub. 
            This could mean the package is stable or not widely discussed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/30 hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs border flex items-center space-x-1 ${DiscussionsApiService.getSourceColor(discussion.source)}`}>
                    <span>{DiscussionsApiService.getSourceIcon(discussion.source)}</span>
                    <span>{getSourceLabel(discussion.source)}</span>
                  </span>
                  
                  {discussion.score !== undefined && (
                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>{discussion.score}</span>
                    </div>
                  )}
                </div>
                
                <a
                  href={discussion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <h4 className="text-white font-medium mb-2 leading-relaxed">
                <a
                  href={discussion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-300 transition-colors"
                >
                  {discussion.title}
                </a>
              </h4>

              {discussion.excerpt && (
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  {discussion.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-4">
                  {discussion.author && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{discussion.author}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{DiscussionsApiService.formatTimeAgo(discussion.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && discussions.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Some discussions may not have loaded completely.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldDiscussions;
import React from 'react';
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Tag,
  Github,
  Home,
  Shield,
  Star,
  Download
} from 'lucide-react';
import { NPMPackage } from '../types/npm';

interface PackageCardProps {
  package: NPMPackage;
  onViewDetails: (packageName: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onViewDetails }) => {
  const { package: packageInfo, score } = pkg;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQualityColor = (qualityScore: number) => {
    if (qualityScore >= 0.8) return 'text-emerald-400';
    if (qualityScore >= 0.6) return 'text-blue-400';
    if (qualityScore >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-white truncate">
                {packageInfo.name}
              </h3>
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                v{packageInfo.version}
              </span>
            </div>
            <p className="text-slate-300 text-sm line-clamp-2 mb-2">
              {packageInfo.description || 'No description available'}
            </p>
          </div>
        </div>

        {/* Quality Score */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className={`text-sm font-medium ${getQualityColor(score.detail.quality)}`}>
              {Math.round(score.detail.quality * 100)}% Quality
            </span>
          </div>
          <div className="text-sm text-slate-400">
            Score: {Math.round(score.final * 100)}%
          </div>
        </div>

        {/* Keywords */}
        {packageInfo.keywords && packageInfo.keywords.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {packageInfo.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
              {packageInfo.keywords.length > 3 && (
                <span className="text-slate-500 text-xs px-1">
                  +{packageInfo.keywords.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-slate-700/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400">
              {Math.round(score.detail.popularity * 100)}%
            </div>
            <div className="text-xs text-slate-500">Popular</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-400">
              {Math.round(score.detail.quality * 100)}%
            </div>
            <div className="text-xs text-slate-500">Quality</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-purple-400">
              {Math.round(score.detail.maintenance * 100)}%
            </div>
            <div className="text-xs text-slate-500">Maintained</div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          {packageInfo.author && (
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span className="truncate">
                {typeof packageInfo.author === 'string' ? packageInfo.author : packageInfo.author.name}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(packageInfo.date)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(packageInfo.name)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
          >
            View Details
          </button>
          
          <div className="flex gap-1">
            {packageInfo.links.repository && (
              <a
                href={packageInfo.links.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg transition-all"
                title="Repository"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            
            <a
              href={packageInfo.links.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
              title="NPM"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
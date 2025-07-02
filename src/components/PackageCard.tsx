import React from 'react';
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Tag,
  Github,
  Shield,
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { NPMPackage } from '../types/npm';

interface PackageCardProps {
  package: NPMPackage;
  onViewDetails: (packageName: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onViewDetails }) => {
  const { package: packageInfo, score, downloads, dependents } = pkg;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDownloads = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getQualityColor = (qualityScore: number) => {
    if (qualityScore >= 0.8) return 'text-emerald-400';
    if (qualityScore >= 0.6) return 'text-blue-400';
    if (qualityScore >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityBadge = (qualityScore: number) => {
    if (qualityScore >= 0.8) return { text: 'High Quality', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (qualityScore >= 0.6) return { text: 'Good Quality', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (qualityScore >= 0.4) return { text: 'Fair Quality', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    return { text: 'Low Quality', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
  };

  const qualityBadge = getQualityBadge(score.detail.quality);
  const isSecure = !pkg.flags?.insecure;

  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden">
      {/* Header with Security Badge */}
      <div className="relative p-5 pb-3">
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {isSecure ? (
            <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs border border-emerald-500/30">
              <CheckCircle className="h-3 w-3" />
              <span>Secure</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs border border-red-500/30">
              <AlertTriangle className="h-3 w-3" />
              <span>Insecure</span>
            </div>
          )}
        </div>

        <div className="pr-20">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {packageInfo.name}
            </h3>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full border border-slate-600/50">
              v{packageInfo.version}
            </span>
          </div>
          
          <p className="text-slate-300 text-sm line-clamp-2 mb-3 leading-relaxed">
            {packageInfo.description || 'No description available'}
          </p>
        </div>
      </div>

      {/* Quality Badge */}
      <div className="px-5 pb-3">
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${qualityBadge.color}`}>
          <Shield className="h-3 w-3" />
          <span>{qualityBadge.text}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Downloads */}
          {downloads && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-center space-x-2 mb-1">
                <Download className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-400">Downloads</span>
              </div>
              <div className="text-sm font-bold text-white">
                {formatDownloads(downloads.monthly)}/month
              </div>
              <div className="text-xs text-slate-500">
                {formatDownloads(downloads.weekly)}/week
              </div>
            </div>
          )}

          {/* Dependents */}
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Dependents</span>
            </div>
            <div className="text-sm font-bold text-white">
              {dependents !== undefined ? formatDownloads(dependents) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Score Metrics */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-700/20 rounded-lg border border-slate-600/20">
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400">
              {Math.round(score.detail.popularity * 100)}%
            </div>
            <div className="text-xs text-slate-500">Popular</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold ${getQualityColor(score.detail.quality)}`}>
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
      </div>

      {/* Keywords */}
      {packageInfo.keywords && packageInfo.keywords.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-1">
            {packageInfo.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-500/30"
              >
                {keyword}
              </span>
            ))}
            {packageInfo.keywords.length > 3 && (
              <span className="text-slate-500 text-xs px-1 py-0.5">
                +{packageInfo.keywords.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
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
      </div>

      {/* License */}
      {packageInfo.license && (
        <div className="px-5 pb-4">
          <div className="text-xs text-slate-400">
            License: <span className="text-slate-300 font-medium">{packageInfo.license}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-5 pt-0">
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(packageInfo.name)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            View Details
          </button>
          
          <div className="flex gap-1">
            {packageInfo.links.repository && (
              <a
                href={packageInfo.links.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white p-2.5 rounded-lg transition-all transform hover:scale-105"
                title="Repository"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            
            <a
              href={packageInfo.links.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition-all transform hover:scale-105"
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
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag,
  Github,
  Home,
  Bug,
  Package,
  Shield,
  Copy,
  Check,
  Download,
  Star,
  GitBranch,
  FileText,
  Code,
  Users,
  Clock,
  Archive,
  Settings,
  Terminal,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PackageDetails as PackageDetailsType } from '../types/npm';
import { NPMApiService } from '../services/npmApi';
import RealWorldDiscussions from './RealWorldDiscussions';
import SnippetGenerator from './SnippetGenerator';

interface PackageDetailsProps {
  packageName: string;
  onBack: () => void;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ packageName, onBack }) => {
  const [packageDetails, setPackageDetails] = useState<PackageDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'versions' | 'readme' | 'discussions' | 'snippets'>('overview');

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const details = await NPMApiService.getPackageDetails(packageName);
        
        // Enhance the details with latest version info
        const latestVersion = details['dist-tags']?.latest;
        if (latestVersion && details.versions[latestVersion]) {
          const latestVersionData = details.versions[latestVersion];
          details.version = latestVersion;
          details.dependencies = latestVersionData.dependencies;
          details.devDependencies = latestVersionData.devDependencies;
          details.peerDependencies = latestVersionData.peerDependencies;
          details.scripts = latestVersionData.scripts;
          details.engines = latestVersionData.engines;
          details.bin = latestVersionData.bin;
        }
        
        setPackageDetails(details);
      } catch (err) {
        setError('Failed to fetch package details');
        console.error('Error fetching package details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetails();
  }, [packageName]);

  const copyToClipboard = async (text: string, command: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getVersionHistory = () => {
    if (!packageDetails?.versions) return [];
    return Object.entries(packageDetails.versions)
      .map(([version, data]) => ({
        version,
        date: packageDetails.time[version],
        ...data
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Show last 10 versions
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error || !packageDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Package not found</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const installCommands = [
    { command: 'npm', text: `npm install ${packageDetails.name}`, icon: '📦' },
    { command: 'yarn', text: `yarn add ${packageDetails.name}`, icon: '🧶' },
    { command: 'pnpm', text: `pnpm add ${packageDetails.name}`, icon: '⚡' },
    { command: 'bun', text: `bun add ${packageDetails.name}`, icon: '🥟' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'snippets', label: 'AI Snippets', icon: Sparkles },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { id: 'versions', label: 'Versions', icon: Tag },
    { id: 'readme', label: 'README', icon: Code },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ];

  const latestVersionData = packageDetails.version ? packageDetails.versions[packageDetails.version] : null;

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
                <span>Back to Results</span>
              </button>
              <div className="h-6 border-l border-slate-600"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{packageDetails.name}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-slate-400">v{packageDetails.version}</p>
                    {packageDetails.license && (
                      <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-sm">
                        {packageDetails.license}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Installation */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Download className="h-5 w-5 text-purple-400" />
                <span>Installation</span>
              </h3>
              <div className="space-y-3">
                {installCommands.map(({ command, text, icon }) => (
                  <div key={command} className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>{icon}</span>
                      <span>{command.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 text-xs">
                        {text}
                      </div>
                      <button
                        onClick={() => copyToClipboard(text, command)}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
                        title={`Copy ${command} command`}
                      >
                        {copiedCommand === command ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>Package Info</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Latest Version</div>
                  <div className="font-mono text-sm bg-slate-700/50 px-2 py-1 rounded text-purple-300">
                    {packageDetails.version}
                  </div>
                </div>
                
                {packageDetails.license && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">License</div>
                    <div className="text-sm text-slate-300">{packageDetails.license}</div>
                  </div>
                )}

                {packageDetails.author && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Author</div>
                    <div className="text-sm flex items-center space-x-1 text-slate-300">
                      <User className="h-4 w-4" />
                      <span>
                        {typeof packageDetails.author === 'string' 
                          ? packageDetails.author 
                          : packageDetails.author.name}
                      </span>
                    </div>
                  </div>
                )}

                {packageDetails.maintainers && packageDetails.maintainers.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Maintainers</div>
                    <div className="text-sm text-slate-300">
                      {packageDetails.maintainers.length} maintainer{packageDetails.maintainers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {latestVersionData?.dist && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Package Size</div>
                    <div className="text-sm text-slate-300">
                      {formatFileSize(latestVersionData.dist.unpackedSize)}
                    </div>
                  </div>
                )}

                {packageDetails.time?.created && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Created</div>
                    <div className="text-sm text-slate-300">
                      {formatDate(packageDetails.time.created)}
                    </div>
                  </div>
                )}

                {packageDetails.time?.modified && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Last Modified</div>
                    <div className="text-sm text-slate-300">
                      {formatDate(packageDetails.time.modified)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Binary Commands */}
            {packageDetails.bin && Object.keys(packageDetails.bin).length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-purple-400" />
                  <span>CLI Commands</span>
                </h3>
                <div className="space-y-2">
                  {Object.entries(packageDetails.bin).map(([command, path]) => (
                    <div key={command} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="font-mono text-sm text-purple-300">{command}</div>
                      <div className="text-xs text-slate-400">{path}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
              <div className="space-y-3">
                <a
                  href={`https://www.npmjs.com/package/${packageDetails.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors group"
                >
                  <Package className="h-5 w-5" />
                  <span>NPM Package</span>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {packageDetails.repository && (
                  <a
                    href={packageDetails.repository.url.replace('git+', '').replace('.git', '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Github className="h-5 w-5" />
                    <span>Repository</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {packageDetails.homepage && (
                  <a
                    href={packageDetails.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Home className="h-5 w-5" />
                    <span>Homepage</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {packageDetails.bugs && (
                  <a
                    href={packageDetails.bugs.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Bug className="h-5 w-5" />
                    <span>Issues</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                {packageDetails.description || 'No description available.'}
              </p>
            </div>

            {/* Keywords */}
            {packageDetails.keywords && packageDetails.keywords.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {packageDetails.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1 border border-purple-500/30"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{keyword}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <div className="border-b border-slate-700/50">
                <div className="flex space-x-0 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.id === 'snippets' && (
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                          AI
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Scripts */}
                    {packageDetails.scripts && Object.keys(packageDetails.scripts).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Code className="h-5 w-5 text-purple-400" />
                          <span>Scripts</span>
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(packageDetails.scripts).map(([script, command]) => (
                            <div key={script} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-white">{script}</div>
                                <button
                                  onClick={() => copyToClipboard(`npm run ${script}`, `script-${script}`)}
                                  className="text-slate-400 hover:text-white transition-colors"
                                  title="Copy npm run command"
                                >
                                  {copiedCommand === `script-${script}` ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              <div className="font-mono text-sm text-slate-300 bg-slate-900 p-3 rounded border">
                                {command}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Engines */}
                    {packageDetails.engines && Object.keys(packageDetails.engines).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <Settings className="h-5 w-5 text-purple-400" />
                          <span>Engine Requirements</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(packageDetails.engines).map(([engine, version]) => (
                            <div key={engine} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                              <div className="font-medium text-white capitalize">{engine}</div>
                              <div className="text-sm text-purple-300 font-mono">{version}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'snippets' && (
                  <SnippetGenerator 
                    packageName={packageDetails.name} 
                    readme={packageDetails.readme}
                  />
                )}

                {activeTab === 'dependencies' && (
                  <div className="space-y-6">
                    {/* Dependencies */}
                    {packageDetails.dependencies && Object.keys(packageDetails.dependencies).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Dependencies</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {Object.entries(packageDetails.dependencies).map(([dep, version]) => (
                            <div key={dep} className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                              <span className="font-mono text-sm text-white">{dep}</span>
                              <span className="text-sm text-purple-300 bg-purple-600/20 px-2 py-1 rounded border border-purple-500/30">{version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dev Dependencies */}
                    {packageDetails.devDependencies && Object.keys(packageDetails.devDependencies).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Dev Dependencies</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {Object.entries(packageDetails.devDependencies).map(([dep, version]) => (
                            <div key={dep} className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                              <span className="font-mono text-sm text-white">{dep}</span>
                              <span className="text-sm text-blue-300 bg-blue-600/20 px-2 py-1 rounded border border-blue-500/30">{version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Peer Dependencies */}
                    {packageDetails.peerDependencies && Object.keys(packageDetails.peerDependencies).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Peer Dependencies</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {Object.entries(packageDetails.peerDependencies).map(([dep, version]) => (
                            <div key={dep} className="flex justify-between items-center py-3 px-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                              <span className="font-mono text-sm text-white">{dep}</span>
                              <span className="text-sm text-yellow-300 bg-yellow-600/20 px-2 py-1 rounded border border-yellow-500/30">{version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!packageDetails.dependencies || Object.keys(packageDetails.dependencies).length === 0) &&
                     (!packageDetails.devDependencies || Object.keys(packageDetails.devDependencies).length === 0) &&
                     (!packageDetails.peerDependencies || Object.keys(packageDetails.peerDependencies).length === 0) && (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No dependencies found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Version History</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getVersionHistory().map((version) => (
                        <div key={version.version} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Tag className="h-4 w-4 text-purple-400" />
                              <span className="font-mono text-white">{version.version}</span>
                              {version.version === packageDetails.version && (
                                <span className="bg-green-600/20 text-green-300 px-2 py-0.5 rounded text-xs border border-green-500/30">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-400">
                              {formatDate(version.date)}
                            </div>
                          </div>
                          {version.dist && (
                            <div className="text-sm text-slate-400">
                              Size: {formatFileSize(version.dist.unpackedSize)} • 
                              Files: {version.dist.fileCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'readme' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">README</h3>
                    {packageDetails.readme ? (
                      <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                        <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
                          {packageDetails.readme}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No README available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'discussions' && (
                  <RealWorldDiscussions packageName={packageDetails.name} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
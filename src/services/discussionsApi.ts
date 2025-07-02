import { Discussion, DiscussionsResponse, RedditResponse, StackOverflowResponse, GitHubResponse } from '../types/discussions';

export class DiscussionsApiService {
  private static readonly REDDIT_API_URL = 'https://www.reddit.com/search.json';
  private static readonly STACKOVERFLOW_API_URL = 'https://api.stackexchange.com/2.3/search/advanced';
  private static readonly GITHUB_API_URL = 'https://api.github.com/search/issues';

  static async getPackageDiscussions(packageName: string): Promise<DiscussionsResponse> {
    try {
      const [redditDiscussions, stackOverflowDiscussions, githubDiscussions] = await Promise.allSettled([
        this.fetchRedditDiscussions(packageName),
        this.fetchStackOverflowDiscussions(packageName),
        this.fetchGitHubDiscussions(packageName)
      ]);

      const allDiscussions: Discussion[] = [];

      // Process Reddit results
      if (redditDiscussions.status === 'fulfilled') {
        allDiscussions.push(...redditDiscussions.value);
      }

      // Process Stack Overflow results
      if (stackOverflowDiscussions.status === 'fulfilled') {
        allDiscussions.push(...stackOverflowDiscussions.value);
      }

      // Process GitHub results
      if (githubDiscussions.status === 'fulfilled') {
        allDiscussions.push(...githubDiscussions.value);
      }

      // Sort by creation date (newest first)
      allDiscussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        discussions: allDiscussions.slice(0, 15), // Limit to 15 total results
        total: allDiscussions.length
      };
    } catch (error) {
      console.error('Error fetching discussions:', error);
      return {
        discussions: [],
        total: 0,
        error: 'Failed to fetch discussions'
      };
    }
  }

  private static async fetchRedditDiscussions(packageName: string): Promise<Discussion[]> {
    try {
      const query = encodeURIComponent(`"${packageName}" npm OR javascript OR node`);
      const response = await fetch(`${this.REDDIT_API_URL}?q=${query}&limit=5&sort=new&t=month`);
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.statusText}`);
      }

      const data: RedditResponse = await response.json();
      
      return data.data.children.map(post => ({
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        source: 'reddit' as const,
        createdAt: new Date(post.data.created_utc * 1000).toISOString(),
        excerpt: this.truncateText(post.data.selftext, 200),
        score: post.data.score,
        author: post.data.author
      }));
    } catch (error) {
      console.warn('Failed to fetch Reddit discussions:', error);
      return [];
    }
  }

  private static async fetchStackOverflowDiscussions(packageName: string): Promise<Discussion[]> {
    try {
      const query = encodeURIComponent(packageName);
      const response = await fetch(
        `${this.STACKOVERFLOW_API_URL}?order=desc&sort=creation&q=${query}&site=stackoverflow&pagesize=5&filter=withbody`
      );
      
      if (!response.ok) {
        throw new Error(`Stack Overflow API error: ${response.statusText}`);
      }

      const data: StackOverflowResponse = await response.json();
      
      return data.items.map(question => ({
        id: `stackoverflow-${question.question_id}`,
        title: question.title,
        url: question.link,
        source: 'stackoverflow' as const,
        createdAt: new Date(question.creation_date * 1000).toISOString(),
        excerpt: this.truncateText(question.excerpt || '', 200),
        score: question.score,
        author: question.owner?.display_name
      }));
    } catch (error) {
      console.warn('Failed to fetch Stack Overflow discussions:', error);
      return [];
    }
  }

  private static async fetchGitHubDiscussions(packageName: string): Promise<Discussion[]> {
    try {
      const query = encodeURIComponent(`"${packageName}" type:issue state:open`);
      const response = await fetch(`${this.GITHUB_API_URL}?q=${query}&per_page=5&sort=created`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data: GitHubResponse = await response.json();
      
      return data.items.map(issue => ({
        id: `github-${issue.id}`,
        title: issue.title,
        url: issue.html_url,
        source: 'github' as const,
        createdAt: issue.created_at,
        excerpt: this.truncateText(issue.body || '', 200),
        author: issue.user.login
      }));
    } catch (error) {
      console.warn('Failed to fetch GitHub discussions:', error);
      return [];
    }
  }

  private static truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength).trim() + '...';
  }

  static formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  static getSourceIcon(source: string): string {
    switch (source) {
      case 'reddit':
        return '🔴';
      case 'stackoverflow':
        return '🟠';
      case 'github':
        return '⚫';
      default:
        return '💬';
    }
  }

  static getSourceColor(source: string): string {
    switch (source) {
      case 'reddit':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'stackoverflow':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'github':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  }
}
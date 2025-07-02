export interface Discussion {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'stackoverflow' | 'github';
  createdAt: string;
  excerpt?: string;
  score?: number;
  author?: string;
}

export interface DiscussionsResponse {
  discussions: Discussion[];
  total: number;
  error?: string;
}

export interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    created_utc: number;
    selftext: string;
    score: number;
    author: string;
    subreddit: string;
  };
}

export interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export interface StackOverflowQuestion {
  question_id: number;
  title: string;
  link: string;
  creation_date: number;
  score: number;
  owner: {
    display_name: string;
  };
  body_markdown?: string;
  excerpt?: string;
}

export interface StackOverflowResponse {
  items: StackOverflowQuestion[];
}

export interface GitHubIssue {
  id: number;
  title: string;
  html_url: string;
  created_at: string;
  body: string;
  user: {
    login: string;
  };
  repository_url: string;
}

export interface GitHubResponse {
  items: GitHubIssue[];
}
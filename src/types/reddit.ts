export interface RedditPostData {
    id: string;
    parsedId?: string;
    title: string;
    body?: string;
    communityName: string;
    parsedCommunityName?: string;
    createdAt: string | number;
    url: string;
  }
  
  export interface ProcessedRedditPost {
    redditId: string;
    title: string;
    text: string;
    url: string;
    subreddit: string;
    author: string;
    createdAt: Date;
    productId: string;
    engagement: string;
    fit: number;
    authenticity: number;
    lead: number;
    isFavorited: boolean;
    isReplied: boolean;
    latestReply: string | null;
  }
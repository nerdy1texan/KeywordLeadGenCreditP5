// src/types/product.ts

export type Plan = {
  id?: string;
  name: string;
  price: number;
  features: string[];
  productId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubredditSuggestion = {
  id?: string;
  name: string;
  title: string;
  description: string;
  memberCount: number;
  url: string;
  relevanceScore: number;
  matchReason?: string;
  isMonitored: boolean;
  productId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProductFormData = {
  name: string;
  url?: string;
  description: string;
  keywords: string[];
  plans?: Plan[];
};

export type Product = {
  id: string;
  name: string;
  url?: string;
  description: string;
  keywords: string[];
  plans: Plan[];
  subredditSuggestions: SubredditSuggestion[];
  redditPosts?: RedditPost[];
  tweets?: Tweet[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export interface Tweet {
  id: string;
  twitterId: string;
  text: string;
  url: string;
  author: string;
  authorUsername: string;
  createdAt: Date;
  productId: string;
  engagement: 'unseen' | 'seen' | 'engaged' | 'converted' | 'HOT';
  fit: number;
  authenticity: number;
  lead: number;
  isFavorited: boolean;
  isReplied: boolean;
  latestReply: string | null;
  replyCount: number;
  retweetCount: number;
  likeCount: number;
}

export interface RedditPost {
  id: string;
  redditId: string;
  title: string;
  text: string;
  url: string;
  subreddit: string;
  author: string;
  createdAt: Date;
  productId: string;
  engagement?: 'unseen' | 'seen' | 'engaged' | 'converted' | 'HOT';
  fit: number;
  authenticity: number;
  lead: number;
  isFavorited: boolean;
  isReplied: boolean;
  latestReply: string | null;
}

export type CreateRedditPost = Omit<RedditPost, 'id'>;
export type UpdateRedditPost = Partial<Omit<RedditPost, 'id' | 'redditId' | 'productId'>>;
export type CreateTweet = Omit<Tweet, 'id'>;
export type UpdateTweet = Partial<Omit<Tweet, 'id' | 'twitterId' | 'productId'>>;
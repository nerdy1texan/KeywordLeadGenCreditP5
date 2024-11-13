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
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type RedditPost = {
  id: string;
  title: string;
  content: string;
  url: string;
  productId: string;
  createdAt: Date;
};

export interface RedditPostData {
    id: string;
    parsedId?: string;
    title: string;
    body?: string;
    communityName: string;
    parsedCommunityName?: string;
    createdAt: string | number;
    url: string;
    author?: string;
}

export function isRedditPostData(obj: unknown): obj is RedditPostData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        typeof obj.id === 'string' &&
        'title' in obj &&
        typeof obj.title === 'string' &&
        'communityName' in obj &&
        typeof obj.communityName === 'string' &&
        'createdAt' in obj &&
        (typeof obj.createdAt === 'string' || typeof obj.createdAt === 'number') &&
        'url' in obj &&
        typeof obj.url === 'string'
    );
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
export interface TwitterPostData {
    id: string;
    text: string;
    fullText?: string;
    url: string;
    author: {
        userName: string;
        name: string;
    };
    createdAt: string;
    replyCount: number;
    retweetCount: number;
    likeCount: number;
}

export interface ProcessedTweet {
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

export function isTwitterPostData(obj: any): obj is TwitterPostData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.text === 'string' &&
        typeof obj.url === 'string' &&
        typeof obj.author === 'object' &&
        obj.author !== null &&
        typeof obj.author.userName === 'string' &&
        typeof obj.author.name === 'string' &&
        typeof obj.createdAt === 'string'
    );
}

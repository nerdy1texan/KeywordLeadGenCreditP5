export interface ApifySubredditResponse {
    dataType: 'community' | 'post';
    numberOfMembers: number;
    displayName?: string;
    title: string;
    description?: string;
    url: string;
  }

export function isApifySubredditResponse(obj: unknown): obj is ApifySubredditResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'dataType' in obj &&
        (obj.dataType === 'community' || obj.dataType === 'post') &&
        'numberOfMembers' in obj &&
        typeof obj.numberOfMembers === 'number' &&
        'title' in obj &&
        typeof obj.title === 'string' &&
        'url' in obj &&
        typeof obj.url === 'string'
    );
}
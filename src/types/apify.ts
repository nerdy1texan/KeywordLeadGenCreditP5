export interface ApifySubredditResponse {
    dataType: 'community' | 'post';
    numberOfMembers: number;
    displayName?: string;
    title: string;
    description?: string;
    url: string;
    over18?: boolean;
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
        typeof obj.url === 'string' &&
        (!('over18' in obj) || typeof obj.over18 === 'boolean') &&
        (!('description' in obj) || typeof obj.description === 'string') &&
        (!('displayName' in obj) || typeof obj.displayName === 'string')
    );
}
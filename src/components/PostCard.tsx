import { RedditPost } from '@prisma/client';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';

interface PostCardProps {
  post: RedditPost;
  onGenerateReply: () => void;
}

export function PostCard({ post, onGenerateReply }: PostCardProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Badge 
          variant={post.engagement === 'HOT' ? 'destructive' : 'default'}
          className="mb-2"
        >
          {post.engagement}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm"
          className={post.isFavorited ? 'text-yellow-400' : 'text-gray-400'}
        >
          <Star className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-3">{post.text}</p>

      {/* Metrics */}
      <div className="flex gap-2 mb-4">
        <Badge variant="outline">Fit: {post.fit}%</Badge>
        <Badge variant="outline">Auth: {post.authenticity}%</Badge>
        <Badge variant="outline">Lead: {post.lead}%</Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>r/{post.subreddit}</span>
        <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={onGenerateReply}
          className="flex-1"
        >
          Generate Reply
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.open(post.url, '_blank')}
        >
          View Post
        </Button>
      </div>
    </div>
  );
}

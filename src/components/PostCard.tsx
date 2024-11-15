import { RedditPost } from '@prisma/client';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Star, ExternalLink } from 'lucide-react';

interface PostCardProps {
  post: RedditPost;
  onGenerateReply: () => void;
}

export function PostCard({ post, onGenerateReply }: PostCardProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all w-full mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg text-white/90">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span>r/{post.subreddit}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-yellow-400 transition-colors">
          <Star className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-gray-300 whitespace-pre-wrap">
          {post.text}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button 
          onClick={onGenerateReply}
          className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Generate Reply
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.open(post.url, '_blank')}
          className="px-3"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

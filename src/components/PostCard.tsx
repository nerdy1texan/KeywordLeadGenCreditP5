import { RedditPost, Product } from '@/types/product';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Star, ExternalLink, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { useToast } from './ui/use-toast';
import { CommentBuilder } from './CommentBuilder';

interface PostCardProps {
  post: RedditPost & {
    product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
  };
  onReplyGenerated: (reply: string) => void;
}

type ExtendedRedditPost = RedditPost & { 
  product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
  latestReply: string | null;
};

export function PostCard({ post: initialPost, onReplyGenerated }: PostCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplied, setIsReplied] = useState(initialPost.isReplied);
  const [showCommentBuilder, setShowCommentBuilder] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplyExpanded, setIsReplyExpanded] = useState(false);
  const { toast } = useToast();
  const [post, setPost] = useState<ExtendedRedditPost>({
    ...initialPost,
    latestReply: initialPost.latestReply ?? null
  });
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  const MAX_CHARS = 300;
  const shouldTruncate = post.text.length > MAX_CHARS;
  const displayText = !isExpanded && shouldTruncate 
    ? `${post.text.slice(0, MAX_CHARS)}...` 
    : post.text;

  const shouldTruncateReply = post.latestReply && post.latestReply.length > MAX_CHARS;
  const displayReply = !isReplyExpanded && shouldTruncateReply && post.latestReply
    ? `${post.latestReply.slice(0, MAX_CHARS)}...`
    : post.latestReply;

  const handleGenerateReply = async () => {
    try {
      if (isGenerating) return;
      setIsGenerating(true);
      
      const response = await fetch(`/api/posts/${post.id}/reply`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate reply');
      }

      const updatedPost = await response.json();
      
      setPost(prevPost => ({
        ...prevPost,
        latestReply: updatedPost.latestReply ?? null,
        product: updatedPost.product
      }));

      setShowCommentBuilder(true);
      toast("Reply generated successfully!", "success");
    } catch (error) {
      console.error('Generate reply error:', error);
      toast("Failed to generate reply. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReply = async () => {
    if (post.latestReply) {
      await navigator.clipboard.writeText(post.latestReply);
      toast("Reply copied to clipboard", "success");
    }
  };

  const handleReplyStatusChange = async (checked: boolean) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isReplied: checked }),
      });

      if (!response.ok) throw new Error('Failed to update reply status');

      setIsReplied(checked);
      toast(
        checked ? "Post has been marked as replied" : "Post has been marked as not replied",
        "success"
      );
    } catch (error) {
      toast("Failed to update reply status", "error");
    }
  };

  const handleReplyUpdate = (updatedPost: RedditPost & { 
    product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
  }) => {
    setPost({
      ...updatedPost,
      latestReply: updatedPost.latestReply ?? null
    });
    setShowCommentBuilder(false);
  };

  const generateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'twitter', // or determine dynamically based on post type
        }),
      });

      if (!response.ok) throw new Error('Failed to generate reply');
      
      const data = await response.json();
      
      // Update the local post state with the new reply
      setPost(prevPost => ({
        ...prevPost,
        latestReply: data.reply,
        isReplied: true
      }));

      // Notify parent component
      if (onReplyGenerated) {
        onReplyGenerated(data.reply);
      }

      toast({
        title: "Reply generated",
        description: "The reply has been generated successfully.",
      });

    } catch (error) {
      console.error('Error generating reply:', error);
      toast({
        title: "Error",
        description: "Failed to generate reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-[#5244e1] rounded-xl p-6 transition-all w-full mb-6 shadow-sm hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg text-gray-900 dark:text-white/90">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>r/{post.subreddit}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-[var(--accent-base)] transition-colors">
          <Star className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words text-sm sm:text-base">
          {displayText.split(/\s+/).map((word, index) => {
            if (word.match(/^(https?:\/\/[^\s]+)/)) {
              return (
                <span key={index}>
                  <a 
                    href={word}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {word}
                  </a>
                  {' '}
                </span>
              );
            }
            return word + ' ';
          })}
        </p>
        {shouldTruncate && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[#5244e1] hover:text-[#5244e1]/90 p-0 h-auto font-medium flex items-center gap-1 bg-[#5244e1]/10 hover:bg-[#5244e1]/20 px-2 py-1 rounded-md"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show full post
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Generated Reply section with updated styling */}
      {post.latestReply && (
        <div className="mt-6">
          <div className="rounded-lg border-2 border-[#5244e1]/30">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated Reply</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyReply}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`replied-${post.id}`}
                      checked={isReplied}
                      onCheckedChange={handleReplyStatusChange}
                    />
                    <label
                      htmlFor={`replied-${post.id}`}
                      className="text-sm text-gray-400"
                    >
                      Mark as Replied
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                {displayReply}
              </p>
              {shouldTruncateReply && (
                <Button
                  variant="ghost"
                  onClick={() => setIsReplyExpanded(!isReplyExpanded)}
                  className="mt-2 text-[#5244e1] hover:text-[#5244e1]/90 p-0 h-auto font-medium flex items-center gap-1 bg-[#5244e1]/10 hover:bg-[#5244e1]/20 px-2 py-1 rounded-md"
                >
                  {isReplyExpanded ? (
                    <>
                      Show less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show full reply
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {post.latestReply && showCommentBuilder && (
        <CommentBuilder
          isOpen={showCommentBuilder}
          onClose={() => {
            setShowCommentBuilder(false);
            handleGenerateReply();
          }}
          post={post}
          onReplyUpdate={handleReplyUpdate}
        />
      )}

      {/* Actions with updated button logic */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {!post.latestReply && (
            <Button 
              onClick={generateReply}
              disabled={isGeneratingReply}
              className="w-full bg-[#5244e1] hover:bg-opacity-90 text-white font-medium"
            >
              {isGeneratingReply ? 'Generating...' : 'Generate Reply'}
            </Button>
          )}
          {post.latestReply && (
            <Button
              onClick={() => setShowCommentBuilder(true)}
              disabled={showCommentBuilder}
              className="w-full bg-[#5244e1] hover:bg-opacity-90 text-white flex items-center justify-center gap-2"
            >
              <span>AI Reply Assistant</span>
              {showCommentBuilder && <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <Button 
          variant="outline"
          onClick={() => window.open(post.url, '_blank')}
          className="px-3 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

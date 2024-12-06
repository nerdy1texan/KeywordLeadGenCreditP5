// src/components/MainDashboard.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CommentBuilder } from "./CommentBuilder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { SubredditSuggestion, Tweet } from "@/types/product";
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { RefreshCw, UsersIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { MonitoringDialog } from "./MonitoringDialog";
import type { RedditPost, Product } from '@prisma/client';
import { PostCard } from './PostCard';
import { PostFilters } from '@/components/PostFilters';
import Masonry from 'react-masonry-css';

interface MainDashboardProps {
  productId: string;
}

// Define the engagement type to match the Prisma schema
type Engagement = 'unseen' | 'seen' | 'engaged' | 'converted' | 'HOT';

// Update PostWithProduct to exactly match CommentBuilder's expected type
type PostWithProduct = Omit<RedditPost, 'engagement' | 'product'> & {
  engagement: Engagement;
  product: {
    name: string;
    description: string;
    keywords: string[];
    url: string | undefined;
  };
};

// Add TweetWithProduct type
type TweetWithProduct = Omit<Tweet, 'engagement' | 'product'> & {
  engagement: Engagement;
  product: {
    name: string;
    description: string;
    keywords: string[];
    url: string | undefined;
  };
};

// Update the PostCard props type to include onGenerateReply
type ExtendedPost = RedditPost & {
  product: Pick<Product, "name" | "url" | "description" | "keywords">;
};

export default function MainDashboard({ productId }: MainDashboardProps) {
  const [posts, setPosts] = useState<PostWithProduct[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [monitoredSubreddits, setMonitoredSubreddits] = useState<SubredditSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithProduct | null>(null);
  const [showCommentBuilder, setShowCommentBuilder] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: 'all',
    subreddit: 'all',
    platform: 'reddit' as 'reddit' | 'twitter'
  });
  const [showMonitoringDialog, setShowMonitoringDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        timeRange: filters.timeRange,
        ...(filters.subreddit !== 'all' && { subreddit: filters.subreddit })
      });
      
      const response = await fetch(`/api/products/${productId}/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      // Transform the data to match PostWithProduct type
      const postsWithProduct: PostWithProduct[] = data.map((post: RedditPost) => ({
        ...post,
        engagement: post.engagement as 'unseen' | 'seen' | 'engaged' | 'converted' | 'HOT',
        product: {
          name: currentProduct?.name || '',
          description: currentProduct?.description || '',
          keywords: currentProduct?.keywords || [],
          url: currentProduct?.url || undefined
        }
      }));
      setPosts(postsWithProduct);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast('Failed to fetch posts. Please try again.', 'error');
    }
  };

  const fetchTweets = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/tweets`);
      if (!response.ok) throw new Error('Failed to fetch tweets');
      const data = await response.json();
      setTweets(data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast('Failed to fetch tweets', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isInitialLoad) setIsLoading(true);
        
        if (filters.platform === 'reddit') {
          await Promise.all([
            fetchPosts(),
            fetchMonitoredSubreddits()
          ]);
        } else {
          await fetchTweets();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    void fetchData();
  }, [productId, filters]);

  const fetchMonitoredSubreddits = async () => {
    try {
      const response = await fetch('/api/reddit/monitored-subreddits', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch monitored subreddits');
      }
      
      const data = await response.json();
      setMonitoredSubreddits(data);
    } catch (error) {
      console.error('Failed to fetch monitored subreddits:', error);
    }
  };

  useEffect(() => {
    void fetchMonitoredSubreddits().catch(console.error);
  }, [productId]);

  useEffect(() => {
    if (monitoredSubreddits.length > 0) {
      void fetchPosts();
    }
  }, [monitoredSubreddits, productId, filters]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products/latest');
        if (response.ok) {
          const data = await response.json();
          setCurrentProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    void fetchProduct();
  }, []);

  const breakpointColumnsObj = {
    default: 4,
    3000: 4,
    2000: 3,
    1200: 2,
    700: 1
  };

  const handleSubredditChange = (subreddit: string) => {
    setFilters(prev => ({ ...prev, subreddit }));
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setFilters(prev => ({ ...prev, timeRange }));
  };

  const handlePlatformChange = (platform: 'reddit' | 'twitter') => {
    setFilters(prev => ({ ...prev, platform }));
  };

  const handleRefresh = useCallback(async () => {
    try {
      if (filters.platform === 'reddit') {
        await fetchPosts();
      } else {
        await fetchTweets();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [filters.platform]);

  const startMonitoringTweets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/twitter/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          tweetCount: 50, // Fetch 50 tweets by default
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start tweet monitoring');
      }

      await fetchTweets();
      toast('Started monitoring tweets successfully', 'success');
    } catch (error) {
      console.error('Error starting tweet monitoring:', error);
      toast('Failed to start tweet monitoring. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyToTweet = async (tweetId: string, replyText: string) => {
    try {
      const response = await fetch(`/api/tweet-replies/${tweetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: replyText }),
      });

      if (!response.ok) {
        throw new Error('Failed to reply to tweet');
      }

      await fetchTweets(); // Refresh tweets after reply
      toast('Reply sent successfully', 'success');
    } catch (error) {
      console.error('Error replying to tweet:', error);
      toast('Failed to send reply. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[2000px] mx-auto">
      {!productId ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Reddit Lead Monitor
              </h1>
              <Button
                onClick={() => setShowMonitoringDialog(true)}
                className="w-full sm:w-auto bg-[#5244e1] hover:bg-opacity-90 text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Start Monitoring
              </Button>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Monitor and analyze posts from your selected communities
            </p>
          </div>

          {/* Add the dialog */}
          {currentProduct && (
            <MonitoringDialog
              isOpen={showMonitoringDialog}
              onClose={() => setShowMonitoringDialog(false)}
              monitoredSubreddits={monitoredSubreddits}
              productId={currentProduct.id}
              onSuccess={handleRefresh}
            />
          )}

          {/* Monitored Communities Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Monitored Communities</h2>
            <p className="text-gray-400 mb-4">Click on a community card or use the tabs below to filter posts</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {monitoredSubreddits.map((subreddit) => (
                <motion.div
                  key={subreddit.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    subreddit: subreddit.name
                  }))}
                  className="cursor-pointer"
                >
                  <div className="relative group h-[280px] transform transition-all duration-200 hover:scale-[1.02]">
                    <div className="relative h-full p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-900 border-2 border-[#5244e1]/30 hover:border-[#5244e1] transition-colors flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="max-w-[70%]">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            r/{subreddit.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <UsersIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {(subreddit.memberCount || 0).toLocaleString()} members
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex-grow overflow-hidden">
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
                          {subreddit.description || 'No description available'}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          className="text-[#5244e1] hover:bg-[#5244e1]/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilters(prev => ({
                              ...prev,
                              subreddit: subreddit.name
                            }));
                          }}
                        >
                          View Posts →
                        </Button>
                        <a 
                          href={subreddit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            Visit Reddit
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Post Filtering */}
          <div className="sticky top-0 z-10">
            <div className="relative bg-[var(--primary-dark)]/80 backdrop-blur-lg p-4 rounded-lg shadow-lg border-2 border-transparent bg-clip-padding"
                 style={{ 
                   backgroundImage: `linear-gradient(var(--primary-dark)/80, var(--primary-dark)/80), linear-gradient(to right, var(--accent-base), #b06ab3, var(--accent-base))`,
                   backgroundOrigin: 'border-box',
                   backgroundClip: 'padding-box, border-box'
                 }}>
              <PostFilters 
                subreddits={monitoredSubreddits.map(sub => sub.name)}
                selectedSubreddit={filters.subreddit}
                timeRange={filters.timeRange}
                onSubredditChange={handleSubredditChange}
                onTimeRangeChange={handleTimeRangeChange}
                onPlatformChange={handlePlatformChange}
                platform={filters.platform}
              />
            </div>
          </div>

          {/* Posts Masonry Grid */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array(6).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="h-[300px] rounded-xl bg-[var(--primary-dark)]/50 animate-pulse border border-gray-800/20" 
                />
              ))}
            </motion.div>
          ) : filters.platform === 'reddit' ? (
            posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300">No posts found. Try adjusting your filters or start monitoring.</p>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
              >
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReplyGenerated={() => {
                      handleRefresh();
                    }}
                  />
                ))}
              </Masonry>
            )
          ) : (
            // Twitter content
            tweets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300">No tweets found. Try adjusting your filters or start monitoring tweets.</p>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
              >
                {tweets.map((tweet) => {
                  const postData = {
                    ...tweet,
                    redditId: tweet.id,
                    title: '',
                    subreddit: '',
                    text: tweet.text || '',
                    url: tweet.url || '',
                    author: tweet.author || '',
                    createdAt: tweet.createdAt,
                    productId: tweet.productId,
                    engagement: "unseen" as "unseen" | "seen" | "engaged" | "converted" | "HOT",
                    fit: tweet.fit || 0,
                    authenticity: tweet.authenticity || 0,
                    lead: tweet.lead || 0,
                    isFavorited: tweet.isFavorited || false,
                    isReplied: tweet.isReplied || false,
                    latestReply: tweet.latestReply,
                    product: currentProduct ? {
                      name: currentProduct.name,
                      description: currentProduct.description,
                      keywords: currentProduct.keywords,
                      url: currentProduct.url || undefined
                    } : {
                      name: '',
                      description: '',
                      keywords: [],
                      url: undefined
                    }
                  };

                  return (
                    <PostCard
                      key={tweet.id}
                      post={postData}
                      onReplyGenerated={() => {
                        handleRefresh();
                      }}
                    />
                  );
                })}
              </Masonry>
            )
          )}

          {/* Comment Builder Dialog */}
          {selectedPost && (
            <CommentBuilder
              isOpen={showCommentBuilder}
              onClose={() => {
                setShowCommentBuilder(false);
                setSelectedPost(null);
              }}
              post={selectedPost}
            />
          )}
        </>
      )}
    </div>
  );
}

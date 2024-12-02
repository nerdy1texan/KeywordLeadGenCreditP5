// src/components/MainDashboard.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CommentBuilder } from "./CommentBuilder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { SubredditSuggestion } from "@/types/product";
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
  engagement: 'unseen' | 'seen' | 'engaged' | 'converted' | 'HOT';
  product: {
    name: string;
    description: string;
    keywords: string[];
    url: string | undefined;
  };
};

export default function MainDashboard({ productId }: MainDashboardProps) {
  const [posts, setPosts] = useState<PostWithProduct[]>([]);
  const [monitoredSubreddits, setMonitoredSubreddits] = useState<SubredditSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithProduct | null>(null);
  const [showCommentBuilder, setShowCommentBuilder] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: 'all',
    subreddit: 'all'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isInitialLoad) setIsLoading(true);
        
        await Promise.all([
          fetchPosts(),
          fetchMonitoredSubreddits()
        ]);
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
    default: 3,
    1100: 2,
    700: 1
  };

  const handleSubredditChange = (subreddit: string) => {
    setFilters(prev => ({ ...prev, subreddit }));
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setFilters(prev => ({ ...prev, timeRange }));
  };

  const handleRefresh = useCallback(async () => {
    try {
      await fetchPosts();
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  }, [fetchPosts]);

  return (
    <div className="space-y-6 p-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="relative group min-h-[280px] transform transition-all duration-200 hover:scale-[1.02]">
                    <div className="relative h-full p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-900 border-2 border-[#5244e1]/30 hover:border-[#5244e1] transition-colors">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            r/{subreddit.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <UsersIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {(subreddit.memberCount || 0).toLocaleString()} members
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-[#5244e1] text-white whitespace-nowrap min-w-[90px] text-center">
                          {subreddit.relevanceScore}% match
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow line-clamp-3">
                        {subreddit.description || 'No description available'}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://reddit.com/r/${subreddit.name}`, '_blank');
                          }}
                        >
                          Visit Reddit
                        </Button>
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
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">No posts found. Try adjusting your filters or start monitoring.</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex -ml-6 w-auto"
              columnClassName="pl-6 bg-clip-padding"
            >
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onGenerateReply={() => {
                    setSelectedPost(post);
                    setShowCommentBuilder(true);
                  }}
                />
              ))}
            </Masonry>
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

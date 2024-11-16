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
type PostWithProduct = RedditPost & { 
  product: Pick<Product, 'name' | 'description' | 'keywords' | 'url'>;
};

export default function MainDashboard({ productId }: MainDashboardProps) {
  const [posts, setPosts] = useState<PostWithProduct[]>([]);
  const [monitoredSubreddits, setMonitoredSubreddits] = useState<SubredditSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
        engagement: post.engagement as Engagement, // Type assertion here is safe because we know the values
        product: {
          name: currentProduct?.name || '',
          description: currentProduct?.description || '',
          keywords: currentProduct?.keywords || [],
          url: currentProduct?.url || null
        }
      }));
      setPosts(postsWithProduct);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast("Failed to fetch posts. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchPosts();
    }
  }, [productId, filters]);

  const fetchMonitoredSubreddits = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoredSubreddits();
  }, []);

  useEffect(() => {
    if (monitoredSubreddits.length > 0) {
      fetchPosts();
    }
  }, [filters]);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch('/api/products/latest');
      if (response.ok) {
        const data = await response.json();
        setCurrentProduct(data);
      }
    };
    fetchProduct();
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

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    await fetchPosts();
    await fetchMonitoredSubreddits();
    setLoading(false);
  }, [filters, productId]);

  return (
    <div className="space-y-6 p-6">
      {!productId ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Reddit Lead Monitor</h1>
              <p className="text-gray-400">
                Monitor and analyze posts from your selected communities
              </p>
            </div>
            <Button 
              onClick={() => setShowMonitoringDialog(true)}
              disabled={!currentProduct || monitoredSubreddits.length === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Start Monitoring
            </Button>
          </div>

          {/* Add the dialog */}
          {currentProduct && (
            <MonitoringDialog
              isOpen={showMonitoringDialog}
              onClose={() => setShowMonitoringDialog(false)}
              monitoredSubreddits={monitoredSubreddits}
              productId={currentProduct.id}
              onSuccess={refreshDashboard}
            />
          )}

          {/* Monitored Communities Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Monitored Communities</h2>
            <p className="text-gray-400 mb-4">Click on a community card or use the tabs below to filter posts</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monitoredSubreddits.map((subreddit, index) => (
                <motion.div
                  key={subreddit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    subreddit: subreddit.name
                  }))}
                  className="cursor-pointer"
                >
                  <div className="relative group h-[280px] transform transition-all duration-200 hover:scale-102">
                    <div 
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-200 opacity-75 group-hover:opacity-100"
                    />
                    <div className="relative h-full p-6 rounded-xl border border-gray-800/50 bg-gray-900/90 backdrop-blur-sm flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors">
                            r/{subreddit.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <UsersIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">
                              {(subreddit.memberCount || 0).toLocaleString()} members
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                          {subreddit.relevanceScore}% match
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-400 flex-grow line-clamp-3">
                        {subreddit.description || 'No description available'}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-800/50">
                        <Button
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
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
                          className="text-gray-400 hover:text-gray-300"
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
          <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg p-4 rounded-lg border border-gray-800/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filters.subreddit === 'all' ? 'default' : 'outline'}
                  onClick={() => handleSubredditChange('all')}
                  className="whitespace-nowrap"
                >
                  All Communities
                </Button>
                {monitoredSubreddits.map(sub => (
                  <Button
                    key={sub.name}
                    variant={filters.subreddit === sub.name ? 'default' : 'outline'}
                    onClick={() => handleSubredditChange(sub.name)}
                    className="whitespace-nowrap"
                  >
                    r/{sub.name}
                  </Button>
                ))}
              </div>
              
              <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="day">Past Day</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posts Masonry Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[300px] rounded-xl bg-gray-800/50 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts found. Try adjusting your filters or start monitoring.</p>
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

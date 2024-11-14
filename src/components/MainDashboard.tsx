// src/components/MainDashboard.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CommentBuilder } from "./CommentBuilder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { RedditPost, SubredditSuggestion } from "@/types/product";
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { RefreshCw, UsersIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

export default function MainDashboard() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [monitoredSubreddits, setMonitoredSubreddits] = useState<SubredditSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [showCommentBuilder, setShowCommentBuilder] = useState(false);
  const [generatedReply, setGeneratedReply] = useState('');
  const [filters, setFilters] = useState({
    timeRange: 'all',
    subreddits: [] as string[],
    onlyUnseen: false,
    onlyFavorited: false,
  });
  const [stats, setStats] = useState({
    estimatedValue: 0,
    hotLeads: 0,
    meaningful: 0,
    unseen: 0,
  });
  const [isScrapingJob, setIsScrapingJob] = useState(false);
  const [scrapingConfig, setScrapingConfig] = useState({
    postsPerSubreddit: 10,
    timeRange: 'week' as 'day' | 'week' | 'month' | 'all'
  });

  useEffect(() => {
    fetchMonitoredSubreddits();
  }, []);

  useEffect(() => {
    if (monitoredSubreddits.length > 0) {
      fetchPosts();
    }
  }, [filters]);

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
      console.log('Fetched monitored subreddits:', data);
      
      setMonitoredSubreddits(data);
      if (data.length > 0) {
        setFilters(prev => ({
          ...prev,
          subreddits: data.map((sub: SubredditSuggestion) => sub.name)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch monitored subreddits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        subreddits: filters.subreddits.join(','),
        timeRange: filters.timeRange,
        onlyUnseen: filters.onlyUnseen.toString(),
        onlyFavorited: filters.onlyFavorited.toString(),
      });
      
      const response = await fetch(`/api/reddit/posts?${queryParams}`);
      const data = await response.json();
      setPosts(data);
      updateStats(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (posts: RedditPost[]) => {
    setStats({
      estimatedValue: calculateEstimatedValue(posts),
      hotLeads: posts.filter(p => p.lead >= 8).length,
      meaningful: posts.filter(p => p.engagement === 'meaningful').length,
      unseen: posts.filter(p => p.engagement === 'unseen').length,
    });
  };

  const startScraping = async () => {
    try {
      setIsScrapingJob(true);
      const response = await fetch('/api/reddit/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddits: filters.subreddits,
          ...scrapingConfig
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to start scraping job');
      }

      const data = await response.json();
      console.log('Scraping job started:', data);
      
      // Poll for updates or use WebSocket to get real-time updates
      // This depends on your backend implementation
    } catch (error) {
      console.error('Failed to start scraping:', error);
    } finally {
      setIsScrapingJob(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Reddit Lead Monitor</h1>
          <p className="text-gray-400">
            Monitor and analyze posts from your selected communities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={scrapingConfig.timeRange}
            onValueChange={(value) => setScrapingConfig(prev => ({ 
              ...prev, 
              timeRange: value as typeof scrapingConfig.timeRange 
            }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Past Day</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={startScraping}
            className="flex items-center gap-2"
            disabled={isScrapingJob || filters.subreddits.length === 0}
          >
            {isScrapingJob ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Start Scraping
              </>
            )}
          </Button>
        </div>
      </div>

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
                subreddits: [subreddit.name]
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
                          subreddits: [subreddit.name]
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

      {/* Post Filtering Tabs */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg p-4 rounded-lg border border-gray-800/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={filters.subreddits.length === monitoredSubreddits.length ? 'default' : 'outline'}
              onClick={() => setFilters(prev => ({
                ...prev,
                subreddits: monitoredSubreddits.map(s => s.name)
              }))}
            >
              All Communities
            </Button>
            {monitoredSubreddits.map(sub => (
              <Button
                key={sub.id}
                variant={filters.subreddits.includes(sub.name) ? 'default' : 'outline'}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  subreddits: [sub.name]
                }))}
              >
                r/{sub.name}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Select
              value={filters.timeRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}
            >
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
      </div>

      {/* Posts will be rendered below */}
    </div>
  );
}

function calculateEstimatedValue(posts: RedditPost[]): number {
  // Implement your value calculation logic here
  return posts.reduce((total, post) => total + (post.lead * 10), 0);
}

function PostCard({ post, onGenerateReply }: { post: RedditPost; onGenerateReply: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <Badge variant={post.engagement === 'meaningful' ? 'success' : 'default'}>
          {post.engagement?.toUpperCase()}
        </Badge>
        <Button variant="ghost" size="sm">⭐</Button>
      </div>
      <h3 className="font-semibold mb-2">{post.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{post.text.substring(0, 150)}...</p>
      
      <div className="flex gap-2 mb-4">
        <Badge variant="outline">Fit: {post.fit}</Badge>
        <Badge variant="outline">Auth: {post.authenticity}</Badge>
        <Badge variant="outline">Lead: {post.lead}</Badge>
      </div>

      <div className="flex gap-2">
        <Button onClick={onGenerateReply}>
          Generate Reply
        </Button>
        <Button variant="outline" onClick={() => window.open(post.url, '_blank')}>
          View Post
        </Button>
      </div>
    </Card>
  );
}

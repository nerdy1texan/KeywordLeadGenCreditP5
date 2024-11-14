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

  const refreshData = () => {
    fetchMonitoredSubreddits();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-end">
        <Button onClick={refreshData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Estimated Value</h3>
          <p className="text-2xl font-bold">${stats.estimatedValue}</p>
          <p className="text-xs text-gray-500">Calculated based on (AOV)</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Hot Leads</h3>
          <p className="text-2xl font-bold">{stats.hotLeads}</p>
          <p className="text-xs text-gray-500">0 - 0 potential sales!</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Meaningful</h3>
          <p className="text-2xl font-bold">{stats.meaningful}</p>
          <p className="text-xs text-gray-500">8 - 13 connections.</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Unseen Leads</h3>
          <p className="text-2xl font-bold">{stats.unseen}</p>
          <p className="text-xs text-gray-500">0 - 0% community growth.</p>
        </Card>
      </div>

      {/* New Monitored Subreddits Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Monitored Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitoredSubreddits.map((subreddit, index) => (
            <motion.div
              key={subreddit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200" />
                <div className="relative p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <a 
                      href={`https://reddit.com/r/${subreddit.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      r/{subreddit.name}
                    </a>
                    <Badge variant="outline" className="bg-gray-800/50">
                      {(subreddit.memberCount || 0).toLocaleString()} members
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {subreddit.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge 
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                      >
                        {subreddit.relevanceScore}% relevant
                      </Badge>
                      {subreddit.matchReason && (
                        <Badge 
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {subreddit.matchReason}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-300"
                      onClick={() => window.open(`https://reddit.com/r/${subreddit.name}`, '_blank')}
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {monitoredSubreddits.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No Subreddits Monitored</h3>
          <p className="text-gray-500 mb-4">
            Start monitoring subreddits to see relevant posts here.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard/products'}
          >
            Go to Product Settings
          </Button>
        </div>
      ) : (
        <>
          {/* Tabs Section */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {monitoredSubreddits.map((subreddit) => (
                <TabsTrigger key={subreddit.id} value={subreddit.name}>
                  /r/{subreddit.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              </div>
            </TabsContent>

            {monitoredSubreddits.map((subreddit) => (
              <TabsContent key={subreddit.id} value={subreddit.name}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {posts
                    .filter(post => post.subreddit === subreddit.name)
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onGenerateReply={() => {
                          setSelectedPost(post);
                          setShowCommentBuilder(true);
                        }}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Time Range Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filters.timeRange === 'all' ? 'default' : 'outline'}
                onClick={() => setFilters({ ...filters, timeRange: 'all' })}
              >
                All Time
              </Button>
              <Button
                variant={filters.timeRange === 'day' ? 'default' : 'outline'}
                onClick={() => setFilters({ ...filters, timeRange: 'day' })}
              >
                Day
              </Button>
              <Button
                variant={filters.timeRange === 'week' ? 'default' : 'outline'}
                onClick={() => setFilters({ ...filters, timeRange: 'week' })}
              >
                Week
              </Button>
              <Button
                variant={filters.timeRange === 'month' ? 'default' : 'outline'}
                onClick={() => setFilters({ ...filters, timeRange: 'month' })}
              >
                Month
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.onlyUnseen}
                  onChange={(e) => setFilters({ ...filters, onlyUnseen: e.target.checked })}
                />
                Only Show Unseen Leads
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.onlyFavorited}
                  onChange={(e) => setFilters({ ...filters, onlyFavorited: e.target.checked })}
                />
                Show Favorited Leads
              </label>
            </div>
          </div>
        </>
      )}

      {showCommentBuilder && selectedPost && (
        <CommentBuilder
          initialComment={generatedReply}
          postContext={{
            title: selectedPost.title,
            content: selectedPost.text,
            subreddit: selectedPost.subreddit,
          }}
          onSave={(comment) => {
            setGeneratedReply(comment);
            setShowCommentBuilder(false);
          }}
          onClose={() => setShowCommentBuilder(false)}
        />
      )}
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

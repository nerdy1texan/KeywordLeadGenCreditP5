// src/components/product/SubredditGrid.tsx

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type SubredditSuggestion } from "@/types/product";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { notify } from "@/components/Toaster";

interface SubredditGridProps {
  subreddits: SubredditSuggestion[];
  isLoading?: boolean;
  onSubredditsChange?: (subreddits: SubredditSuggestion[]) => void;
}

const getRelevanceBadgeVariant = (score: number) => {
  if (score >= 90) return "success-gradient";
  if (score >= 80) return "primary-gradient";
  return "secondary-gradient";
};

export function SubredditGrid({ subreddits, isLoading, onSubredditsChange }: SubredditGridProps) {
  const [monitoredSubreddits, setMonitoredSubreddits] = useState<SubredditSuggestion[]>(subreddits);

  useEffect(() => {
    setMonitoredSubreddits(subreddits);
  }, [subreddits]);

  const handleToggle = async (subreddit: SubredditSuggestion) => {
    try {
      if (!subreddit.id) {
        throw new Error("Subreddit ID is required");
      }

      console.log('Toggling subreddit:', {
        id: subreddit.id,
        name: subreddit.name,
        currentStatus: subreddit.isMonitored
      });

      const response = await fetch(`/api/reddit/subreddits/${subreddit.id}/monitor`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          isMonitored: !subreddit.isMonitored 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || data.details || "Failed to update monitoring status");
      }

      setMonitoredSubreddits((prev) =>
        prev.map((sub) => (sub.id === subreddit.id ? { ...sub, isMonitored: data.isMonitored } : sub))
      );

      notify({
        message: data.isMonitored 
          ? `Now monitoring r/${subreddit.name}`
          : `Stopped monitoring r/${subreddit.name}`,
        type: "success"
      });
    } catch (error: any) {
      console.error("Error updating monitoring status:", error);
      notify({
        message: `Failed to update monitoring status for r/${subreddit.name}: ${error.message}`,
        type: "error"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Finding Relevant Subreddits...</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedSubreddits = [...monitoredSubreddits].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {sortedSubreddits.length > 0 
          ? `Relevant Subreddits (${sortedSubreddits.length})`
          : "No relevant subreddits found yet"}
      </h3>
      <div className="max-h-[800px] overflow-y-auto pr-2">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedSubreddits.map((subreddit) => (
            <div key={subreddit.id || subreddit.name} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <a 
                  href={subreddit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  r/{subreddit.name}
                </a>
                <Badge variant="secondary">
                  {(subreddit.memberCount || 0).toLocaleString()} members
                </Badge>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">
                {subreddit.description || 'No description available'}
              </p>
              <div className="mt-2 flex gap-2">
                <Badge 
                  variant={getRelevanceBadgeVariant(subreddit.relevanceScore)} 
                  className="mt-2"
                >
                  Relevance: {Math.round(subreddit.relevanceScore)}%
                </Badge>
                <Switch
                  checked={subreddit.isMonitored}
                  onChange={() => handleToggle(subreddit)}
                  className="mt-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

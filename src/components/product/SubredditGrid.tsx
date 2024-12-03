// src/components/product/SubredditGrid.tsx

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[var(--primary-dark)] p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-5 w-16 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedSubreddits = [...monitoredSubreddits].sort((a, b) => b.memberCount - a.memberCount);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {sortedSubreddits.length > 0 
          ? `Relevant Subreddits (${sortedSubreddits.length})`
          : "No relevant subreddits found yet"}
      </h3>
      <div className="max-h-[800px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedSubreddits.map((subreddit) => (
            <div 
              key={subreddit.id || subreddit.name} 
              className="bg-white dark:bg-[var(--primary-dark)] p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex justify-between items-center"
            >
              <div className="flex flex-col min-w-0 flex-grow">
                <a 
                  href={subreddit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-white hover:text-[#5244e1] font-medium truncate transition-colors"
                >
                  r/{subreddit.name}
                </a>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {(subreddit.memberCount || 0).toLocaleString()} members
                </span>
              </div>
              <Switch
                checked={subreddit.isMonitored}
                onChange={() => handleToggle(subreddit)}
                className="data-[state=checked]:bg-[#5244e1] flex-shrink-0 ml-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

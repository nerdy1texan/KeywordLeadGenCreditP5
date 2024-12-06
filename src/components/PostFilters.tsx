import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface PostFiltersProps {
  subreddits: string[];
  selectedSubreddit: string;
  timeRange: string;
  onSubredditChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  onPlatformChange: (platform: 'reddit' | 'twitter') => void;
  platform: 'reddit' | 'twitter';
}

export function PostFilters({
  subreddits,
  selectedSubreddit,
  timeRange,
  platform,
  onSubredditChange,
  onTimeRangeChange,
  onPlatformChange
}: PostFiltersProps) {
  const [isHovered, setIsHovered] = useState(false);

  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'hour', label: 'Past Hour' },
    { value: 'day', label: 'Past 24 Hours' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Tabs
        value={platform}
        onValueChange={(value) => onPlatformChange(value as 'reddit' | 'twitter')}
        className="w-full sm:w-auto"
      >
        <TabsList>
          <TabsTrigger value="reddit">Reddit Posts</TabsTrigger>
          <TabsTrigger value="twitter">Tweets</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-1 gap-4">
        {platform === 'reddit' && (
          <Select
            value={selectedSubreddit}
            onValueChange={onSubredditChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select subreddit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subreddits</SelectItem>
              {subreddits.map((subreddit) => (
                <SelectItem key={subreddit} value={subreddit}>
                  r/{subreddit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={timeRange}
          onValueChange={onTimeRangeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface PostFiltersProps {
  subreddits: string[];
  selectedSubreddit: string;
  timeRange: string;
  onSubredditChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
}

export function PostFilters({
  subreddits,
  selectedSubreddit,
  timeRange,
  onSubredditChange,
  onTimeRangeChange
}: PostFiltersProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between cursor-pointer p-2 rounded-t-lg bg-white dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post Filters</h3>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-200 overflow-hidden ${isHovered ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-4 rounded-b-lg border border-gray-200 dark:border-gray-800">
          <div className="w-full sm:w-auto ml-auto">
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Past 24 hours" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <SelectItem value="day">Past 24 hours</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubreddit === 'all' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onSubredditChange('all')}
              className={`rounded-full text-sm ${
                selectedSubreddit === 'all' 
                  ? 'bg-[#5244e1] text-white hover:bg-opacity-90' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Communities
            </Button>
            {subreddits.map((subreddit) => (
              <Button
                key={subreddit}
                variant={selectedSubreddit === subreddit ? 'default' : 'secondary'}
                size="sm"
                onClick={() => onSubredditChange(subreddit)}
                className={`rounded-full text-sm ${
                  selectedSubreddit === subreddit 
                    ? 'bg-[#5244e1] text-white hover:bg-opacity-90' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                r/{subreddit}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubreddit === 'all' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSubredditChange('all')}
          className={`rounded-full ${
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
            className={`rounded-full ${
              selectedSubreddit === subreddit 
                ? 'bg-[#5244e1] text-white hover:bg-opacity-90' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            r/{subreddit}
          </Button>
        ))}
      </div>

      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
  );
}
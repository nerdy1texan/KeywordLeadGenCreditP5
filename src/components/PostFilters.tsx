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
    <div className="flex gap-4 mb-6">
      <div className="flex gap-2">
        <Button
          variant={selectedSubreddit === 'all' ? 'default' : 'outline'}
          onClick={() => onSubredditChange('all')}
          className="whitespace-nowrap"
        >
          All Communities
        </Button>
        {subreddits.map((subreddit) => (
          <Button
            key={subreddit}
            variant={selectedSubreddit === subreddit ? 'default' : 'outline'}
            onClick={() => onSubredditChange(subreddit)}
            className="whitespace-nowrap"
          >
            r/{subreddit}
          </Button>
        ))}
      </div>

      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
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
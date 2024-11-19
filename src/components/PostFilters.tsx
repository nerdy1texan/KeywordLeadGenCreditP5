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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubreddit === 'all' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSubredditChange('all')}
          className="rounded-full"
        >
          All Communities
        </Button>
        {subreddits.map((subreddit) => (
          <Button
            key={subreddit}
            variant={selectedSubreddit === subreddit ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onSubredditChange(subreddit)}
            className="rounded-full"
          >
            r/{subreddit}
          </Button>
        ))}
      </div>

      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Past 24 hours" />
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
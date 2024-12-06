import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { SubredditSuggestion } from "@/types/product";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface MonitoringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  monitoredSubreddits: SubredditSuggestion[];
  productId: string;
  onSuccess: () => Promise<void>;
}

export function MonitoringDialog({ 
  isOpen, 
  onClose, 
  monitoredSubreddits,
  productId,
  onSuccess
}: MonitoringDialogProps) {
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [postsPerSubreddit, setPostsPerSubreddit] = useState(5);
  const [tweetCount, setTweetCount] = useState<number>(10);
  const [monitorTweets, setMonitorTweets] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartMonitoring = async () => {
    try {
      setIsLoading(true);

      // Monitor Reddit posts if subreddits are selected
      if (selectedSubreddits.length > 0) {
        const redditResponse = await fetch('/api/reddit/monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subreddits: selectedSubreddits,
            postsPerSubreddit,
            productId
          }),
        });

        if (!redditResponse.ok) {
          throw new Error('Failed to start Reddit monitoring');
        }
      }

      // Monitor tweets if enabled
      if (monitorTweets) {
        console.log('Starting Twitter monitoring with:', { productId, tweetCount }); // Debug log
        const twitterResponse = await fetch('/api/twitter/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            tweetCount: Number(tweetCount)
          }),
        });

        if (!twitterResponse.ok) {
          const error = await twitterResponse.json();
          throw new Error(error.details || 'Failed to start Twitter monitoring');
        }
      }

      toast(
        'Started monitoring for new content',
        'success'
      );

      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Monitoring error:', error);
      toast(
        error instanceof Error ? error.message : 'Failed to start monitoring',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubreddits.length === monitoredSubreddits.length) {
      setSelectedSubreddits([]);
    } else {
      setSelectedSubreddits(monitoredSubreddits.map((s) => s.name));
    }
  };

  const handleSubredditToggle = (subreddit: string) => {
    setSelectedSubreddits((prev) =>
      prev.includes(subreddit)
        ? prev.filter((s) => s !== subreddit)
        : [...prev, subreddit]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Monitoring Posts</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all"
                checked={selectedSubreddits?.length === monitoredSubreddits?.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">Select All Subreddits</Label>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pl-6">
              {monitoredSubreddits?.map((subreddit) => (
                <div key={subreddit.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={subreddit.id}
                    checked={selectedSubreddits?.includes(subreddit.name)}
                    onCheckedChange={() => handleSubredditToggle(subreddit.name)}
                  />
                  <Label htmlFor={subreddit.id}>
                    r/{subreddit.name}
                    <span className="text-sm text-gray-500 ml-2">
                      ({subreddit.memberCount.toLocaleString()} members)
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="posts-per-subreddit">
              Posts to Monitor per Subreddit
            </Label>
            <Input
              id="posts-per-subreddit"
              type="number"
              min={10}
              max={100}
              value={postsPerSubreddit}
              onChange={(e) => setPostsPerSubreddit(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500">
              Minimum 10 posts, maximum 100 posts per subreddit
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="monitorTweets"
                checked={monitorTweets}
                onCheckedChange={(checked) => setMonitorTweets(checked as boolean)}
              />
              <Label htmlFor="monitorTweets">Monitor Relevant Tweets</Label>
            </div>

            {monitorTweets && (
              <div className="space-y-2">
                <Label htmlFor="tweetCount">Number of Tweets to Monitor</Label>
                <Input
                  id="tweetCount"
                  type="number"
                  min="5"
                  max="50"
                  value={tweetCount}
                  onChange={(e) => setTweetCount(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Minimum 5 tweets, maximum 50 tweets
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleStartMonitoring}
            disabled={selectedSubreddits.length === 0 && !monitorTweets || isLoading}
            className="bg-[#5244e1] hover:bg-opacity-90 text-white"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                Starting...
              </>
            ) : (
              'Start Monitoring'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { SubredditSuggestion } from "@/types/product";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

interface MonitoringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  monitoredSubreddits: SubredditSuggestion[];
  productId: string;
  onSuccess?: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleMonitor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reddit/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddits: selectedSubreddits,
          postsPerSubreddit,
          productId
        }),
      });

      if (!response.ok) throw new Error('Failed to monitor subreddits');

      const result = await response.json();
      
      toast({
        title: "Monitoring Complete",
        description: `Found ${result.postsFound} posts, saved ${result.savedCount} new posts.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Monitoring error:', error);
      toast({
        title: "Error",
        description: "Failed to monitor subreddits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSubreddits(monitoredSubreddits?.map(s => s.name) || []);
                  } else {
                    setSelectedSubreddits([]);
                  }
                }}
              />
              <Label htmlFor="select-all" className="font-medium">Select All Subreddits</Label>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pl-6">
              {monitoredSubreddits?.map((subreddit) => (
                <div key={subreddit.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={subreddit.id}
                    checked={selectedSubreddits?.includes(subreddit.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSubreddits(prev => [...(prev || []), subreddit.name]);
                      } else {
                        setSelectedSubreddits(prev => 
                          (prev || []).filter(name => name !== subreddit.name)
                        );
                      }
                    }}
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleMonitor}
            disabled={!selectedSubreddits?.length || isLoading}
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

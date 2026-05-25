import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRatePost } from "@/hooks/use-posts";

interface RatePopoverProps {
  postId: number;
  currentRating?: number | null;
  averageRating?: number | null;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
}

export function RatePopover({ postId, currentRating, averageRating, isAuthenticated, onLoginRequest }: RatePopoverProps) {
  const [open, setOpen] = useState(false);
  const { mutate: ratePost, isPending } = useRatePost(postId);

  const handleRate = (score: number) => {
    ratePost({ postId, data: { score } }, {
      onSuccess: () => setOpen(false)
    });
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onLoginRequest();
    }
  };

  return (
    <Popover open={open} onOpenChange={(val) => isAuthenticated && setOpen(val)}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleTriggerClick}
          className={`gap-1.5 rounded-full hover:bg-yellow-50 hover:text-yellow-600 transition-colors ${currentRating ? 'text-yellow-600 font-bold' : 'text-muted-foreground'}`}
        >
          <Star className={`w-5 h-5 ${currentRating ? 'fill-yellow-400 text-yellow-500' : ''}`} />
          <span>{averageRating ? averageRating.toFixed(1) : 'Rate'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 rounded-2xl shadow-xl shadow-primary/10 border-primary/20" align="center">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-center text-muted-foreground">Purr-fect Rating (1-10)</p>
          <div className="flex flex-wrap max-w-[260px] gap-1 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <Button
                key={score}
                variant={currentRating === score ? "default" : "outline"}
                size="icon"
                className={`w-10 h-10 rounded-full font-display text-lg shadow-sm ${currentRating === score ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-0' : 'hover:border-yellow-400 hover:text-yellow-600'}`}
                onClick={() => handleRate(score)}
                disabled={isPending}
              >
                {score}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

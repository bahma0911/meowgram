import { useGetLeaderboard } from "@workspace/api-client-react";
import { PostCard } from "@/components/post/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { data, isLoading, error } = useGetLeaderboard({ limit: 20 });

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 pb-20">
      
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-300 to-primary text-white shadow-xl shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 px-6 py-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-2">
              <Trophy className="w-8 h-8 text-yellow-100" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-sm">Hall of Fame</h1>
            <p className="text-white/90 text-lg max-w-md">
              The highest rated felines on Meowgram. Rated by the community, for the community.
            </p>
          </div>
          <img 
            src={`${import.meta.env.BASE_URL}images/cat-hero.png`} 
            alt="Hero Cat" 
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-white/30 shadow-2xl shrink-0" 
          />
        </div>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({length: 3}).map((_, i) => (
               <Skeleton key={i} className="w-full h-[500px] rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-destructive bg-destructive/5"><p className="text-destructive font-bold">Failed to load leaderboard</p></Card>
        ) : data?.posts.length === 0 ? (
          <Card className="p-12 text-center bg-muted/20 border-dashed rounded-3xl"><p className="text-muted-foreground text-lg">No posts rated yet.</p></Card>
        ) : (
          data?.posts.map((post, index) => (
            <div key={post.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute -left-3 -top-3 z-10 md:-left-6 md:-top-6 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-background shadow-xl border-4 border-background">
                <div className={`w-full h-full rounded-full flex items-center justify-center font-display font-bold text-xl md:text-2xl text-white shadow-inner
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' : 
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 
                    'bg-primary'}
                `}>
                  #{index + 1}
                </div>
              </div>
              <PostCard post={post} index={index} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

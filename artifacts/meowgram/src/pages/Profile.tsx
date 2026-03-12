import { useRoute } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useGetUserProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Image as ImageIcon, Video, Heart, Star } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId;

  const { data, isLoading, error } = useGetUserProfile(userId || "", { 
    query: { enabled: !!userId } 
  });

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="aspect-square rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Profile not found</h2>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const { user, posts, totalPosts } = data;

  // Calculate some stats
  const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
  const avgProfileRating = posts.length > 0 
    ? posts.reduce((sum, p) => sum + (p.averageRating || 0), 0) / posts.filter(p => p.averageRating).length 
    : 0;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      
      {/* Profile Header */}
      <Card className="rounded-3xl border-border/60 shadow-lg overflow-hidden bg-card">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <CardContent className="px-6 md:px-10 pb-8 relative pt-0">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 mb-6">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-full bg-background shrink-0">
              <AvatarImage src={user.profileImage || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-2 md:pt-0 md:pb-2">
              <h1 className="text-3xl font-display font-bold text-foreground">{user.username}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium flex-wrap">
                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full"><CalendarDays className="w-4 h-4" /> Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-6 mt-2">
            <div className="text-center p-4 rounded-2xl bg-muted/20 border border-border/50 transition-colors hover:bg-muted/40">
              <p className="text-2xl font-bold font-display text-foreground">{totalPosts}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Posts</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-muted/20 border border-border/50 transition-colors hover:bg-pink-50">
              <p className="text-2xl font-bold font-display text-primary flex items-center justify-center gap-1">
                {totalLikes} <Heart className="w-5 h-5 fill-primary" />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Likes</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-muted/20 border border-border/50 transition-colors hover:bg-yellow-50">
              <p className="text-2xl font-bold font-display text-yellow-600 flex items-center justify-center gap-1">
                {avgProfileRating ? avgProfileRating.toFixed(1) : '-'} <Star className="w-5 h-5 fill-yellow-400" />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Avg Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2 px-2">
          <ImageIcon className="w-5 h-5 text-primary" /> Gallery
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/80">
            <p className="text-muted-foreground text-lg">This user hasn't posted any cats yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-muted border border-border shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {post.mediaType === 'video' ? (
                    <>
                      <video src={post.imageUrl} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  )}
                  
                  {/* Hover overlay with stats */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold backdrop-blur-[2px]">
                    <div className="flex items-center gap-2">
                      <Heart className="w-6 h-6 fill-white" />
                      <span>{post.likeCount}</span>
                    </div>
                    {post.averageRating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span>{post.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

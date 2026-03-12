import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetPosts } from "@workspace/api-client-react";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Clock, PlusSquare, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [sort, setSort] = useState<"new" | "top" | "trending">("new");
  
  const { data, isLoading, error } = useGetPosts({ sort, limit: 20 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
        <div className="sticky top-24">
          <Card className="border-border/50 shadow-md bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20 w-full relative">
               {/* decorative background element */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
            </div>
            <CardContent className="p-6 pt-8 relative flex flex-col items-center text-center">
              <div className="absolute -top-10 bg-background p-2 rounded-full border border-border shadow-sm">
                 <div className="bg-primary/10 rounded-full p-4">
                   <Trophy className="w-8 h-8 text-primary" />
                 </div>
              </div>
              <h2 className="font-display text-xl font-bold mt-2">Welcome to Meowgram</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">The purr-fect place to share and rate the cutest cats on the internet.</p>
              
              {isAuthenticated ? (
                <Link href="/upload" className="w-full">
                  <Button className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/20 gap-2">
                    <PlusSquare className="w-5 h-5" /> Share a Cat
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => login()} className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/20">
                  Join the Fun
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground px-4">
            <Link href="/leaderboard" className="hover:text-primary transition-colors flex items-center gap-2 py-2">
              <Trophy className="w-4 h-4" /> Weekly Leaderboard
            </Link>
            <div className="h-[1px] bg-border w-full my-2"></div>
            <p>© 2024 Meowgram</p>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="col-span-1 md:col-span-8 lg:col-span-6 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-display font-bold">Feed</h1>
          <Tabs value={sort} onValueChange={(v) => setSort(v as GetPostsSort)} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3 rounded-full h-12 bg-muted/50 p-1">
              <TabsTrigger value="new" className="rounded-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4 mr-2 hidden sm:block" /> New
              </TabsTrigger>
              <TabsTrigger value="top" className="rounded-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Sparkles className="w-4 h-4 mr-2 hidden sm:block" /> Top
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <TrendingUp className="w-4 h-4 mr-2 hidden sm:block" /> Trend
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-3xl border-border/50">
              <CardHeader className="flex flex-row gap-4 p-4"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32"/><Skeleton className="h-3 w-20"/></div></CardHeader>
              <Skeleton className="w-full aspect-square" />
              <CardContent className="p-4"><Skeleton className="h-6 w-full mb-2"/><Skeleton className="h-4 w-2/3"/></CardContent>
            </Card>
          ))
        ) : error ? (
          <Card className="p-12 text-center border-dashed rounded-3xl bg-destructive/5 border-destructive/20">
            <p className="text-destructive font-bold">Failed to load feed. The cats are sleeping.</p>
          </Card>
        ) : data?.posts.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl bg-muted/20 border-dashed border-border/80 flex flex-col items-center">
            <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="Empty" className="w-48 h-48 object-contain mb-4 opacity-80" />
            <h3 className="text-xl font-display font-bold text-foreground">It's quiet here...</h3>
            <p className="text-muted-foreground mt-2 mb-6">Be the first to share a cat post!</p>
            {isAuthenticated && (
              <Link href="/upload"><Button>Upload a Post</Button></Link>
            )}
          </Card>
        ) : (
          <div className="space-y-8 pb-12">
            {data?.posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3">
        <div className="sticky top-24">
          <Card className="border-border/50 shadow-md rounded-3xl bg-gradient-to-b from-card to-pink-50/30">
            <CardHeader>
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Discover
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Meowgram is a community-driven platform to showcase the world's most elegant felines. Rate cats from 1-10 to help them climb the leaderboard!</p>
              {!isAuthenticated && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl mt-4">
                  <h4 className="font-bold text-primary text-sm mb-2">Want to vote?</h4>
                  <p className="text-xs text-muted-foreground mb-3">Log in to like, comment, and rate your favorite cats.</p>
                  <Button size="sm" className="w-full rounded-lg" onClick={() => login()}>Log In Now</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

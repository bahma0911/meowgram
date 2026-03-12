import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Post } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RatePopover } from "./RatePopover";
import { useToggleLike, useDeletePost } from "@/hooks/use-posts";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { user, isAuthenticated, login } = useAuth();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike(post.id);
  const { mutate: deletePost } = useDeletePost();

  const isOwner = user?.id === post.userId;

  const handleLike = () => {
    if (!isAuthenticated) return login();
    toggleLike({ postId: post.id });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this purr-fect post?")) {
      deletePost({ postId: post.id });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.1, 0.5), ease: "easeOut" }}
    >
      <Card className="overflow-hidden border border-border/60 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 rounded-3xl bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
          <Link href={`/profile/${post.userId}`} className="flex items-center gap-3 group">
            <Avatar className="w-10 h-10 border-2 border-primary/10 group-hover:border-primary/40 transition-colors">
              <AvatarImage src={post.userAvatar || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {post.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm md:text-base">
                {post.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </Link>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer rounded-lg">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        
        <div className="relative bg-muted/30 w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden">
          {post.mediaType === 'video' ? (
            <video 
              src={post.imageUrl} 
              controls 
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img 
              src={post.imageUrl} 
              alt={post.caption || "Cat post"} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        <CardContent className="p-4 pb-2">
          <div className="flex items-center gap-4 mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={isLiking}
              className={`gap-1.5 rounded-full px-2 hover:bg-pink-50 hover:text-primary transition-colors ${post.userLiked ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-6 h-6 transition-all ${post.userLiked ? 'fill-primary scale-110' : 'scale-100 hover:scale-110'}`} />
              <span className="font-bold">{post.likeCount}</span>
            </Button>
            
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 rounded-full px-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-6 h-6 hover:scale-110 transition-transform" />
                <span className="font-bold">{post.commentCount}</span>
              </Button>
            </Link>

            <div className="ml-auto">
              {!isOwner ? (
                <RatePopover 
                  postId={post.id} 
                  currentRating={post.userRating} 
                  averageRating={post.averageRating}
                  isAuthenticated={isAuthenticated}
                  onLoginRequest={login}
                />
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-full text-yellow-600 font-bold text-sm shadow-sm border border-yellow-100">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                  {post.averageRating ? post.averageRating.toFixed(1) : 'No rates'}
                </div>
              )}
            </div>
          </div>

          {post.caption && (
            <div className="mt-2">
              <span className="font-bold mr-2 text-foreground">{post.username}</span>
              <span className="text-foreground/90">{post.caption}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 py-3 pt-0 text-sm">
          <Link href={`/post/${post.id}`} className="text-muted-foreground hover:text-primary transition-colors">
            {post.commentCount > 0 ? `View all ${post.commentCount} comments` : 'Add a comment...'}
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetPost, useGetComments } from "@workspace/api-client-react";
import { useAddComment } from "@/hooks/use-comments";
import { PostCard } from "@/components/post/PostCard";
import { CommentItem } from "@/components/post/CommentItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const postId = Number(params?.id);
  
  const { isAuthenticated, login } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading: postLoading, error: postError } = useGetPost(postId, { query: { enabled: !isNaN(postId) } });
  const { data: commentsData, isLoading: commentsLoading } = useGetComments(postId, { query: { enabled: !isNaN(postId) } });
  const { mutate: addComment, isPending: addingComment } = useAddComment(postId);

  if (isNaN(postId)) return <div className="p-8 text-center text-destructive">Invalid post ID</div>;
  
  if (postLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="w-full aspect-square md:aspect-video rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(
      { postId, data: { text: commentText } },
      { onSuccess: () => setCommentText("") }
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Link href="/">
        <Button variant="ghost" className="mb-6 -ml-4 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>

      <div className="space-y-8">
        <PostCard post={post} />

        <Card className="rounded-3xl border-border/50 shadow-md bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> 
              Comments ({post.commentCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              <div className="p-4 sm:p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {commentsLoading ? (
                  <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : commentsData?.comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 italic">No comments yet. Be the first to say something nice!</p>
                ) : (
                  commentsData?.comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-border/50 bg-muted/5">
                {isAuthenticated ? (
                  <form onSubmit={handleAddComment} className="flex gap-3 items-end">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="resize-none min-h-[60px] rounded-2xl bg-background border-border/60 focus-visible:ring-primary/20 text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={!commentText.trim() || addingComment}
                      className="rounded-xl px-6 shrink-0 shadow-md shadow-primary/20"
                    >
                      {addingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-background border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <p className="text-muted-foreground text-sm font-medium">Log in to leave a comment.</p>
                    <Button size="sm" onClick={() => login()} className="rounded-lg">Log In</Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

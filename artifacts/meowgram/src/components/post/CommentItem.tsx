import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@workspace/api-client-react";

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-4 group">
      <Link href={`/profile/${comment.userId}`} className="shrink-0">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-border mt-1">
          <AvatarImage src={comment.userAvatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {comment.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex flex-col bg-muted/30 p-3 sm:p-4 rounded-2xl rounded-tl-none w-full border border-border/40">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <Link href={`/profile/${comment.userId}`} className="font-bold text-sm hover:underline text-foreground">
            {comment.username}
          </Link>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
          {comment.text}
        </p>
      </div>
    </div>
  );
}

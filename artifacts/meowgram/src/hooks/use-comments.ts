import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  useAddComment as useApiAddComment,
  getGetCommentsQueryKey,
  getGetPostQueryKey
} from "@workspace/api-client-react";

export function useAddComment(postId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useApiAddComment({
    mutation: {
      onSuccess: () => {
        // Invalidate both the comments list and the post itself (for comment count updates)
        queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        toast({
          title: "Comment added",
          description: "Your comment is now live.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Could not post comment.",
          variant: "destructive",
        });
      }
    }
  });
}

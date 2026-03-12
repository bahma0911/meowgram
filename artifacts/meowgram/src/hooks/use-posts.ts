import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  useCreatePost as useApiCreatePost,
  useDeletePost as useApiDeletePost,
  useRatePost as useApiRatePost,
  useToggleLike as useApiToggleLike,
  getGetPostsQueryKey,
  getGetLeaderboardQueryKey,
  getGetPostQueryKey
} from "@workspace/api-client-react";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useApiCreatePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
        toast({
          title: "Purr-fect!",
          description: "Your post has been shared with the world.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Oops!",
          description: error.message || "Failed to create post.",
          variant: "destructive",
        });
      }
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useApiDeletePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
        toast({
          title: "Post deleted",
          description: "Your post has been removed.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not delete the post.",
          variant: "destructive",
        });
      }
    }
  });
}

export function useRatePost(postId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useApiRatePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
        toast({
          title: "Rated!",
          description: "Thanks for rating this cat.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Could not rate",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    }
  });
}

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();
  
  return useApiToggleLike({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
      }
    }
  });
}

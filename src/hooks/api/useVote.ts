import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VoteInput {
  influencerId: string;
  voteType: "natty" | "not_natty";
}

export const useVote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ influencerId, voteType }: VoteInput) => {
      if (!user) throw new Error("User must be logged in to vote");

      const { error } = await supabase
        .from("votes")
        .insert([
          {
            influencer_id: influencerId,
            user_id: user.id,
            vote: voteType,
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch vote stats
      queryClient.invalidateQueries({ queryKey: ["voteStats"] });
    },
  });
}; 
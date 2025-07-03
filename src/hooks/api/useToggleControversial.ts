import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ToggleControversialInput {
  influencerId: string;
  controversial: boolean;
}

export const useToggleControversial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ influencerId, controversial }: ToggleControversialInput) => {
      const { error } = await supabase
        .from("influencers")
        .update({ controversial })
        .eq("id", influencerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-influencers"] });
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      // Optionally, invalidate all queries with 'influencers' in the key
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "influencers" });
    },
  });
}; 
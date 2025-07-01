import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if an expert review should be considered "natty" based on rating and explicit verdict
 * Uses the same logic as ExpertReviews.tsx for consistency
 */
export function isExpertReviewNatty(review: { rating?: number; natty_or_not?: string }): boolean {
  return (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
}

/**
 * Calculates combined percentages from expert reviews and community votes
 * @param expertReviews Array of expert reviews
 * @param communityVotes Object with natty_count and total_votes from community
 * @returns Combined percentages and breakdown
 */
export function calculateCombinedPercentages(
  expertReviews: Array<{ rating?: number; natty_or_not?: string }>,
  communityVotes: { natty_count: number; total_votes: number }
) {
  // Calculate expert counts using consistent logic
  const expertNattyCount = expertReviews.filter(review => isExpertReviewNatty(review)).length;
  const expertJuicyCount = expertReviews.length - expertNattyCount;
  
  // Get community counts
  const communityNattyCount = communityVotes.natty_count;
  const communityJuicyCount = communityVotes.total_votes - communityVotes.natty_count;
  
  // Combined totals (equal weighting: 1 expert review = 1 community vote)
  const totalNattyCount = expertNattyCount + communityNattyCount;
  const totalJuicyCount = expertJuicyCount + communityJuicyCount;
  const totalCombinedVotes = totalNattyCount + totalJuicyCount;
  
  // Calculate percentages
  const nattyPercentage = totalCombinedVotes > 0 ? Math.round((totalNattyCount / totalCombinedVotes) * 100) : 0;
  const juicyPercentage = totalCombinedVotes > 0 ? (100 - nattyPercentage) : 0;
  
  return {
    combined: {
      nattyPercentage,
      juicyPercentage,
      totalVotes: totalCombinedVotes,
      nattyCount: totalNattyCount,
      juicyCount: totalJuicyCount
    },
    expert: {
      nattyPercentage: expertReviews.length > 0 ? Math.round((expertNattyCount / expertReviews.length) * 100) : 0,
      juicyPercentage: expertReviews.length > 0 ? Math.round((expertJuicyCount / expertReviews.length) * 100) : 0,
      totalVotes: expertReviews.length,
      nattyCount: expertNattyCount,
      juicyCount: expertJuicyCount
    },
    community: {
      nattyPercentage: communityVotes.total_votes > 0 ? Math.round((communityNattyCount / communityVotes.total_votes) * 100) : 0,
      juicyPercentage: communityVotes.total_votes > 0 ? Math.round((communityJuicyCount / communityVotes.total_votes) * 100) : 0,
      totalVotes: communityVotes.total_votes,
      nattyCount: communityNattyCount,
      juicyCount: communityJuicyCount
    }
  };
}

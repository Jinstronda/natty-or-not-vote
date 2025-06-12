import { useAuth } from "@/contexts/AuthContext";
import { useVotes } from "@/hooks/useVotes";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";

interface ReviewFormProps {
  influencerId: string;
}

const ReviewForm = ({ influencerId }: ReviewFormProps) => {
  const { user } = useAuth();
  const { userVote, userReview } = useVotes(influencerId);
  const { submitReview } = useSupabaseReviews();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userReview) {
      setContent(userReview.content || "");
    } else {
      setContent("");
    }
  }, [userReview]);

  if (!user || !userVote) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (userVote.vote !== 'natty' && userVote.vote !== 'juicy') return;
    setIsSubmitting(true);
    try {
      await submitReview(user.id, user.username, influencerId, userVote.vote as 'natty' | 'juicy', content.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="mb-3">
        <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
          Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
        </Badge>
      </div>
      <textarea
        className="w-full border rounded p-2 mb-3 bg-background text-foreground"
        rows={4}
        placeholder="Share your reasoning, evidence, or thoughts about this decision..."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className={`px-4 py-2 rounded font-semibold ${userVote.vote === 'natty' ? 'bg-natty text-white' : 'bg-juicy text-white'} hover:opacity-90 transition`}
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;

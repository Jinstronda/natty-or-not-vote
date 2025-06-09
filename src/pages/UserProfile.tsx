
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVoteStore } from "@/stores/VoteStore";
import { ThumbsUp, MessageSquare } from "lucide-react";

// Mock user data - in real app this would come from API
const userData = {
  "1": { username: "FitnessEnthusiast23", joinDate: "January 2024", totalVotes: 47, totalReviews: 23 },
  "2": { username: "SkepticalLifter", joinDate: "December 2023", totalVotes: 31, totalReviews: 18 },
};

const UserProfile = () => {
  const { id } = useParams();
  const { getUserHistory, getInfluencerVotes } = useVoteStore();
  
  const user = userData[id as keyof typeof userData];
  const history = getUserHistory(id!);
  
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-heading">{user.username}</CardTitle>
              <p className="text-muted-foreground">Member since {user.joinDate}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.totalVotes}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Reviews Written</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-natty">{history.votes.filter(v => v.vote === 'natty').length}</div>
                  <div className="text-sm text-muted-foreground">Natty Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-juicy">{history.votes.filter(v => v.vote === 'juicy').length}</div>
                  <div className="text-sm text-muted-foreground">Juicy Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                history.reviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={review.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                          {review.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">on David Laid</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import UserProfile from "@/components/UserProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";

// Mock data - in real app this would come from API
const influencerData = {
  "1": {
    name: "David Laid",
    image: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=600&h=600&fit=crop",
    platform: "Instagram",
    followers: "1.2M",
    height: "6'2\"",
    weight: "185 lbs",
    yearsTraining: "8",
    claimedStatus: "Natural",
    bio: "Aesthetic physique enthusiast. Sharing my natural transformation journey.",
    expertReviews: [
      {
        id: 1,
        author: "Dr. Mike Israetel",
        rating: 4,
        content: "Impressive physique development that appears consistent with natural training over many years.",
        likes: 234
      },
      {
        id: 2,
        author: "Renaissance Periodization",
        rating: 4,
        content: "The timeline and progression photos support natural development.",
        likes: 189
      }
    ]
  }
};

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { submitReview, getUserVote, getInfluencerReviews } = useVoteStore();
  const [newReview, setNewReview] = useState("");
  
  const influencer = influencerData[id as keyof typeof influencerData];
  const userVote = user ? getUserVote(user.id, id!) : null;
  const userReviews = getInfluencerReviews(id!);
  
  if (!influencer) {
    return <div>Influencer not found</div>;
  }

  const handleReviewSubmit = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!userVote) {
      toast({
        title: "Vote first",
        description: "Please cast your vote before submitting a review.",
        variant: "destructive",
      });
      return;
    }

    if (!newReview.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitReview(user.id, user.username, id!, userVote.vote, newReview.trim());
    setNewReview("");
    
    toast({
      title: "Review submitted!",
      description: "Your review has been added.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={influencer.image} 
                    alt={influencer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h1 className="font-heading font-bold text-2xl mb-2">
                  {influencer.name}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{influencer.platform}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {influencer.followers} followers
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {influencer.bio}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height:</span>
                    <span className="font-medium">{influencer.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{influencer.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training:</span>
                    <span className="font-medium">{influencer.yearsTraining} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claims:</span>
                    <Badge className={influencer.claimedStatus === 'Natural' ? 'bg-natty' : 'bg-juicy'}>
                      {influencer.claimedStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Voting & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Voting Section */}
            <VotingSection
              influencerId={id!}
              nattyVotes={0}
              juicyVotes={0}
            />
            
            {/* Expert Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Expert Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {influencer.expertReviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* User Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Review */}
                {user && userVote && (
                  <div className="border border-border rounded-lg p-4">
                    <div className="mb-3">
                      <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                        Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                      </Badge>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts on this influencer's natural status..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="mb-3"
                    />
                    <Button onClick={handleReviewSubmit} disabled={!newReview.trim()}>
                      Submit Review
                    </Button>
                  </div>
                )}
                
                {/* User Reviews List */}
                {userReviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserProfile username={review.username} userId={review.userId} />
                        <Badge className={review.vote === 'natty' ? 'bg-natty text-xs' : 'bg-juicy text-xs'}>
                          {review.vote === 'natty' ? '🏆' : '💉'}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;

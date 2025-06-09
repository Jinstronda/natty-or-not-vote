
import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

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
    nattyVotes: 1123,
    juicyVotes: 415,
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
    ],
    userReviews: [
      {
        id: 1,
        author: "FitnessEnthusiast23",
        rating: 5,
        content: "Been following his journey for years. Definitely achievable naturally with good genetics.",
        likes: 45,
        timestamp: "2 hours ago"
      },
      {
        id: 2,
        author: "SkepticalLifter",
        rating: 2,
        content: "Too dry and full at the same time. Classic enhanced look.",
        likes: 23,
        timestamp: "1 day ago"
      }
    ]
  }
};

const InfluencerProfile = () => {
  const { id } = useParams();
  const [userVote, setUserVote] = useState<'natty' | 'juicy' | null>(null);
  const [newReview, setNewReview] = useState("");
  
  const influencer = influencerData[id as keyof typeof influencerData];
  
  if (!influencer) {
    return <div>Influencer not found</div>;
  }

  const handleVote = (vote: 'natty' | 'juicy') => {
    setUserVote(vote);
    console.log(`Voted ${vote} for ${influencer.name}`);
  };

  const handleReviewSubmit = () => {
    console.log("Submitting review:", newReview);
    setNewReview("");
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
              nattyVotes={influencer.nattyVotes}
              juicyVotes={influencer.juicyVotes}
              userVote={userVote}
              onVote={handleVote}
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
                <div className="border border-border rounded-lg p-4">
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
                
                {/* User Reviews List */}
                {influencer.userReviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{review.author}</span>
                      <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                        />
                      ))}
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

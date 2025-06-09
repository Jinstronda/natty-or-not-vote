
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import InfluencerInfo from "@/components/InfluencerInfo";
import ExpertReviews from "@/components/ExpertReviews";
import UserReviews from "@/components/UserReviews";

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
  
  const influencer = influencerData[id as keyof typeof influencerData];
  
  if (!influencer) {
    return <div>Influencer not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <InfluencerInfo influencer={influencer} />
          </div>
          
          {/* Right Column - Voting & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <VotingSection
              influencerId={id!}
              nattyVotes={0}
              juicyVotes={0}
            />
            
            <ExpertReviews reviews={influencer.expertReviews} />
            
            <UserReviews influencerId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;

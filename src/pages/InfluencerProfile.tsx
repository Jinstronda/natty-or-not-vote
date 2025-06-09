
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import InfluencerInfo from "@/components/InfluencerInfo";
import ExpertReviews from "@/components/ExpertReviews";
import UserReviews from "@/components/UserReviews";
import AdminInfluencerEditor from "@/components/AdminInfluencerEditor";
import { useVoteStore } from "@/stores/VoteStore";
import { useAuth } from "@/contexts/AuthContext";

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { influencers } = useVoteStore();
  
  const influencer = influencers.find(inf => inf.id === id);
  
  if (!influencer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Influencer not found</h1>
            <p className="text-muted-foreground">The influencer you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {user?.role === 'admin' && (
              <AdminInfluencerEditor influencer={influencer} />
            )}
            <InfluencerInfo influencer={influencer} />
          </div>
          
          {/* Right Column - Voting & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <VotingSection
              influencerId={id!}
              nattyVotes={0}
              juicyVotes={0}
            />
            
            <ExpertReviews influencerId={id!} />
            
            <UserReviews influencerId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;

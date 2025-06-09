
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import VotingResults from "@/components/VotingResults";
import InfluencerInfo from "@/components/InfluencerInfo";
import ExpertReviews from "@/components/ExpertReviews";
import UserReviews from "@/components/UserReviews";
import AdminInfluencerEditor from "@/components/AdminInfluencerEditor";
import { useInfluencers } from "@/hooks/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { useInfluencer } = useInfluencers();
  const { data: influencer, isLoading, error } = useInfluencer(id!);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !influencer) {
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
        <VotingResults influencerId={id!} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {user?.role === 'admin' && (
              <AdminInfluencerEditor influencer={influencer} />
            )}
            <InfluencerInfo influencer={influencer} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <VotingSection influencerId={id!} />
            <ExpertReviews influencerId={id!} />
            <UserReviews influencerId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;

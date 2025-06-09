
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
import { Influencer } from "@/types/vote";
import { useEffect, useState } from "react";

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { useInfluencer } = useInfluencers();
  const { data: influencerData, isLoading: influencerLoading, error } = useInfluencer(id!);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  console.log('InfluencerProfile - Mounted:', mounted, 'Auth loading:', authLoading, 'Influencer loading:', influencerLoading);
  console.log('InfluencerProfile - User exists:', !!user, 'User role:', user?.role);
  console.log('InfluencerProfile - Influencer data:', !!influencerData, 'Error:', error);
  
  // Transform the data to match the Influencer type
  const influencer: Influencer | null = influencerData ? {
    id: influencerData.id,
    name: influencerData.name,
    image: influencerData.image || '/placeholder.svg',
    height: influencerData.height || '',
    weight: influencerData.weight || '',
    yearsTraining: influencerData.years_training || '',
    claimedStatus: influencerData.claimed_status || '',
    description: influencerData.description || '',
    socialLinks: (influencerData.social_links as { instagram?: string; youtube?: string; tiktok?: string }) || {}
  } : null;
  
  // Show loading state while any critical data is loading or not mounted
  if (!mounted || authLoading || influencerLoading) {
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

  // Handle error state
  if (error || !influencer) {
    console.error('InfluencerProfile - Error or no influencer:', error);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Influencer not found</h1>
            <p className="text-muted-foreground">The influencer you're looking for doesn't exist.</p>
            {error && (
              <p className="text-sm text-red-500 mt-2">Error: {error.message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log('InfluencerProfile - Rendering with influencer:', influencer.name, 'User role:', user?.role);

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

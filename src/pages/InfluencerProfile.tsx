import { useRef, useState, useEffect } from "react";
import Header from "@/components/Header";
import VotingSection from "@/components/VotingSection";
import InfluencerInfo from "@/components/InfluencerInfo";
import ExpertReviews from "@/components/ExpertReviews";
import EnhancedUserReviews, { EnhancedUserReviewsRef } from "@/components/EnhancedUserReviews";
import AdminInfluencerEditor from "@/components/AdminInfluencerEditor";
import { useInfluencer } from "@/hooks/api/useInfluencer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { InfluencerProfileSkeleton } from "@/components/InfluencerProfileSkeleton";
import { Influencer } from "@/types/vote";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { LazyImage } from "@/components/LazyImage";
import { useWebVitals } from "@/utils/webVitals";
import { useInfluencerRouting } from "@/hooks/useInfluencerRouting";
import { EnhancedSEO } from "@/components/SEO/EnhancedSEO";

const InfluencerProfile = () => {
  const { user, supabaseUser } = useAuth();
  const { fetchUserProfile } = useUserProfile();
  const { id, name, isLoading: routingLoading, error: routingError } = useInfluencerRouting();
  const { data: influencerData, isLoading, error } = useInfluencer(id);
  const { data: voteStats } = useVoteStats(id) || { data: { total_votes: 0, natty_percentage: 0, juicy_percentage: 0 } };
  const userReviewsRef = useRef<EnhancedUserReviewsRef>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Initialize Web Vitals monitoring for performance tracking
  const { report: webVitalsReport } = useWebVitals({
    lcp: 2000, // Target LCP under 2 seconds for influencer pages
    cls: 0.05, // Strict CLS budget for image-heavy pages
  });

  // Fetch user profile to get role
  useEffect(() => {
    if (supabaseUser && !userProfile) {
      setProfileLoading(true);
      fetchUserProfile(supabaseUser)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [supabaseUser, userProfile, fetchUserProfile]);

  const handleReviewSubmitted = () => {
    // Trigger an immediate refresh of the user reviews so the new review appears instantly
    if (userReviewsRef.current) {
      console.log('[InfluencerProfile] Review submitted - forcing reviews refresh');
      userReviewsRef.current.refresh();
    } else {
      console.log('[InfluencerProfile] Review submitted - reviews ref not ready, relying on real-time updates');
    }
  };
  
  // Debug logs
  console.log('[InfluencerProfile] id:', id);
  console.log('[InfluencerProfile] name:', name);
  console.log('[InfluencerProfile] influencerData:', influencerData);
  console.log('[InfluencerProfile] error:', error || routingError);

  // Transform the data to match the Influencer type with all required properties
  const influencer: Influencer | null = influencerData ? {
    id: influencerData.id,
    name: influencerData.name,
    image: influencerData.image || '/placeholder.svg',
    height: influencerData.height || '',
    weight: influencerData.weight || '',
    years_training: influencerData.years_training || '',
    claimed_status: influencerData.claimed_status || '',
    description: influencerData.description || '',
    social_links: (influencerData.social_links as { instagram?: string; youtube?: string; tiktok?: string }) || {},
    photos: influencerData.photos || []
  } : null;

  console.log('[InfluencerProfile] influencer:', influencer);
  
  if (isLoading || routingLoading) {
    return <InfluencerProfileSkeleton />;
  }

  if (error || routingError || !influencer) {
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

  // Check if user is admin based on profile data
  const isAdmin = userProfile?.role === 'admin';

  return (
    <>
      {/* Enhanced SEO Component */}
      <EnhancedSEO 
        influencer={influencer}
        voteStats={voteStats}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* SEO-optimized content structure */}
        <div className="container mx-auto px-4 py-8">
          {/* Hidden h1 for SEO - optimized for "is [name] juicy" searches */}
          <h1 className="sr-only">
            Is {influencer.name} Juicy? {voteStats?.natty_percentage || 0}% Natty | Community Verdict on Natural vs Enhanced Status
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {isAdmin && !profileLoading && (
                <AdminInfluencerEditor influencer={influencer} />
              )}
              <InfluencerInfo influencer={influencer} />
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <VotingSection influencerId={id} onReviewSubmitted={handleReviewSubmitted} />
              <ExpertReviews influencerId={id} />
              <EnhancedUserReviews ref={userReviewsRef} influencerId={id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfluencerProfile;

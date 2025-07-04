import { useParams } from "react-router-dom";
import { useRef, useState, useEffect, Suspense, lazy } from "react";
import Header from "@/components/Header";
import { useOptimizedInfluencer } from "@/hooks/api/useOptimizedInfluencer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { InfluencerProfileSkeleton, ProgressiveInfluencerSkeleton } from "@/components/InfluencerProfileSkeleton";
import { useImagePreloader, usePreloadCriticalImages } from "@/hooks/useImagePreloader";
import { Influencer } from "@/types/vote";

// Lazy load heavy components for better initial loading
const VotingSection = lazy(() => import("@/components/VotingSection"));
const InfluencerInfo = lazy(() => import("@/components/InfluencerInfo"));
const ExpertReviews = lazy(() => import("@/components/ExpertReviews"));
const UserReviews = lazy(() => import("@/components/UserReviews"));
const AdminInfluencerEditor = lazy(() => import("@/components/AdminInfluencerEditor"));

// Safe progressive loading version of InfluencerProfile
// This doesn't replace the existing one - it's an alternative implementation
const FastInfluencerProfile = () => {
  const { id } = useParams();
  const { user, supabaseUser } = useAuth();
  const { fetchUserProfile } = useUserProfile();
  
  // Use optimized hook for better performance
  const { data: influencerData, isLoading, error } = useOptimizedInfluencer(id!);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initial' | 'basic' | 'voting' | 'reviews' | 'complete'>('initial');

  // Preload images for better perceived performance
  const imageSrcs = influencerData?.photos?.map(p => p.image_url) || [];
  useImagePreloader(imageSrcs);
  usePreloadCriticalImages(id || '', imageSrcs);

  // Progressive loading stages
  useEffect(() => {
    if (influencerData && !isLoading) {
      setLoadingStage('basic');
      
      // Progressively reveal sections
      setTimeout(() => setLoadingStage('voting'), 300);
      setTimeout(() => setLoadingStage('reviews'), 600);
      setTimeout(() => setLoadingStage('complete'), 900);
    }
  }, [influencerData, isLoading]);

  // Fetch user profile optimistically
  useEffect(() => {
    if (supabaseUser && !userProfile) {
      setProfileLoading(true);
      fetchUserProfile(supabaseUser)
        .then(setUserProfile)
        .catch(error => console.error('Error fetching user profile:', error))
        .finally(() => setProfileLoading(false));
    }
  }, [supabaseUser, userProfile, fetchUserProfile]);

  // Transform the data to match the Influencer type
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

  // Progressive loading state
  if (isLoading || loadingStage === 'initial') {
    return (
      <ProgressiveInfluencerSkeleton 
        showVoting={loadingStage !== 'initial'}
        showExpertReviews={['reviews', 'complete'].includes(loadingStage)}
        showUserReviews={loadingStage === 'complete'}
      />
    );
  }

  // Error state
  if (error || !influencer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-20">😞</div>
            <h1 className="text-2xl font-bold">Influencer not found</h1>
            <p className="text-muted-foreground">The influencer you're looking for doesn't exist or failed to load.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Influencer Info */}
          <div className="lg:col-span-1">
            <div className={`transition-all duration-300 ${loadingStage !== 'initial' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                <InfluencerInfo influencer={influencer} />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Interactive Sections */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Voting Section - Progressive */}
            {['basic', 'voting', 'reviews', 'complete'].includes(loadingStage) && (
              <div className={`transition-all duration-500 ${['voting', 'reviews', 'complete'].includes(loadingStage) ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}`}>
                <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
                  <VotingSection 
                    influencerId={influencer.id} 
                    onReviewSubmitted={() => {/* handle review submission */}}
                  />
                </Suspense>
              </div>
            )}

            {/* Expert Reviews - Progressive */}
            {['reviews', 'complete'].includes(loadingStage) && (
              <div className={`transition-all duration-500 ${loadingStage === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}`}>
                <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-lg" />}>
                  <ExpertReviews influencerId={influencer.id} />
                </Suspense>
              </div>
            )}

            {/* User Reviews - Progressive */}
            {loadingStage === 'complete' && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
                  <UserReviews influencerId={influencer.id} />
                </Suspense>
              </div>
            )}

            {/* Admin Editor - Only for admins */}
            {isAdmin && loadingStage === 'complete' && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
                  <AdminInfluencerEditor influencer={influencer} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastInfluencerProfile;
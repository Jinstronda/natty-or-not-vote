import { useParams } from "react-router-dom";
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
import { DynamicMeta } from "@/components/SEO/DynamicMeta";
import { StructuredData } from "@/components/SEO/StructuredData";
import { generateInfluencerKeywords } from "@/utils/seo/keywordGenerator";
import { useSEO } from "@/hooks/useSEO";
import { LazyImage } from "@/components/LazyImage";
import { useWebVitals } from "@/utils/webVitals";

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user, supabaseUser } = useAuth();
  const { fetchUserProfile } = useUserProfile();
  const { data: influencerData, isLoading, error } = useInfluencer(id!);
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
  console.log('[InfluencerProfile] influencerData:', influencerData);
  console.log('[InfluencerProfile] error:', error);

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
  
  // Generate SEO data when influencer data is available
  const seoData = influencer ? generateInfluencerKeywords({
    name: influencer.name,
    description: influencer.description,
    stats: {
      totalVotes: influencerData?.total_votes || 0,
      nattyPercentage: influencerData?.natty_percentage || 0,
      juicyPercentage: influencerData?.juicy_percentage || 0,
    },
    physicalStats: {
      height: influencer.height,
      weight: influencer.weight,
      yearsTraining: influencer.years_training,
    },
    claimedStatus: influencer.claimed_status,
    socialFollowing: 0, // Could be enhanced with actual social media data
    trending: influencerData?.trending || false,
    controversial: influencerData?.controversial || false,
  }) : null;

  // Initialize SEO hook with dynamic data
  useSEO({
    title: influencer ? `${influencer.name} - Natty or Juicy? | Community Verdict` : 'Influencer Profile',
    description: influencer ? `Find out if ${influencer.name} is natural or enhanced. Community votes: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy. See expert reviews and user opinions.` : 'Influencer profile page',
    keywords: seoData?.primary || [],
    canonical: `https://nattyorjuicy.com/influencer/${id}`,
    openGraph: {
      title: influencer ? `${influencer.name} - Natty or Juicy?` : 'Influencer Profile',
      description: influencer ? `Community verdict: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy` : 'Influencer profile',
      image: influencer?.image || '/placeholder.svg',
      url: `https://nattyorjuicy.com/influencer/${id}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: influencer ? `${influencer.name} - Natty or Juicy?` : 'Influencer Profile',
      description: influencer ? `Community verdict: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy` : 'Influencer profile',
      image: influencer?.image || '/placeholder.svg',
    },
    structuredData: influencer ? {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: influencer.name,
      description: influencer.description,
      image: influencer.image,
      sameAs: Object.values(influencer.social_links || {}).filter(Boolean),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: influencerData?.natty_percentage || 0,
        ratingCount: influencerData?.total_votes || 0,
        bestRating: 100,
        worstRating: 0,
      },
    } : undefined,
  });
  
  if (isLoading) {
    return (
      <>
        <DynamicMeta
          title="Loading Profile... | Natty or Juicy"
          description="Loading influencer profile page"
          robots="noindex, nofollow"
        />
        <InfluencerProfileSkeleton />
      </>
    );
  }

  if (error || !influencer) {
    return (
      <>
        <DynamicMeta
          title="Influencer Not Found | Natty or Juicy"
          description="The influencer you're looking for doesn't exist or has been removed."
          robots="noindex, nofollow"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Influencer not found</h1>
              <p className="text-muted-foreground">The influencer you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Check if user is admin based on profile data
  const isAdmin = userProfile?.role === 'admin';

  return (
    <>
      {/* SEO Meta Tags */}
      <DynamicMeta
        title={`${influencer.name} - Natty or Juicy? | Community Verdict`}
        description={`Find out if ${influencer.name} is natural or enhanced. Community votes: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy. See expert reviews and user opinions.`}
        keywords={seoData?.primary || []}
        canonical={`https://nattyorjuicy.com/influencer/${id}`}
        openGraph={{
          title: `${influencer.name} - Natty or Juicy?`,
          description: `Community verdict: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy`,
          image: influencer.image,
          url: `https://nattyorjuicy.com/influencer/${id}`,
          type: 'profile',
        }}
        twitter={{
          card: 'summary_large_image',
          title: `${influencer.name} - Natty or Juicy?`,
          description: `Community verdict: ${influencerData?.natty_percentage || 0}% natty, ${influencerData?.juicy_percentage || 0}% juicy`,
          image: influencer.image,
        }}
      />

      {/* Structured Data for SEO */}
      <StructuredData
        type="Person"
        data={{
          name: influencer.name,
          description: influencer.description || `${influencer.name} fitness profile and community verdict`,
          image: influencer.image,
          sameAs: Object.values(influencer.social_links || {}).filter(Boolean),
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: influencerData?.natty_percentage || 0,
            ratingCount: influencerData?.total_votes || 0,
            bestRating: 100,
            worstRating: 0,
          },
          knowsAbout: ['Fitness', 'Bodybuilding', 'Natural Training', 'Strength Training'],
          occupation: {
            '@type': 'Occupation',
            name: 'Fitness Influencer',
          },
        }}
      />

      {/* FAQ Structured Data */}
      <StructuredData
        type="FAQPage"
        data={{
          mainEntity: [
            {
              '@type': 'Question',
              name: `Is ${influencer.name} natural?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `According to community votes, ${influencerData?.natty_percentage || 0}% believe ${influencer.name} is natural, while ${influencerData?.juicy_percentage || 0}% believe they are enhanced.`,
              },
            },
            {
              '@type': 'Question',
              name: `How many people voted on ${influencer.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${influencerData?.total_votes || 0} community members have voted on whether ${influencer.name} is natty or juicy.`,
              },
            },
            {
              '@type': 'Question',
              name: `What are ${influencer.name}'s stats?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${influencer.name} is ${influencer.height || 'unknown height'}, weighs ${influencer.weight || 'unknown weight'}, and has been training for ${influencer.years_training || 'unknown years'}.`,
              },
            },
          ],
        }}
      />

      {/* Breadcrumb Structured Data */}
      <StructuredData
        type="BreadcrumbList"
        data={{
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://nattyorjuicy.com',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Influencers',
              item: 'https://nattyorjuicy.com/#influencers',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: influencer.name,
              item: `https://nattyorjuicy.com/influencer/${id}`,
            },
          ],
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* SEO-optimized content structure */}
        <div className="container mx-auto px-4 py-8">
          {/* Hidden h1 for SEO */}
          <h1 className="sr-only">
            {influencer.name} - Natty or Juicy? Community Verdict on Natural vs Enhanced Status
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {isAdmin && !profileLoading && (
                <AdminInfluencerEditor influencer={influencer} />
              )}
              <InfluencerInfo influencer={influencer} />
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <VotingSection influencerId={id!} onReviewSubmitted={handleReviewSubmitted} />
              <ExpertReviews influencerId={id!} />
              <EnhancedUserReviews ref={userReviewsRef} influencerId={id!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfluencerProfile;

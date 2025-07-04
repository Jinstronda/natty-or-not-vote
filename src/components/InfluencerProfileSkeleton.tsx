import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/Header";

// Realistic skeleton that matches the actual InfluencerProfile layout
export const InfluencerProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Influencer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Gallery Skeleton */}
            <Card>
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 mx-auto" /> {/* Name */}
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-16 w-full" /> {/* Description */}
                </div>
              </CardContent>
            </Card>
            
            {/* Social Links Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Voting & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Voting Section Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vote Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                  <div className="text-center">
                    <Skeleton className="h-8 w-32 mx-auto rounded-full" />
                  </div>
                </div>
                
                {/* Vote Buttons */}
                <div className="flex gap-4 justify-center">
                  <Skeleton className="h-12 w-32 rounded-lg" />
                  <Skeleton className="h-12 w-32 rounded-lg" />
                </div>
                
                {/* Vote Counts */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expert Reviews Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* User Reviews Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
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

// Progressive skeleton that reveals content as it loads
export const ProgressiveInfluencerSkeleton = ({ 
  showVoting = false, 
  showExpertReviews = false,
  showUserReviews = false 
}: {
  showVoting?: boolean;
  showExpertReviews?: boolean;
  showUserReviews?: boolean;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Always show */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full rounded-t-lg animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progressive */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Voting Section - Show if enabled */}
            {showVoting ? (
              <Card className="animate-fadeIn">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-4 justify-center">
                      <Skeleton className="h-12 w-32 rounded-lg animate-pulse" />
                      <Skeleton className="h-12 w-32 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Skeleton className="h-48 w-full rounded-lg" />
            )}

            {/* Expert Reviews - Show if enabled */}
            {showExpertReviews ? (
              <Card className="animate-fadeIn">
                <CardHeader>
                  <Skeleton className="h-6 w-36" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Skeleton className="h-40 w-full rounded-lg" />
            )}

            {/* User Reviews - Show if enabled */}
            {showUserReviews ? (
              <Card className="animate-fadeIn">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Skeleton className="h-64 w-full rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
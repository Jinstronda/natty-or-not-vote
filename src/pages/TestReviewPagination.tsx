import React from 'react';
import { useParams } from 'react-router-dom';
import EnhancedUserReviews from '@/components/EnhancedUserReviews';
import UserReviews from '@/components/UserReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Zap } from 'lucide-react';

// Test page to compare original vs enhanced review components
const TestReviewPagination = () => {
  const { influencerId } = useParams<{ influencerId: string }>();
  
  if (!influencerId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please provide an influencer ID in the URL</p>
            <p className="text-sm mt-2">Format: /test-reviews/:influencerId</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Review Pagination & Sorting Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>Testing Influencer ID:</Badge>
              <code className="bg-muted px-2 py-1 rounded text-sm">{influencerId}</code>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Compare the original UserReviews component with the new EnhancedUserReviews component.</p>
              <p className="mt-1">
                <strong>New features:</strong> Pagination (numbered reviews), sorting by likes/recent, progress indicators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A/B Testing Tabs */}
      <Tabs defaultValue="enhanced" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Enhanced (New)
          </TabsTrigger>
          <TabsTrigger value="original" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Original
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">Enhanced UserReviews</CardTitle>
              <div className="text-sm text-muted-foreground">
                ✅ Pagination • ✅ Sorting • ✅ Review numbering • ✅ Progress indicators
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedUserReviews 
                influencerId={influencerId}
                pageSize={5} // Smaller page size for testing
                defaultSort="recent"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="original" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">Original UserReviews</CardTitle>
              <div className="text-sm text-muted-foreground">
                Shows all reviews at once (no pagination or sorting)
              </div>
            </CardHeader>
            <CardContent>
              <UserReviews influencerId={influencerId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>1. Enhanced Component:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Reviews should be numbered (1, 2, 3...)</li>
              <li>Sort controls should allow switching between Recent and Popular</li>
              <li>Load More button should appear if there are more than 5 reviews</li>
              <li>Progress bar should show loading progress</li>
            </ul>
            
            <p className="pt-2"><strong>2. Original Component:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Shows all reviews at once</li>
              <li>No pagination or sorting</li>
              <li>Should maintain existing functionality</li>
            </ul>

            <p className="pt-2"><strong>3. Test Scenarios:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Switch between Recent and Popular sorting</li>
              <li>Test pagination with Load More button</li>
              <li>Verify review numbering is correct</li>
              <li>Ensure all existing functionality still works (editing, deleting, reactions)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReviewPagination;
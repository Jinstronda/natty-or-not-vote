
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === id;
  
  const { data: profileData } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['user-votes', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          influencers!inner(name)
        `)
        .eq('user_id', id)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });
  
  if (!profileData) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-4">
                  {isOwnProfile ? (
                    <ProfilePictureUpload />
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.profile_picture_url} alt={profileData.username} />
                      <AvatarFallback className="text-xl">
                        {profileData.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl font-heading">{profileData.username}</CardTitle>
                  <p className="text-muted-foreground">Member since {new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                  {profileData.role === 'admin' && (
                    <Badge className="mt-2 bg-yellow-500">Admin</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userVotes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userReviews.length}</div>
                  <div className="text-sm text-muted-foreground">Reviews Written</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-natty">{userVotes.filter(v => v.vote === 'natty').length}</div>
                  <div className="text-sm text-muted-foreground">Natty Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-juicy">{userVotes.filter(v => v.vote === 'juicy').length}</div>
                  <div className="text-sm text-muted-foreground">Juicy Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-natty">
                    {userVotes.length > 0 ? Math.round((userVotes.filter(v => v.vote === 'natty').length / userVotes.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Natty Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-juicy">
                    {userVotes.length > 0 ? Math.round((userVotes.filter(v => v.vote === 'juicy').length / userVotes.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Juicy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userReviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                userReviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={review.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                          {review.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">on</span>
                        <Link 
                          to={`/influencer/${review.influencer_id}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {review.influencers?.name || 'Unknown Influencer'}
                        </Link>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.timestamp).toLocaleDateString()} {/* Fixed: use timestamp */}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.likes || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

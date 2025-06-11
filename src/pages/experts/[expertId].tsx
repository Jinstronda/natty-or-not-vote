import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalLink, User } from 'lucide-react';
import InfluencerProfile from '@/pages/InfluencerProfile';
import AdminExpertEditor from '@/components/AdminExpertEditor';
import { useAuth } from '@/contexts/AuthContext';

const ExpertProfilePage = () => {
  const { expertId } = useParams();
  const [expert, setExpert] = useState<any & { influencer_id?: string; bio?: string; twitter?: string; instagram?: string } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [influencer, setInfluencer] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!expertId) return;
    const fetchExpert = async () => {
      const { data } = await supabase.from('experts').select('*').eq('id', expertId).single();
      setExpert({
        ...data,
        influencer_id: data?.influencer_id ?? undefined,
        bio: data?.bio ?? undefined,
        twitter: data?.twitter ?? undefined,
        instagram: data?.instagram ?? undefined,
      });
      if (data?.influencer_id) {
        const { data: inf } = await supabase.from('influencers').select('*').eq('id', data.influencer_id).single();
        setInfluencer(inf);
      } else if (data?.name) {
        // Fallback: try to match influencer by name
        const { data: inf } = await supabase.from('influencers').select('*').eq('name', data.name).single();
        setInfluencer(inf);
      }
    };
    const fetchReviews = async () => {
      const { data } = await supabase.from('expert_reviews').select('*').eq('expert_id', expertId);
      setReviews(data || []);
    };
    fetchExpert();
    fetchReviews();
  }, [expertId]);

  if (!expert) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      {user?.role === 'admin' && <AdminExpertEditor expert={expert} />}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="rounded-full bg-primary text-white w-16 h-16 flex items-center justify-center text-3xl font-bold">
            {expert.name?.[0] || <User className="w-8 h-8" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{expert.name}</CardTitle>
            <div className="flex gap-3 mt-2">
              {expert.email && (
                <a href={`mailto:${expert.email}`} className="text-blue-600 hover:underline text-sm">{expert.email}</a>
              )}
              {expert.twitter && (
                <a href={expert.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Twitter</a>
              )}
              {expert.instagram && (
                <a href={expert.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline text-sm">Instagram</a>
              )}
              {/* Add more socials as needed */}
            </div>
            {expert.influencer_id && (
              <a href={`/influencer/${expert.influencer_id}`} className="inline-block mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition">
                View Natty or Juicy Page
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {expert.bio && <p className="mb-4 text-muted-foreground">{expert.bio}</p>}
          <h3 className="font-semibold mb-2">Expert Reviews</h3>
          {reviews.length === 0 && <div className="text-muted-foreground text-sm">No reviews yet.</div>}
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border rounded-lg p-4 bg-yellow-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">For:</span>
                  {review.link_url ? (
                    <a href={review.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" /> Read Full Review
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm font-medium">No video link</span>
                  )}
                </div>
                <div className="mb-2 text-base text-muted-foreground">{review.content}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {influencer && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Influencer Profile</h3>
          <InfluencerProfile />
        </div>
      )}
    </div>
  );
};

export default ExpertProfilePage; 
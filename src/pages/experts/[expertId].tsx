import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';
import AdminExpertEditor from '@/components/AdminExpertEditor';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ExpertReviews from '@/components/ExpertReviews';

const ExpertProfilePage = () => {
  const { expertId } = useParams();
  const [expert, setExpert] = useState<any & { influencer_id?: string; bio?: string; twitter?: string; instagram?: string } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [influencer, setInfluencer] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!expertId) return;
    const fetchExpert = async () => {
      try {
        const { data, error } = await supabase.from('experts').select('*').eq('id', expertId).single();
        if (error) {
          console.error('Error fetching expert:', error);
          return;
        }
        
        setExpert({
          ...data,
          influencer_id: data?.influencer_id ?? undefined,
          bio: data?.bio ?? undefined,
          twitter: data?.twitter ?? undefined,
          instagram: data?.instagram ?? undefined,
        });
        
        if (data?.influencer_id) {
          // Try to find influencer by ID
          const { data: inf, error: infError } = await supabase.from('influencers').select('*').eq('id', data.influencer_id).maybeSingle();
          if (!infError && inf) {
            setInfluencer(inf);
          }
        } else if (data?.name) {
          // Fallback: try to match influencer by name (gracefully handle no results)
          const { data: inf, error: infError } = await supabase.from('influencers').select('*').eq('name', data.name).maybeSingle();
          if (!infError && inf) {
            setInfluencer(inf);
          }
          // If no influencer found by name, that's okay - just don't set any influencer data
        }
      } catch (error) {
        console.error('Error in fetchExpert:', error);
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {user?.role === 'admin' && <AdminExpertEditor expert={expert} />}
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold mb-4 overflow-hidden">
              {expert.profile_picture_url ? (
                <img src={expert.profile_picture_url} alt={expert.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                expert.name?.[0] || <User className="w-10 h-10" />
              )}
            </div>
            <h1 className="font-heading font-bold text-2xl mb-1 text-center">{expert.name || 'Unknown Expert'}</h1>
            {expert.bio && <p className="mb-3 text-muted-foreground text-center">{expert.bio}</p>}
            <div className="flex flex-wrap gap-3 justify-center mb-3">
              {expert.email && (
                <a href={`mailto:${expert.email}`} className="text-blue-600 hover:underline text-sm">{expert.email}</a>
              )}
              {expert.twitter && (
                <a href={expert.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Twitter</a>
              )}
              {expert.instagram && (
                <a href={expert.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline text-sm">Instagram</a>
              )}
            </div>
            {expert.influencer_id && (
              <a href={`/influencer/${expert.influencer_id}`} className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-natty to-juicy text-white font-bold rounded-lg shadow hover:scale-105 transition text-lg">
                NATTY OR JUICY?
              </a>
            )}
          </CardContent>
        </Card>
        <div className="mb-8">
          <ExpertReviews expertId={expert.id} />
        </div>
        {influencer && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Influencer Profile</h3>
            {/* Optionally render InfluencerProfile or InfluencerInfo here if you want */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertProfilePage; 
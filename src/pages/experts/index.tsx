import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';
import Link from 'next/link';

const ExpertsDirectory = () => {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      const { data } = await supabase.from('experts').select('*').order('name');
      setExperts(data || []);
      setLoading(false);
    };
    fetchExperts();
  }, []);

  if (loading) return <div className="text-center py-12">Loading experts...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Experts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {experts.map((expert) => (
          <Link key={expert.id} href={`/experts/${expert.id}`} className="group">
            <Card className="transition-transform group-hover:scale-105 cursor-pointer h-full flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden">
                {expert.profile_picture_url ? (
                  <img src={expert.profile_picture_url} alt={expert.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  expert.name?.[0] || <User className="w-8 h-8" />
                )}
              </div>
              <CardContent className="flex-1 flex flex-col items-center">
                <div className="font-semibold text-lg text-center mb-1">{expert.name}</div>
                {expert.influencer_id && (
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full mt-1">Influencer</span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExpertsDirectory; 
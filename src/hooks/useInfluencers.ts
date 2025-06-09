
import { useState } from 'react';
import { Influencer } from '@/types/vote';

const mockInfluencers: Influencer[] = [
  {
    id: '1',
    name: 'Mike Mentzer',
    image: '/placeholder.svg',
    height: '5\'8"',
    weight: '225 lbs',
    yearsTraining: '15+',
    claimedStatus: 'Natural',
    description: 'Professional bodybuilder known for high-intensity training.',
    socialLinks: {
      instagram: 'https://instagram.com/mikementzer',
      youtube: 'https://youtube.com/mikementzer'
    }
  },
  {
    id: '2',
    name: 'David Laid',
    image: '/placeholder.svg',
    height: '6\'2"',
    weight: '190 lbs',
    yearsTraining: '10+',
    claimedStatus: 'Natural',
    description: 'Aesthetic bodybuilder and fitness influencer.',
    socialLinks: {
      instagram: 'https://instagram.com/davidlaid',
      youtube: 'https://youtube.com/davidlaid'
    }
  }
];

export const useInfluencers = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>(mockInfluencers);

  const addInfluencer = (influencer: Omit<Influencer, 'id'>): string => {
    const newId = Date.now().toString();
    const newInfluencer: Influencer = {
      ...influencer,
      id: newId
    };
    setInfluencers([...influencers, newInfluencer]);
    return newId;
  };

  const updateInfluencer = (id: string, updates: Partial<Influencer>) => {
    setInfluencers(influencers.map(inf => 
      inf.id === id ? { ...inf, ...updates } : inf
    ));
  };

  const deleteInfluencer = (id: string) => {
    setInfluencers(influencers.filter(inf => inf.id !== id));
  };

  return {
    influencers,
    addInfluencer,
    updateInfluencer,
    deleteInfluencer
  };
};

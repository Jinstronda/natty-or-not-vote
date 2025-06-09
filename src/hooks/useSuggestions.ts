
import { useState } from 'react';
import { InfluencerSuggestion } from '@/types/vote';

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<InfluencerSuggestion[]>([]);

  const submitInfluencerSuggestion = (submittedBy: string, submitterUsername: string, influencerName: string, socialLinks: any) => {
    const newSuggestion: InfluencerSuggestion = {
      id: Date.now().toString(),
      submittedBy,
      submitterUsername,
      influencerName,
      socialLinks,
      timestamp: new Date().toLocaleDateString(),
      status: 'pending'
    };
    setSuggestions([...suggestions, newSuggestion]);
  };

  const updateSuggestionStatus = (suggestionId: string, status: 'approved' | 'rejected') => {
    setSuggestions(suggestions.map(s => 
      s.id === suggestionId ? { ...s, status } : s
    ));
  };

  return {
    suggestions,
    submitInfluencerSuggestion,
    updateSuggestionStatus
  };
};

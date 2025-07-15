import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug, extractIdFromSlug } from '@/utils/seo/urlGenerator';

export interface InfluencerRouteData {
  id: string;
  name: string;
  isLoading: boolean;
  error: string | null;
  redirect: boolean;
}

/**
 * Hook to handle both ID-based and name-based influencer routing
 * Supports URLs like:
 * - /influencer/uuid-123 (legacy)
 * - /influencer/mike-israetel (SEO-friendly)
 */
export function useInfluencerRouting(): InfluencerRouteData {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<InfluencerRouteData>({
    id: id || '',
    name: '',
    isLoading: true,
    error: null,
    redirect: false,
  });

  useEffect(() => {
    if (!id) {
      setResult(prev => ({
        ...prev,
        error: 'No influencer ID provided',
        isLoading: false,
      }));
      return;
    }

    const loadInfluencerData = async () => {
      try {
        // Fetch influencers from database
        const { data: influencers, error } = await supabase
          .from('influencers')
          .select('id, name, trending, controversial');

        if (error) {
          throw error;
        }

        if (!influencers || influencers.length === 0) {
          setResult(prev => ({
            ...prev,
            error: 'No influencers data available',
            isLoading: false,
          }));
          return;
        }

        // Check if ID is a UUID (legacy format)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          // Legacy UUID-based URL - find influencer and redirect to name-based URL
          const influencer = influencers.find(inf => inf.id === id);
          if (influencer) {
            const nameSlug = generateSlug(influencer.name);
            const newUrl = `/influencer/${nameSlug}`;
            
            // Redirect to name-based URL for SEO
            navigate(newUrl, { replace: true });
            
            setResult({
              id: influencer.id,
              name: influencer.name,
              isLoading: false,
              error: null,
              redirect: true,
            });
          } else {
            setResult(prev => ({
              ...prev,
              error: 'Influencer not found',
              isLoading: false,
            }));
          }
        } else {
          // Name-based URL - extract ID from slug
          const influencerData = influencers.map(inf => ({
            id: inf.id,
            name: inf.name,
            trending: inf.trending,
            controversial: inf.controversial,
          }));
          
          const actualId = extractIdFromSlug(id, influencerData);
          
          if (actualId) {
            const influencer = influencers.find(inf => inf.id === actualId);
            if (influencer) {
              setResult({
                id: actualId,
                name: influencer.name,
                isLoading: false,
                error: null,
                redirect: false,
              });
            } else {
              setResult(prev => ({
                ...prev,
                error: 'Influencer not found',
                isLoading: false,
              }));
            }
          } else {
            setResult(prev => ({
              ...prev,
              error: 'Influencer not found',
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading influencer data:', error);
        setResult(prev => ({
          ...prev,
          error: 'Failed to load influencer data',
          isLoading: false,
        }));
      }
    };

    loadInfluencerData();
  }, [id, navigate]);

  return result;
}

/**
 * Helper hook to generate SEO-friendly URLs for influencers
 */
export function useInfluencerUrls() {
  const getInfluencerUrl = (influencer: { id: string; name: string }) => {
    const slug = generateSlug(influencer.name);
    return `/influencer/${slug}`;
  };

  const getCanonicalUrl = (influencer: { id: string; name: string }) => {
    const slug = generateSlug(influencer.name);
    return `https://nattyorjuicy.com/influencer/${slug}`;
  };

  return {
    getInfluencerUrl,
    getCanonicalUrl,
  };
}
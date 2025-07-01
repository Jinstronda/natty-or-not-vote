import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Users, Link, Instagram, Youtube, Music, Loader2, TrendingUp, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SecureImageUpload from "@/components/SecureImageUpload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilter } from './SearchFilter';
import { QuickToggle, ControversialBadge } from './QuickToggle';
import { StatusSelect, StatusBadge } from './StatusSelect';
import { TabbedEditModal } from './TabbedEditModal';

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

interface Influencer {
  id: string;
  name: string;
  image: string;
  height?: string;
  weight?: string;
  years_training?: string;
  claimed_status?: string;
  description?: string;
  controversial?: boolean;
  social_links?: SocialLinks;
}

interface DatabaseInfluencer {
  id: string;
  name: string;
  image: string | null;
  height?: string | null;
  weight?: string | null;
  years_training?: string | null;
  claimed_status?: string | null;
  description?: string | null;
  social_links?: any;
  created_at: string;
  updated_at: string;
}

// Google Custom Search API integration with fallback
const GOOGLE_APIS = [
  {
    key: 'AIzaSyBzCiMQVvwRjhXuV3UWeLVPKbzcSMXmutI',
    cx: '8633be9a799b543bf',
    name: 'Primary Google API'
  },
  {
    key: 'AIzaSyAJDLTa3LKQZGNkd6UejcooS7UAu4shpQ4',
    cx: 'c7a7a402e64904fcd',
    name: 'Fallback Google API'
  },
  {
    key: 'AIzaSyB3zrE1hiL64b3XzwvDjH41POgSWpmh8S4',
    cx: '70707d5d4764b4e0e',
    name: 'Secondary Fallback Google API'
  },
  {
    key: 'AIzaSyDQKjERXpTaVyE79is8m2XqvFPLVv2AVoc',
    cx: '2408f845dc3174767',
    name: 'Tertiary Fallback Google API'
  }
];

// Keep legacy constants for backward compatibility
const GOOGLE_CX = GOOGLE_APIS[0].cx;
const GOOGLE_API_KEY = GOOGLE_APIS[0].key;

// Advanced image validation - actually loads and analyzes image content
const validateImageVisually = async (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      resolve(false);
      return;
    }

    // Basic URL pattern checks first
    const lower = imageUrl.trim().toLowerCase();
    if (
      lower === '' ||
      lower.endsWith('.svg') ||
      lower.includes('placeholder') ||
      lower.includes('no-image') ||
      lower.includes('default') ||
      lower.includes('broken') ||
      lower.includes('/image/') ||
      lower.includes('/photo/') ||
      lower.includes('/missing/') ||
      lower.startsWith('http://') ||
      !(/\.(jpg|jpeg|png|webp)$/i.test(lower))
    ) {
      resolve(false);
      return;
    }

    // Create image element to test actual loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      
      try {
        // Check image dimensions
        if (img.width < 50 || img.height < 50) {
          resolve(false);
          return;
        }

        // Create canvas to analyze image content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(false);
          return;
        }

        canvas.width = Math.min(img.width, 100);
        canvas.height = Math.min(img.height, 100);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data to analyze colors
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let totalBrightness = 0;
        let whitePixels = 0;
        let transparentPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Check for transparency
          if (a < 10) {
            transparentPixels++;
            continue;
          }
          
          // Calculate brightness
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          
          // Check for white/near-white pixels
          if (r > 240 && g > 240 && b > 240) {
            whitePixels++;
          }
        }
        
        const totalPixels = data.length / 4;
        const whiteRatio = whitePixels / totalPixels;
        const transparentRatio = transparentPixels / totalPixels;
        const averageBrightness = totalBrightness / (totalPixels - transparentPixels);
        
        // Reject if image is mostly white, transparent, or too bright
        if (whiteRatio > 0.85 || transparentRatio > 0.7 || averageBrightness > 230) {
          resolve(false);
          return;
        }
        
        resolve(true);
      } catch (error) {
        console.error('Error analyzing image:', error);
        resolve(false);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = imageUrl;
  });
};

// Enhanced function with fallback APIs and progress notifications
async function fetchImagesForInfluencer(name: string, showProgress = false): Promise<string[]> {
  let lastError = '';
  
  // Try Google APIs in sequence
  for (let i = 0; i < GOOGLE_APIS.length; i++) {
    const api = GOOGLE_APIS[i];
    try {
      if (showProgress) {
        toast({
          title: `🔍 Searching for ${name}`,
          description: `Using ${api.name}...`,
          duration: 2000,
        });
      }
      
      const params = new URLSearchParams({
        key: api.key,
        cx: api.cx,
        q: name,
        searchType: 'image',
        num: '3',
        safe: 'active',
      });
      
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
      
      if (res.status === 429) {
        const errorMsg = `${api.name} quota exceeded (429)`;
        console.warn(errorMsg);
        lastError = errorMsg;
        
        if (showProgress) {
          toast({
            title: "⚠️ API Quota Exceeded",
            description: `${api.name} hit rate limit, trying next API...`,
            variant: "destructive",
            duration: 3000,
          });
        }
        continue; // Try next API
      }
      
      if (!res.ok) {
        const errorMsg = `${api.name} error: ${res.status} ${res.statusText}`;
        console.warn(errorMsg);
        lastError = errorMsg;
        continue;
      }
      
      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) {
        lastError = `${api.name} returned no images`;
        continue;
      }
      
      const images = data.items.map((item: any) => item.link).slice(0, 3);
      
      if (showProgress) {
        toast({
          title: "✅ Images Found",
          description: `Found ${images.length} images using ${api.name}`,
          duration: 2000,
        });
      }
      
      return images;
      
    } catch (err) {
      const errorMsg = `${api.name} exception: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(errorMsg);
      lastError = errorMsg;
      continue;
    }
  }
  
  // Fallback to SerpAPI if all Google APIs failed
  try {
    if (showProgress) {
      toast({
        title: `🔄 Fallback Search`,
        description: `Google APIs failed, trying SerpAPI for ${name}...`,
        duration: 3000,
      });
    }
    
    const serpImages = await fetchImagesFromSerpAPI(name);
    if (serpImages.length > 0) {
      if (showProgress) {
        toast({
          title: "✅ Fallback Success",
          description: `Found ${serpImages.length} images using SerpAPI`,
          duration: 2000,
        });
      }
      return serpImages;
    }
  } catch (err) {
    console.error('SerpAPI fallback failed:', err);
    lastError += '; SerpAPI also failed';
  }
  
  // Final fallback to placeholder images
  if (showProgress) {
    toast({
      title: "❌ All APIs Failed",
      description: `Using placeholder images for ${name}. Last error: ${lastError}`,
      variant: "destructive",
      duration: 5000,
    });
  }
  
  console.warn(`All image APIs failed for ${name}. Last error: ${lastError}`);
  return [1, 2, 3].map(i => `https://via.placeholder.com/400x400?text=${encodeURIComponent(name)}+${i}`);
}

// SerpAPI integration (Google Images via SerpAPI)
const SERPAPI_KEY = 'fd4f8562688510f66d448e7c21beaf36d015aa4d'; // Provided by user
async function fetchImagesFromSerpAPI(name: string): Promise<string[]> {
  try {
    // Use the local proxy endpoint to avoid CORS issues
    const res = await fetch(`/api/serpapi-proxy?q=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('SerpAPI proxy error');
    const data = await res.json();
    if (!data.images_results || !Array.isArray(data.images_results)) throw new Error('No images found');
    return data.images_results.map((item: any) => item.original).slice(0, 5);
  } catch (err) {
    return [];
  }
}

// Utility: fetch vote counts for a list of influencer IDs (copied from InfluencerGrid)
const useInfluencerVoteCounts = (influencerIds: string[]) => {
  return useQuery({
    queryKey: ['admin-influencer-vote-counts', influencerIds],
    queryFn: async () => {
      if (influencerIds.length === 0) return {};
      const { data, error } = await supabase
        .from('influencer_vote_counts')
        .select('influencer_id, total_votes')
        .in('influencer_id', influencerIds);
      if (error) throw error;
      const map: Record<string, number> = {};
      data?.forEach((row: any) => {
        map[row.influencer_id] = row.total_votes;
      });
      return map;
    },
    enabled: influencerIds.length > 0,
    staleTime: 30000,
  });
};

const InfluencerManagement = () => {
  const queryClient = useQueryClient();

  const { data: influencers = [] } = useQuery({
    queryKey: ['admin-influencers'],
    queryFn: async (): Promise<Influencer[]> => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((item: DatabaseInfluencer): Influencer => ({
        id: item.id,
        name: item.name,
        image: item.image || '/placeholder.svg',
        height: item.height || undefined,
        weight: item.weight || undefined,
        years_training: item.years_training || undefined,
        claimed_status: item.claimed_status || undefined,
        description: item.description || undefined,
        controversial: (item as any).controversial || false,
        social_links: (item.social_links as SocialLinks) || {}
      }));
    }
  });

  const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, 'id'>>({
    name: '',
    image: '/placeholder.svg',
    height: '',
    weight: '',
    years_training: '',
    claimed_status: 'unclaimed',
    description: '',
    controversial: false,
    social_links: {}
  });

  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [updatedInfluencersLog, setUpdatedInfluencersLog] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string} | null>(null);

  // Search and filter state for improved UX
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [controversialFilter, setControversialFilter] = useState('all');

  const addInfluencerMutation = useMutation({
    mutationFn: async (influencer: Omit<Influencer, 'id'>) => {
      const { error } = await supabase
        .from('influencers')
        .insert({
          name: influencer.name,
          image: influencer.image,
          height: influencer.height || null,
          weight: influencer.weight || null,
          years_training: influencer.years_training || null,
          claimed_status: influencer.claimed_status || null,
          description: influencer.description || null,
          controversial: influencer.controversial || false,
          social_links: influencer.social_links as any
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const updateInfluencerMutation = useMutation({
    mutationFn: async (influencer: Influencer) => {
      const { error } = await supabase
        .from('influencers')
        .update({
          name: influencer.name,
          image: influencer.image,
          height: influencer.height || null,
          weight: influencer.weight || null,
          years_training: influencer.years_training || null,
          claimed_status: influencer.claimed_status || null,
          description: influencer.description || null,
          controversial: influencer.controversial || false,
          social_links: influencer.social_links as any
        })
        .eq('id', influencer.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const deleteInfluencerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const toggleControversialMutation = useMutation({
    mutationFn: async ({ id, controversial }: { id: string; controversial: boolean }) => {
      const { error } = await supabase
        .from('influencers')
        .update({ controversial } as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      // Use predicate-based invalidation to catch all influencer queries
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'influencers'
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('influencers')
        .update({ claimed_status: status } as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'influencers'
      });
    }
  });

  const handleCreateInfluencer = async () => {
    if (!newInfluencer.name.trim()) {
      toast({
        title: "Error",
        description: "Influencer name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addInfluencerMutation.mutateAsync(newInfluencer);
      setNewInfluencer({
        name: '',
        image: '/placeholder.svg',
        height: '',
        weight: '',
        years_training: '',
        claimed_status: 'unclaimed',
        description: '',
        controversial: false,
        social_links: {}
      });
      
      toast({
        title: "Success",
        description: "Influencer created successfully.",
      });
    } catch (error) {
      console.error('Error creating influencer:', error);
      toast({
        title: "Error",
        description: "Failed to create influencer.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInfluencer = async (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  const confirmDeleteInfluencer = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteInfluencerMutation.mutateAsync(deleteConfirmation.id);
      toast({
        title: "Deleted",
        description: `${deleteConfirmation.name} has been removed.`,
      });
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting influencer:', error);
      toast({
        title: "Error",
        description: "Failed to delete influencer.",
        variant: "destructive",
      });
      setDeleteConfirmation(null);
    }
  };

  const handleUpdateInfluencer = async () => {
    if (!editingInfluencer) return;
    
    try {
      await updateInfluencerMutation.mutateAsync(editingInfluencer);
      setEditingInfluencer(null);
      
      toast({
        title: "Success",
        description: "Influencer updated successfully.",
      });
    } catch (error) {
      console.error('Error updating influencer:', error);
      toast({
        title: "Error",
        description: "Failed to update influencer.",
        variant: "destructive",
      });
    }
  };

  const handleToggleControversial = async (id: string, currentControversial: boolean, name: string) => {
    try {
      await toggleControversialMutation.mutateAsync({ id, controversial: !currentControversial });
      toast({
        title: "Success",
        description: `${name} ${!currentControversial ? 'marked as controversial' : 'removed from controversial'}.`,
      });
    } catch (error) {
      console.error('Error toggling controversial:', error);
      toast({
        title: "Error",
        description: "Failed to update controversial status.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, name: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast({
        title: "Success",
        description: `${name} status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setControversialFilter('all');
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string, isEditing = false) => {
    if (isEditing && editingInfluencer) {
      setEditingInfluencer({
        ...editingInfluencer,
        social_links: {
          ...editingInfluencer.social_links,
          [platform]: value
        }
      });
    } else {
      setNewInfluencer({
        ...newInfluencer,
        social_links: {
          ...newInfluencer.social_links,
          [platform]: value
        }
      });
    }
  };

  const SocialLinksForm = ({ 
    socialLinks, 
    onUpdate, 
    isEditing = false 
  }: { 
    socialLinks: SocialLinks, 
    onUpdate: (platform: keyof SocialLinks, value: string) => void,
    isEditing?: boolean 
  }) => (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Link className="h-4 w-4" />
        Social Media Links
      </Label>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-500" />
          <Input
            placeholder="Instagram URL or @username"
            value={socialLinks.instagram || ''}
            onChange={(e) => onUpdate('instagram', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <Input
            placeholder="YouTube URL or channel name"
            value={socialLinks.youtube || ''}
            onChange={(e) => onUpdate('youtube', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-black" />
          <Input
            placeholder="TikTok URL or @username"
            value={socialLinks.tiktok || ''}
            onChange={(e) => onUpdate('tiktok', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-blue-500" />
          <Input
            placeholder="Twitter/X URL or @username"
            value={socialLinks.twitter || ''}
            onChange={(e) => onUpdate('twitter', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Website URL"
            value={socialLinks.website || ''}
            onChange={(e) => onUpdate('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const getClaimedStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // NEW: Enhanced Google fetch with visual validation
  const handleFetchImagesWithVisualValidation = async () => {
    setFetchingImages(true);
    setUpdatedInfluencersLog([]);
    
    // Show initial progress notification
    toast({
      title: "🚀 Starting Smart Image Validation",
      description: "Analyzing all influencer images and fixing broken ones with fallback APIs...",
      duration: 4000,
    });
    
    try {
      const { data: allInfluencers, error: infError } = await supabase
        .from('influencers')
        .select('id, name, image');
      if (infError) throw infError;

      let updatedCount = 0;
      const processedInfluencers: string[] = [];
      let apiFailures = 0;

      for (const inf of allInfluencers) {
        console.log(`🔍 Checking ${inf.name}...`);
        
        // Check if current image is visually valid
        const isCurrentImageValid = inf.image ? await validateImageVisually(inf.image) : false;
        
        if (!isCurrentImageValid) {
          console.log(`❌ ${inf.name} has broken/invalid image, fetching new ones...`);
          
          // Remove broken images from influencer_photos table
          await supabase
            .from('influencer_photos')
            .delete()
            .eq('influencer_id', inf.id);
          
          // Fetch new images from Google with progress notifications
          const newImages = await fetchImagesForInfluencer(inf.name, true);
          const validImages: string[] = [];
          
          // Validate each new image visually
          for (const imgUrl of newImages) {
            const isValid = await validateImageVisually(imgUrl);
            if (isValid) {
              validImages.push(imgUrl);
              console.log(`✅ Found valid image for ${inf.name}`);
            } else {
              console.log(`❌ Rejected invalid image for ${inf.name}`);
            }
          }
          
          if (validImages.length > 0) {
            // Update main image with first valid image
            await supabase
              .from('influencers')
              .update({ image: validImages[0] })
              .eq('id', inf.id);
            
            // Add all valid images to photos table
            for (let i = 0; i < validImages.length; i++) {
              await supabase.from('influencer_photos').insert({
                influencer_id: inf.id,
                image_url: validImages[i],
                description: `Visual-validated Google image for ${inf.name}`,
                order: i
              });
            }
            
            processedInfluencers.push(inf.name);
            updatedCount++;
            console.log(`✅ Updated ${inf.name} with ${validImages.length} valid images`);
          } else {
            console.log(`⚠️ No valid images found for ${inf.name}`);
            apiFailures++;
          }
        } else {
          console.log(`✅ ${inf.name} already has a valid image`);
        }
        
        // Small delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setUpdatedInfluencersLog(processedInfluencers);
      
      // Final completion notification with detailed stats
      const successRate = allInfluencers.length > 0 ? ((allInfluencers.length - apiFailures) / allInfluencers.length * 100).toFixed(1) : 100;
      toast({
        title: '✅ Smart Image Validation Complete!',
        description: `Updated ${updatedCount} influencers • ${apiFailures} API failures • ${successRate}% success rate`,
        duration: 5000,
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    } catch (error) {
      console.error('Error in visual validation:', error);
      toast({
        title: '❌ Image Validation Failed',
        description: `System error during image validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setFetchingImages(false);
    }
  };

  // Fetch and add images for influencers without photos
  const handleFetchImagesForMissing = async () => {
    setFetchingImages(true);
    try {
      // 1. Get all influencers
      const { data: allInfluencers, error: infError } = await supabase
        .from('influencers')
        .select('id, name, image');
      if (infError) throw infError;
      let updatedCount = 0;
      for (const inf of allInfluencers) {
        // Helper to check if an image is valid
        function isValidImageUrl(url) {
          if (!url || typeof url !== 'string') return false;
          const lower = url.trim().toLowerCase();
          if (
            lower === '' ||
            lower.endsWith('.svg') ||
            lower.includes('placeholder') ||
            lower.includes('no-image') ||
            lower.includes('default') ||
            lower.includes('broken') ||
            lower.includes('/image/') ||
            lower.includes('/photo/') ||
            lower.includes('/missing/')
          ) {
            return false;
          }
          return /\.(jpg|jpeg|png|webp)$/i.test(lower);
        }
        // 2. Check if main image is missing or broken
        const mainImageIsBad = !isValidImageUrl(inf.image);
        // 3. Get all photos for this influencer
        const { data: photos, error: photoError } = await supabase
          .from('influencer_photos')
          .select('id, image_url')
          .eq('influencer_id', inf.id);
        if (photoError) continue;
        // 4. Try to use a good image from existing photos
        let goodPhoto = null;
        if (photos && photos.length > 0) {
          goodPhoto = photos.find(p => isValidImageUrl(p.image_url));
        }
        if (mainImageIsBad) {
          if (goodPhoto) {
            // Set main image to first good photo
            await supabase.from('influencers').update({ image: goodPhoto.image_url }).eq('id', inf.id);
            updatedCount++;
            continue; // No need to fetch new images
          } else {
            // Fetch new images with progress notifications
            const images = await fetchImagesForInfluencer(inf.name, true);
            const filteredImages = images.filter(isValidImageUrl);
            if (filteredImages[0]) {
              await supabase.from('influencers').update({ image: filteredImages[0] }).eq('id', inf.id);
            }
            for (let i = 0; i < filteredImages.length; i++) {
              await supabase.from('influencer_photos').insert({
                influencer_id: inf.id,
                image_url: filteredImages[i],
                description: `Auto-fetched image for ${inf.name}`,
                order: i
              });
            }
            if (filteredImages.length > 0) updatedCount++;
          }
        }
      }
      toast({
        title: 'Image Fetch Complete',
        description: `Updated main images for ${updatedCount} influencer(s) with missing or broken images.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch or add images.',
        variant: 'destructive',
      });
    } finally {
      setFetchingImages(false);
    }
  };

  // Add this function below handleFetchImagesForMissing
  const handleFetchImagesDuckDuckGoForMissing = async () => {
    setFetchingImages(true);
    setUpdatedInfluencersLog([]);
    try {
      const { data: allInfluencers, error: infError } = await supabase
        .from('influencers')
        .select('id, name, image');
      if (infError) throw infError;
      let updatedCount = 0;
      for (const inf of allInfluencers) {
        function isValidImageUrl(url) {
          if (!url || typeof url !== 'string') return false;
          const lower = url.trim().toLowerCase();
          if (
            lower === '' ||
            lower.endsWith('.svg') ||
            lower.includes('placeholder') ||
            lower.includes('no-image') ||
            lower.includes('default') ||
            lower.includes('broken') ||
            lower.includes('/image/') ||
            lower.includes('/photo/') ||
            lower.includes('/missing/') ||
            lower.startsWith('http://') // Only allow https
          ) {
            return false;
          }
          return /\.(jpg|jpeg|png|webp)$/i.test(lower);
        }
        const mainImageIsBad = !isValidImageUrl(inf.image);
        const { data: photos, error: photoError } = await supabase
          .from('influencer_photos')
          .select('id, image_url')
          .eq('influencer_id', inf.id);
        if (photoError) continue;
        let goodPhoto = null;
        if (photos && photos.length > 0) {
          goodPhoto = photos.find(p => isValidImageUrl(p.image_url));
        }
        if (mainImageIsBad) {
          // Remove all placeholder images for this influencer
          await supabase.from('influencer_photos').delete().eq('influencer_id', inf.id).ilike('image_url', '%placeholder%');
          if (inf.image && inf.image.includes('placeholder')) {
            await supabase.from('influencers').update({ image: null }).eq('id', inf.id);
          }
          if (goodPhoto) {
            await supabase.from('influencers').update({ image: goodPhoto.image_url }).eq('id', inf.id);
            setUpdatedInfluencersLog(log => [...log, inf.name]);
            updatedCount++;
            continue;
          } else {
            // Fetch images from DuckDuckGo
            const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(inf.name)}&format=json&no_redirect=1&no_html=1`;
            const res = await fetch(ddgUrl);
            if (!res.ok) continue;
            const data = await res.json();
            let images = [];
            if (data.Image && isValidImageUrl(data.Image)) images.push(data.Image);
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
              for (const topic of data.RelatedTopics) {
                if (topic.Icon && isValidImageUrl(topic.Icon.URL)) images.push(topic.Icon.URL);
                if (topic.Topics && Array.isArray(topic.Topics)) {
                  for (const sub of topic.Topics) {
                    if (sub.Icon && isValidImageUrl(sub.Icon.URL)) images.push(sub.Icon.URL);
                  }
                }
              }
            }
            // Remove duplicates
            images = [...new Set(images)];
            const filteredImages = images.filter(isValidImageUrl);
            if (filteredImages[0]) {
              await supabase.from('influencers').update({ image: filteredImages[0] }).eq('id', inf.id);
              setUpdatedInfluencersLog(log => [...log, inf.name]);
            }
            for (let i = 0; i < filteredImages.length; i++) {
              await supabase.from('influencer_photos').insert({
                influencer_id: inf.id,
                image_url: filteredImages[i],
                description: `DuckDuckGo image for ${inf.name}`,
                order: i
              });
            }
            if (filteredImages.length > 0) updatedCount++;
          }
        }
      }
      toast({
        title: 'DuckDuckGo Image Fetch Complete',
        description: `Updated main images for ${updatedCount} influencer(s) with missing or broken images and removed placeholders.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch or add images from DuckDuckGo.',
        variant: 'destructive',
      });
    } finally {
      setFetchingImages(false);
    }
  };

  const handleFetchImagesSerpAPIMissing = async () => {
    setFetchingImages(true);
    setUpdatedInfluencersLog([]);
    try {
      const { data: allInfluencers, error: infError } = await supabase
        .from('influencers')
        .select('id, name, image');
      if (infError) throw infError;
      let updatedCount = 0;
      // Prioritize influencers with placeholder main images
      const isPlaceholder = (url: string) => url && url.toLowerCase().includes('placeholder');
      const isValidImageUrl = (url: string) => {
        if (!url || typeof url !== 'string') return false;
        const lower = url.trim().toLowerCase();
        if (
          lower === '' ||
          lower.endsWith('.svg') ||
          lower.includes('placeholder') ||
          lower.includes('no-image') ||
          lower.includes('default') ||
          lower.includes('broken') ||
          lower.includes('/image/') ||
          lower.includes('/photo/') ||
          lower.includes('/missing/') ||
          lower.startsWith('http://')
        ) {
          return false;
        }
        return /\.(jpg|jpeg|png|webp)$/i.test(lower);
      };
      // First, influencers with placeholder main images
      const placeholderFirst = [
        ...allInfluencers.filter(inf => isPlaceholder(inf.image)),
        ...allInfluencers.filter(inf => !isPlaceholder(inf.image)),
      ];
      for (const inf of placeholderFirst) {
        const mainImageIsBad = !isValidImageUrl(inf.image);
        if (mainImageIsBad) {
          // Remove all placeholder/broken images for this influencer
          await supabase.from('influencer_photos').delete().eq('influencer_id', inf.id).or(`image_url.ilike.%placeholder%,image_url.ilike.%no-image%,image_url.ilike.%default%,image_url.ilike.%broken%,image_url.ilike.%/image/%,image_url.ilike.%/photo/%,image_url.ilike.%/missing%`);
          if (inf.image && (
            inf.image.includes('placeholder') ||
            inf.image.includes('no-image') ||
            inf.image.includes('default') ||
            inf.image.includes('broken') ||
            inf.image.includes('/image/') ||
            inf.image.includes('/photo/') ||
            inf.image.includes('/missing/')
          )) {
            await supabase.from('influencers').update({ image: null }).eq('id', inf.id);
          }
          // Fetch images from SerpAPI
          const images = await fetchImagesFromSerpAPI(inf.name);
          const filteredImages = images.filter(isValidImageUrl);
          if (filteredImages[0]) {
            await supabase.from('influencers').update({ image: filteredImages[0] }).eq('id', inf.id);
            setUpdatedInfluencersLog(log => [...log, inf.name]);
          }
          for (let i = 0; i < filteredImages.length; i++) {
            await supabase.from('influencer_photos').insert({
              influencer_id: inf.id,
              image_url: filteredImages[i],
              description: `SerpAPI image for ${inf.name}`,
              order: i
            });
          }
          if (filteredImages.length > 0) updatedCount++;
        }
      }
      toast({
        title: 'SerpAPI Image Fetch Complete',
        description: `Updated main images for ${updatedCount} influencer(s) with missing, broken, or placeholder images.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch or add images from SerpAPI.',
        variant: 'destructive',
      });
    } finally {
      setFetchingImages(false);
    }
  };

  const influencerIds = influencers.map(i => i.id);
  const { data: voteCounts } = useInfluencerVoteCounts(influencerIds);
  
  // Apply search and filters with improved UX
  const filteredAndSortedInfluencers = useMemo(() => {
    let result = influencers;

    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(influencer =>
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(influencer =>
        (influencer.claimed_status || 'unclaimed').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply controversial filter
    if (controversialFilter !== 'all') {
      if (controversialFilter === 'controversial') {
        result = result.filter(influencer => influencer.controversial);
      } else {
        result = result.filter(influencer => !influencer.controversial);
      }
    }

    // Sort by vote counts (controversial first, then by votes)
    if (voteCounts && influencerIds.length > 0) {
      result = [...result].sort((a, b) => {
        // First sort by controversial status
        if (a.controversial && !b.controversial) return -1;
        if (!a.controversial && b.controversial) return 1;
        
        // Then by vote count
        const votesA = voteCounts[a.id] || 0;
        const votesB = voteCounts[b.id] || 0;
        return votesB - votesA;
      });
    }

    return result;
  }, [influencers, searchTerm, statusFilter, controversialFilter, voteCounts, influencerIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          onClick={handleFetchImagesWithVisualValidation} 
          disabled={fetchingImages} 
          variant="default"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          🔍 Smart Fix: Auto-Fallback API System (Google → SerpAPI → Placeholder)
        </Button>
        <Button onClick={handleFetchImagesForMissing} disabled={fetchingImages} variant="outline">
          Fetch Images from Google
        </Button>
        <Button onClick={handleFetchImagesDuckDuckGoForMissing} disabled={fetchingImages} variant="outline">
          Fetch Images from DuckDuckGo
        </Button>
        <Button onClick={handleFetchImagesSerpAPIMissing} disabled={fetchingImages} variant="outline">
          Fetch Images from SerpAPI (Replace Placeholders & Broken)
        </Button>
      </div>
      {updatedInfluencersLog.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <strong>Updated Influencers:</strong> {updatedInfluencersLog.join(', ')}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Influencer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SecureImageUpload
            onImageUploaded={(url) => setNewInfluencer({...newInfluencer, image: url})}
            currentImage={newInfluencer.image === '/placeholder.svg' ? undefined : newInfluencer.image}
            onImageRemoved={() => setNewInfluencer({...newInfluencer, image: '/placeholder.svg'})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
            <Input
                id="name"
                placeholder="Full Name"
              value={newInfluencer.name}
              onChange={(e) => setNewInfluencer({...newInfluencer, name: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimed-status">Claimed Status</Label>
              <Select
                value={newInfluencer.claimed_status}
                onValueChange={(value) => setNewInfluencer({...newInfluencer, claimed_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Controversial Status
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="controversial"
                  checked={newInfluencer.controversial || false}
                  onCheckedChange={(checked) => setNewInfluencer({...newInfluencer, controversial: !!checked})}
                />
                <Label htmlFor="controversial" className="text-sm">Mark as controversial (appears at top of homepage)</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
            <Input
                id="height"
                placeholder="e.g., 5'10&quot; or 178cm"
              value={newInfluencer.height}
              onChange={(e) => setNewInfluencer({...newInfluencer, height: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
            <Input
                id="weight"
                placeholder="e.g., 180 lbs or 82kg"
              value={newInfluencer.weight}
              onChange={(e) => setNewInfluencer({...newInfluencer, weight: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Years Training</Label>
            <Input
                id="years"
                placeholder="e.g., 5 years"
              value={newInfluencer.years_training}
              onChange={(e) => setNewInfluencer({...newInfluencer, years_training: e.target.value})}
            />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description about the influencer..."
              value={newInfluencer.description}
              onChange={(e) => setNewInfluencer({...newInfluencer, description: e.target.value})}
              rows={3}
            />
          </div>

          <SocialLinksForm
            socialLinks={newInfluencer.social_links || {}}
            onUpdate={(platform, value) => updateSocialLink(platform, value)}
          />
          
          <Button 
            onClick={handleCreateInfluencer}
            disabled={addInfluencerMutation.isPending}
            className="w-full"
          >
            {addInfluencerMutation.isPending ? 'Creating...' : 'Create Influencer'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Influencers ({filteredAndSortedInfluencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            controversialFilter={controversialFilter}
            onControversialFilterChange={setControversialFilter}
            totalCount={influencers.length}
            filteredCount={filteredAndSortedInfluencers.length}
            onClearFilters={handleClearFilters}
          />
          <div className="space-y-4 mt-6">
            {filteredAndSortedInfluencers.map((influencer) => (
              <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <img 
                    src={influencer.image || '/placeholder.svg'} 
                    alt={influencer.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{influencer.name}</h3>
                      <StatusSelect
                        currentStatus={influencer.claimed_status || 'unclaimed'}
                        isLoading={updateStatusMutation.isPending}
                        onStatusChange={(newStatus) => handleStatusChange(influencer.id, newStatus, influencer.name)}
                        influencerName={influencer.name}
                        size="sm"
                      />
                      <ControversialBadge 
                        isControversial={influencer.controversial || false}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{influencer.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {voteCounts && voteCounts[influencer.id] && (
                        <Badge variant="outline" className="text-xs">
                          {voteCounts[influencer.id]} votes
                        </Badge>
                      )}
                      {influencer.height && <span>H: {influencer.height}</span>}
                      {influencer.weight && <span>W: {influencer.weight}</span>}
                      {influencer.years_training && <span>Training: {influencer.years_training}</span>}
                    </div>
                    {influencer.social_links && Object.values(influencer.social_links).some(link => link) && (
                      <div className="flex items-center gap-1 mt-1">
                        {influencer.social_links.instagram && <Instagram className="h-3 w-3 text-pink-500" />}
                        {influencer.social_links.youtube && <Youtube className="h-3 w-3 text-red-500" />}
                        {influencer.social_links.tiktok && <Music className="h-3 w-3 text-black" />}
                        {influencer.social_links.twitter && <Link className="h-3 w-3 text-blue-500" />}
                        {influencer.social_links.website && <Link className="h-3 w-3 text-gray-500" />}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <QuickToggle
                    isControversial={influencer.controversial || false}
                    isLoading={toggleControversialMutation.isPending}
                    onToggle={() => handleToggleControversial(influencer.id, influencer.controversial || false, influencer.name)}
                    influencerName={influencer.name}
                    size="sm"
                    showLabel={false}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingInfluencer({...influencer})}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteInfluencer(influencer.id, influencer.name)}
                    disabled={deleteInfluencerMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredAndSortedInfluencers.length === 0 && influencers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No influencers yet. Add your first influencer above!
              </div>
            )}
            {filteredAndSortedInfluencers.length === 0 && influencers.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No influencers match your current filters. Try adjusting your search or filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Edit Modal */}
      {editingInfluencer && (
        <TabbedEditModal
          isOpen={!!editingInfluencer}
          onClose={() => setEditingInfluencer(null)}
          influencer={{
            id: editingInfluencer.id,
            name: editingInfluencer.name,
            description: editingInfluencer.description,
            claimed_status: editingInfluencer.claimed_status,
            controversial: editingInfluencer.controversial,
            height: editingInfluencer.height,
            weight: editingInfluencer.weight,
            years_training: editingInfluencer.years_training,
            image: editingInfluencer.image,
            instagram_url: editingInfluencer.social_links?.instagram,
            youtube_url: editingInfluencer.social_links?.youtube,
            tiktok_url: editingInfluencer.social_links?.tiktok,
            twitter_url: editingInfluencer.social_links?.twitter,
            website_url: editingInfluencer.social_links?.website,
          }}
          onSave={(data) => {
            const updatedInfluencer = {
              ...editingInfluencer,
              name: data.name,
              description: data.description,
              claimed_status: data.claimed_status,
              controversial: data.controversial,
              height: data.height,
              weight: data.weight,
              years_training: data.years_training,
              image: data.image || editingInfluencer.image,
              social_links: {
                instagram: data.instagram_url,
                youtube: data.youtube_url,
                tiktok: data.tiktok_url,
                twitter: data.twitter_url,
                website: data.website_url,
              }
            };
            setEditingInfluencer(updatedInfluencer);
            handleUpdateInfluencer();
          }}
          isLoading={updateInfluencerMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Influencer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmation?.name}? This will also delete all associated votes and reviews. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteInfluencer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InfluencerManagement;

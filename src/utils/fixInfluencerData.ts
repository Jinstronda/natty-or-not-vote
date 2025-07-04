import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures all influencers on the main page exist in the influencers table and have at least one photo in influencer_photos.
 * If not, inserts them and their image.
 */
export const fixInfluencerData = async () => {
  // 1. Fetch all influencers from the main page (influencers table)
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, name, image');
  if (error) throw error;
  if (!influencers) return;

  for (const influencer of influencers) {
    // 2. Check if they have at least one photo in influencer_photos
    const { data: photos, error: photoError } = await supabase
      .from('influencer_photos')
      .select('id')
      .eq('influencer_id', influencer.id);
    if (photoError) throw photoError;

    // 3. If not, insert their image as the first photo
    if (!photos || photos.length === 0) {
      if (influencer.image) {
        await supabase.from('influencer_photos').insert({
          influencer_id: influencer.id,
          image_url: influencer.image,
          description: '',
          order: 0
        });
      }
    }
  }

  console.log('✅ Influencer data consistency check complete.');
};

// If run directly (node/ts-node), execute the fix
if (require.main === module) {
  fixInfluencerData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} 
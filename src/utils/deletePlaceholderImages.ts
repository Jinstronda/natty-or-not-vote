import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePlaceholderImages() {
  // Delete from influencer_photos
  await supabase.from('influencer_photos').delete().ilike('image_url', '%placeholder.com%');
  // Reset main image if it's a placeholder
  await supabase.from('influencers').update({ image: null }).ilike('image', '%placeholder.com%');
  console.log('Deleted all placeholder images.');
}

deletePlaceholderImages(); 
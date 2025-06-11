export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      influencers: {
        Row: {
          id: string;
          name: string;
          image: string | null;
          height: string | null;
          weight: string | null;
          years_training: string | null;
          claimed_status: string | null;
          description: string | null;
          social_links: Json | null;
          created_at: string;
          updated_at: string;
        };
      };
      influencer_photos: {
        Row: {
          id: string;
          influencer_id: string;
          image_url: string;
          description: string | null;
          created_at: string;
        };
      };
    };
  };
};

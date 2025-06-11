
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profile_picture_url?: string;
  // Add missing properties for compatibility with Supabase User type
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}

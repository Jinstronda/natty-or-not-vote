
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profile_picture_url?: string;
}

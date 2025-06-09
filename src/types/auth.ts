
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
}

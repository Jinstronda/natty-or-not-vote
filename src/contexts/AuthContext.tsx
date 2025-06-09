
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - including an admin user
const mockUsers: User[] = [
  { id: '1', username: 'FitnessEnthusiast23', email: 'fitness@example.com', role: 'user' },
  { id: '2', username: 'SkepticalLifter', email: 'skeptical@example.com', role: 'user' },
  { id: 'admin', username: 'AdminUser', email: 'admin@nattyornot.com', role: 'admin' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    // Mock signup logic
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      role: 'user'
    };
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

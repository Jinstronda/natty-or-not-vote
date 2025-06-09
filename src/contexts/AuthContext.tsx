
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuthState();
  const { login, logout, signup } = useAuthOperations();

  const contextValue = React.useMemo(() => ({
    user,
    login,
    logout,
    signup,
    loading
  }), [user, login, logout, signup, loading]);

  console.log('AuthContext: Rendering - user:', !!user, 'loading:', loading);

  return (
    <AuthContext.Provider value={contextValue}>
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

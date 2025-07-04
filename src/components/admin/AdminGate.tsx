
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminGate = ({ children, fallback = null }: AdminGateProps) => {
  const { user, supabaseUser, loading: authLoading } = useAuth();
  const { fetchUserProfile } = useUserProfile();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (supabaseUser && !userProfile) {
      setProfileLoading(true);
      fetchUserProfile(supabaseUser)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [supabaseUser, userProfile, fetchUserProfile]);

  if (authLoading || profileLoading) {
    return <div>Loading...</div>;
  }

  if (!user || userProfile?.role !== 'admin') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

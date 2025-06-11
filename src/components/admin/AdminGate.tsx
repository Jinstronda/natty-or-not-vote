import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';

interface AdminGateProps {
  children: React.ReactNode;
}

const AdminGate = ({ children }: AdminGateProps) => {
  const { user } = useAuth();
  const { fetchUserProfile } = useUserProfile();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchUserProfile(user).then((p) => {
        if (isMounted) {
          setProfile(p);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [user, fetchUserProfile]);

  if (loading) return null; // or a spinner
  if (!profile || profile.role !== 'admin') return null;
  return <>{children}</>;
};

export default AdminGate; 

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
    
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userProfile = await fetchUserProfile(user);
          if (isMounted) {
            setProfile(userProfile);
            console.log('AdminGate: User profile fetched:', userProfile);
          }
        } catch (error) {
          console.error('AdminGate: Error fetching profile:', error);
          if (isMounted) {
            setProfile(null);
          }
        }
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAdminStatus();
    
    return () => { 
      isMounted = false; 
    };
  }, [user, fetchUserProfile]);

  if (loading) {
    console.log('AdminGate: Loading...');
    return null; // or a spinner
  }
  
  const isAdmin = profile?.role === 'admin';
  console.log('AdminGate: Check admin status:', { profile: profile, isAdmin });
  
  if (!profile || !isAdmin) {
    console.log('AdminGate: Access denied - not admin');
    return null;
  }
  
  console.log('AdminGate: Access granted - user is admin');
  return <>{children}</>;
};

export default AdminGate;


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback: Processing OAuth callback...');
        
        // Get the session from the URL hash/query params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthCallback: Error getting session:', error);
          toast({
            title: "Authentication Error",
            description: "Failed to complete login. Please try again.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('✅ AuthCallback: Session found, redirecting to home');
          toast({
            title: "Welcome!",
            description: "You have successfully logged in.",
          });
          navigate('/', { replace: true });
        } else {
          console.log('❌ AuthCallback: No session found, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('❌ AuthCallback: Exception:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during login.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <LoadingSpinner message="Completing login..." />;
};

export default AuthCallback;

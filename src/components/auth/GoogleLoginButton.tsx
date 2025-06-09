
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLoadingTimeout } from "@/utils/loadingTimeout";

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

const GoogleLoginButton = ({ disabled = false }: GoogleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Timeout protection for Google OAuth
  const loginTimeout = useLoadingTimeout({
    timeout: 10000, // 10 seconds max for OAuth initiation
    operation: 'GoogleOAuth',
    onTimeout: () => {
      setIsLoading(false);
      toast({
        title: "Login Timeout",
        description: "Google login is taking too long. Please try again.",
        variant: "destructive",
      });
    },
    enableLogging: true
  });

  // Reset loading state if OAuth redirect completes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        // Page became visible again - likely returned from OAuth
        console.log('[GoogleLogin] Page visible, resetting loading state');
        setIsLoading(false);
        loginTimeout.completeLoading();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading, loginTimeout]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    loginTimeout.startLoading();
    
    try {
      console.log('[GoogleLogin] Initiating Google OAuth...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('[GoogleLogin] OAuth error:', error);
        toast({
          title: "Google Login Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        loginTimeout.completeLoading(error.message);
      } else {
        console.log('[GoogleLogin] OAuth initiated successfully - redirecting...');
        // Don't reset loading here - let visibility change handler or auth context handle it
      }
    } catch (error) {
      console.error('[GoogleLogin] Unexpected error:', error);
      toast({
        title: "Google Login Error",
        description: "Failed to initiate Google login. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      loginTimeout.completeLoading(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full mt-4" 
        onClick={handleGoogleLogin}
        disabled={isLoading || disabled}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? "Connecting..." : "Continue with Google"}
      </Button>
    </>
  );
};

export default GoogleLoginButton;

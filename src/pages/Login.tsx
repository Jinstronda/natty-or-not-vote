import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when we're sure about the auth state (not loading) and user exists
    if (!loading && user) {
      console.log('User authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show a brief message
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You are already logged in. Redirecting...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Google-only login page
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-muted-foreground">Sign in with Google to continue</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google login button */}
          <GoogleLoginButton />
          
          {/* Benefits section */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Access your account to:
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span>🗳️</span>
                <span>View your voting history</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>💬</span>
                <span>Manage your reviews</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>👤</span>
                <span>Update your profile</span>
              </div>
            </div>
          </div>
          
          {/* Sign up link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 
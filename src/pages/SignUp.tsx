import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // Check if user has a username already
      checkUserNeedsUsername();
    }
  }, [user, loading, navigate]);

  const checkUserNeedsUsername = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking profile:', error);
        return;
      }
      
      // If user has a username, redirect to home
      if (profile?.username) {
        navigate('/', { replace: true });
      } else {
        // Show username selection form
        setShowUsernameForm(true);
      }
    } catch (err) {
      console.error('Error checking user profile:', err);
    }
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setIsCheckingUsername(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned means username is available
        setUsernameAvailable(true);
      } else if (data) {
        // Username already exists
        setUsernameAvailable(false);
      }
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameAvailable(null);
    
    // Debounce username checking
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !username || !usernameAvailable) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase() })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setSuccess('Username saved successfully!');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: any) {
      console.error('Username update error:', err);
      setError(err.message || 'Failed to save username. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Input validation helpers
  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

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

  // Show username selection form for authenticated users without username
  if (user && showUsernameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Choose your username</CardTitle>
            <p className="text-muted-foreground">Pick a unique username for your profile</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value.trim())}
                  disabled={isSubmitting}
                  className={username && !isUsernameValid ? 'border-red-300' : 
                           usernameAvailable === false ? 'border-red-300' : 
                           usernameAvailable === true ? 'border-green-300' : ''}
                />
                
                {/* Username validation feedback */}
                {username && !isUsernameValid && (
                  <p className="text-sm text-red-600">
                    Username must be 3+ characters and contain only letters, numbers, and underscores
                  </p>
                )}
                
                {isCheckingUsername && (
                  <p className="text-sm text-muted-foreground">Checking availability...</p>
                )}
                
                {usernameAvailable === true && (
                  <p className="text-sm text-green-600">✅ Username available!</p>
                )}
                
                {usernameAvailable === false && (
                  <p className="text-sm text-red-600">❌ Username already taken</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isUsernameValid || !usernameAvailable}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving username...
                  </>
                ) : (
                  'Complete signup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You are already signed up. Redirecting...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Google-only signup page
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join Natty or Juicy</CardTitle>
          <p className="text-muted-foreground">Sign up with Google to get started</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Google signup button */}
          <GoogleLoginButton />
          
          {/* Benefits section */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              By signing up, you'll be able to:
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span>🗳️</span>
                <span>Vote on influencer content</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>💬</span>
                <span>Add reviews and comments</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>📊</span>
                <span>Track your voting history</span>
              </div>
            </div>
          </div>
          
          {/* Sign in link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp; 
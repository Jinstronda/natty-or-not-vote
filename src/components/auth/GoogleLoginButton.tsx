import { supabase } from '@/integrations/supabase/client';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full border py-2 rounded flex items-center justify-center gap-2 hover:bg-muted"
      type="button"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google icon"
        className="h-5 w-5"
      />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton; 

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import LoginForm from "@/components/auth/LoginForm";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import AuthNavigationLinks from "@/components/auth/AuthNavigationLinks";

const Login = () => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in - but wait for loading to complete
  useEffect(() => {
    if (!loading && user) {
      console.log('User already logged in, redirecting to home');
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while auth is initializing
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Login</CardTitle>
          <p className="text-muted-foreground">Welcome back to Natty or Juicy</p>
        </CardHeader>
        <CardContent>
          <LoginForm onLoadingChange={setIsFormLoading} />
          <div className="mt-4">
            <GoogleLoginButton disabled={isFormLoading} />
          </div>
          <AuthNavigationLinks />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

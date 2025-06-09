
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import SignUpForm from "@/components/auth/SignUpForm";
import SignUpNavigationLinks from "@/components/auth/SignUpNavigationLinks";

const SignUp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
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
          <CardTitle className="text-2xl font-heading">Sign Up</CardTitle>
          <p className="text-muted-foreground">Join the Natty or Juicy community</p>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <SignUpNavigationLinks />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;

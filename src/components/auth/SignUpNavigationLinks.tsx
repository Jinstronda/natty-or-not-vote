
import { Link } from "react-router-dom";

const SignUpNavigationLinks = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
      <p className="text-muted-foreground mt-2">
        <Link to="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
};

export default SignUpNavigationLinks;

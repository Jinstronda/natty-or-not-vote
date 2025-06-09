
import { Link } from "react-router-dom";

const AuthNavigationLinks = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
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

export default AuthNavigationLinks;

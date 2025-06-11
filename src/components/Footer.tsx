import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full py-6 mt-12 border-t border-border bg-card text-center text-xs text-muted-foreground">
    <Link to="/terms" className="hover:underline font-medium">
      Terms and Conditions
    </Link>
  </footer>
);

export default Footer; 
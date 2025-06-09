
import { Link } from "react-router-dom";

interface UserProfileProps {
  username: string;
  userId: string;
  className?: string;
}

const UserProfile = ({ username, userId, className = "" }: UserProfileProps) => {
  return (
    <Link 
      to={`/user/${userId}`}
      className={`font-semibold hover:text-primary transition-colors cursor-pointer ${className}`}
    >
      {username}
    </Link>
  );
};

export default UserProfile;

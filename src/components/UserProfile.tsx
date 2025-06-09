
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  username: string;
  userId: string;
  profilePicture?: string;
  className?: string;
  showAvatar?: boolean;
}

const UserProfile = ({ username, userId, profilePicture, className = "", showAvatar = true }: UserProfileProps) => {
  return (
    <Link 
      to={`/user/${userId}`}
      className={`flex items-center gap-2 font-semibold hover:text-primary transition-colors cursor-pointer ${className}`}
    >
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={profilePicture} alt={username} />
          <AvatarFallback className="text-xs">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      {username}
    </Link>
  );
};

export default UserProfile;

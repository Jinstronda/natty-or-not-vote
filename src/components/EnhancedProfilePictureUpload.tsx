import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { withDatabaseTimeout } from "@/utils/loadingTimeout";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  profile_picture_url: string | null;
  created_at: string;
}

const EnhancedProfilePictureUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Exception fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      console.log('[EnhancedProfilePictureUpload] Starting upload process...');
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Supabase storage with timeout protection
      const fileName = `${user.id}_${Date.now()}`;
      
      console.log('[EnhancedProfilePictureUpload] Uploading file to storage...');
      
      const uploadResult = await withDatabaseTimeout(
        () => supabase.storage
          .from('profile-pictures')
          .upload(fileName, file, {
            upsert: true
          }),
        { 
          timeout: 30000, // 30 seconds for profile pictures
          retries: 1,
          operation: 'uploadProfilePicture'
        }
      );

      if (uploadResult.error) {
        console.error('[EnhancedProfilePictureUpload] Upload error:', uploadResult.error);
        throw uploadResult.error;
      }

      console.log('[EnhancedProfilePictureUpload] Upload successful, getting public URL...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('[EnhancedProfilePictureUpload] Public URL obtained:', publicUrl);

      // Update profile in database with timeout protection
      console.log('[EnhancedProfilePictureUpload] Updating profile in database...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('[EnhancedProfilePictureUpload] Database update error:', updateError);
        throw updateError;
      }

      console.log('[EnhancedProfilePictureUpload] Profile updated successfully');

      // Update local state
      if (profileData) {
        setProfileData({ ...profileData, profile_picture_url: publicUrl });
      }

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });

      // Clear preview since we now have the real URL
      setPreviewUrl(null);
    } catch (error) {
      console.error('[EnhancedProfilePictureUpload] Error uploading profile picture:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      const isTimeout = errorMessage.includes('timed out');
      
      toast({
        title: isTimeout ? "Upload Timeout" : "Upload Failed",
        description: isTimeout 
          ? "Upload is taking too long. Please try with a smaller image or check your connection."
          : errorMessage,
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    try {
      console.log('[EnhancedProfilePictureUpload] Removing profile picture...');
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', user.id);

      if (error) {
        console.error('[EnhancedProfilePictureUpload] Remove error:', error);
        throw error;
      }

      console.log('[EnhancedProfilePictureUpload] Profile picture removed successfully');

      // Update local state
      if (profileData) {
        setProfileData({ ...profileData, profile_picture_url: null });
      }

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error('[EnhancedProfilePictureUpload] Error removing profile picture:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile picture';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || !profileData) {
    return <div>User not found.</div>;
  }
  
  const displayName = profileData.username || user.email || "User";
  const currentProfilePicture = previewUrl || profileData.profile_picture_url;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={currentProfilePicture || undefined} alt={displayName} />
          <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-secondary/20">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {currentProfilePicture && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={handleRemoveProfilePicture}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="enhanced-profile-picture-upload"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('enhanced-profile-picture-upload')?.click()}
          disabled={uploading}
          className="flex items-center gap-2 hover-scale"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Profile Picture"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Max 2MB • JPG, PNG, or GIF
        </p>
      </div>
    </div>
  );
};

export default EnhancedProfilePictureUpload; 
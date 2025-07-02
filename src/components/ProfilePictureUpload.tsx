import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const ProfilePictureUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      console.log('[ProfilePictureUpload] Starting upload process...');
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Supabase storage
      const fileName = user.id; // Use user ID as filename (will overwrite existing)
      
      console.log('[ProfilePictureUpload] Uploading file to storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('[ProfilePictureUpload] Upload error:', uploadError);
        throw uploadError;
      }

      console.log('[ProfilePictureUpload] Upload successful, getting public URL...');

      // Get public URL with cache-busting timestamp to prevent browser caching issues
      const timestamp = Date.now();
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Add cache-busting parameter to ensure browser fetches the new image
      const cacheBustedUrl = `${publicUrl}?v=${timestamp}`;

      console.log('[ProfilePictureUpload] Public URL with cache-busting obtained:', cacheBustedUrl);

      // Update profile in database with cache-busted URL
      console.log('[ProfilePictureUpload] Updating profile in database...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: cacheBustedUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('[ProfilePictureUpload] Database update error:', updateError);
        throw updateError;
      }

      console.log('[ProfilePictureUpload] Profile updated successfully');

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });

      // Force refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[ProfilePictureUpload] Error uploading profile picture:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
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
      console.log('[ProfilePictureUpload] Removing profile picture...');
      
      // Remove the actual file from storage
      const fileName = user.id;
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (deleteError) {
        console.error('[ProfilePictureUpload] File deletion error:', deleteError);
        // Don't throw here - continue to update database even if file deletion fails
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', user.id);

      if (error) {
        console.error('[ProfilePictureUpload] Remove error:', error);
        throw error;
      }

      console.log('[ProfilePictureUpload] Profile picture removed successfully');

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });

      // Force refresh user data
      window.location.reload();
    } catch (error) {
      console.error('[ProfilePictureUpload] Error removing profile picture:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile picture';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || user?.profile_picture_url} alt={user?.username} />
          <AvatarFallback className="text-xl">
            {user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {(user?.profile_picture_url || previewUrl) && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveProfilePicture}
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
          id="profile-picture-upload"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('profile-picture-upload')?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Profile Picture"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Max 2MB, JPG, PNG, or GIF
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;

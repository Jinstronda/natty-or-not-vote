
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { withDatabaseTimeout } from "@/utils/loadingTimeout";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onImageRemoved?: () => void;
}

const ImageUpload = ({ onImageUploaded, currentImage, onImageRemoved }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      console.log('[ImageUpload] Uploading to storage:', filePath);

      // Upload with timeout protection
      const uploadResult = await withDatabaseTimeout(
        () => supabase.storage
          .from('influencer-images')
          .upload(filePath, file),
        { 
          timeout: 45000, // 45 seconds for image upload
          retries: 1,
          operation: 'uploadImage'
        }
      );

      if (uploadResult.error) {
        console.error('[ImageUpload] Upload error:', uploadResult.error);
        throw uploadResult.error;
      }

      console.log('[ImageUpload] Upload successful:', uploadResult.data.path);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('influencer-images')
        .getPublicUrl(uploadResult.data.path);

      onImageUploaded(publicUrl);
      
      toast({
        title: "Success!",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error('[ImageUpload] Upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image';
      const isTimeout = errorMessage.includes('timed out');
      
      toast({
        title: isTimeout ? "Upload Timeout" : "Upload Error",
        description: isTimeout 
          ? "Upload is taking too long. Please try with a smaller image or check your connection."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <Label>Influencer Photo</Label>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload a photo
              </span>
            </Label>
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
          </div>
        </div>
      )}
      
      {!preview && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose Image'}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;

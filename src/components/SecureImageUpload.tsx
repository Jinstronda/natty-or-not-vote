
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SecureImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onImageRemoved?: () => void;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const SecureImageUpload = ({ 
  onImageUploaded, 
  currentImage, 
  onImageRemoved,
  maxSizeBytes = 5242880, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: SecureImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { user } = useAuth();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file name for potential security issues
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.php', '.js', '.html', '.htm', '.xml', '.svg'];
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return 'File type not allowed for security reasons';
    }

    return null;
  }

  const sanitizeFileName = (fileName: string): string => {
    // Remove dangerous characters and normalize
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  };

  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Simple manual check for now - list recent uploads
      const { data: uploads } = await supabase.storage
        .from('influencer-images')
        .list('uploads', {
          limit: 100,
          search: `${user.id}`
        });
      
      return (uploads?.length || 0) < 10;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user) {
        throw new Error('You must be logged in to upload images.');
      }

      const file = event.target.files[0];
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Check rate limit
      const rateLimitOk = await checkRateLimit();
      if (!rateLimitOk) {
        throw new Error('Upload rate limit exceeded. Please try again later.');
      }

      // Sanitize filename and add timestamp
      const fileExt = file.name.split('.').pop() || '';
      const sanitizedName = sanitizeFileName(file.name.replace(`.${fileExt}`, ''));
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('influencer-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('influencer-images')
        .getPublicUrl(data.path);

      onImageUploaded(publicUrl);
      
      toast({
        title: "Success!",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      setPreview(currentImage || null);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Error uploading image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
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
              accept={allowedTypes.join(',')}
              onChange={uploadImage}
              disabled={uploading}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Max {Math.round(maxSizeBytes / 1024 / 1024)}MB, {allowedTypes.join(', ')}
          </div>
        </div>
      )}
      
      {!preview && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || !user}
        >
          {uploading ? 'Uploading...' : 'Choose Image'}
        </Button>
      )}
    </div>
  );
};

export default SecureImageUpload;

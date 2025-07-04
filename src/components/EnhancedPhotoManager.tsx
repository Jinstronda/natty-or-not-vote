import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Image as ImageIcon,
  GripVertical,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SecureImageUpload from '@/components/SecureImageUpload';
import { InfluencerPhoto } from '@/types/vote';

interface EnhancedPhotoCardProps {
  photo: InfluencerPhoto;
  index: number;
  totalPhotos: number;
  onUpdateDescription: (photoId: string, description: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onMovePhoto: (fromIndex: number, toIndex: number) => void;
}

function EnhancedPhotoCard({
  photo,
  index,
  totalPhotos,
  onUpdateDescription,
  onDeletePhoto,
  onMovePhoto
}: EnhancedPhotoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localDescription, setLocalDescription] = useState(photo.description || '');
  
  const handleSaveDescription = () => {
    onUpdateDescription(photo.id, localDescription);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setLocalDescription(photo.description || '');
    setIsEditing(false);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Photo Display Area */}
        <div className="relative">
          <img 
            src={photo.image_url} 
            alt={photo.description || 'Gallery photo'} 
            className="w-full h-48 md:h-64 lg:h-72 object-cover"
          />
          {/* Photo Order Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-black/70 text-white border-0"
          >
            {index + 1}
          </Badge>
          {/* Quick Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            onClick={() => onDeletePhoto(photo.id)}
            title="Delete photo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Description Area */}
        <div className="p-4 space-y-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="Enter photo description..."
                className="min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveDescription}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="min-h-[60px] p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsEditing(true)}
              title="Click to edit description"
            >
              {photo.description ? (
                <p className="text-sm text-muted-foreground">{photo.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Click to add description...</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Reorder</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMovePhoto(index, index - 1)}
                disabled={index === 0}
                className="h-8 w-8 p-0"
                title="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMovePhoto(index, index + 1)}
                disabled={index === totalPhotos - 1}
                className="h-8 w-8 p-0"
                title="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AddPhotoCardProps {
  onImageUploaded: (url: string) => void;
  onAddPhoto: () => void;
  newPhotoUrl: string;
  newPhotoDescription: string;
  onDescriptionChange: (description: string) => void;
  onImageRemoved: () => void;
  isUploading: boolean;
  disabled: boolean;
}

function AddPhotoCard({
  onImageUploaded,
  onAddPhoto,
  newPhotoUrl,
  newPhotoDescription,
  onDescriptionChange,
  onImageRemoved,
  isUploading,
  disabled
}: AddPhotoCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      disabled ? "opacity-50" : "hover:shadow-md"
    )}>
      <CardContent className="p-0">
        {/* Upload Area */}
        <div className="h-48 md:h-64 lg:h-72 flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25">
          {newPhotoUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={newPhotoUrl} 
                alt="New photo preview" 
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={onImageRemoved}
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload a photo</p>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="p-4 space-y-3">
          <SecureImageUpload
            onImageUploaded={onImageUploaded}
            currentImage={newPhotoUrl || undefined}
            onImageRemoved={onImageRemoved}
          />
          
          <Textarea
            value={newPhotoDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Description (optional)"
            className="min-h-[60px] resize-none"
          />
          
          <Button 
            onClick={onAddPhoto}
            disabled={!newPhotoUrl || isUploading || disabled}
            className="w-full"
            size="sm"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Photo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EnhancedPhotoManagerProps {
  photos: InfluencerPhoto[];
  onUpdateDescription: (photoId: string, description: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onMovePhoto: (fromIndex: number, toIndex: number) => void;
  onAddPhoto: () => void;
  newPhotoUrl: string;
  newPhotoDescription: string;
  onNewPhotoUrlChange: (url: string) => void;
  onNewPhotoDescriptionChange: (description: string) => void;
  onImageRemoved: () => void;
  isUploading: boolean;
  maxPhotos?: number;
}

export function EnhancedPhotoManager({
  photos,
  onUpdateDescription,
  onDeletePhoto,
  onMovePhoto,
  onAddPhoto,
  newPhotoUrl,
  newPhotoDescription,
  onNewPhotoUrlChange,
  onNewPhotoDescriptionChange,
  onImageRemoved,
  isUploading,
  maxPhotos = 3
}: EnhancedPhotoManagerProps) {
  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold">Photo Gallery</h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage up to {maxPhotos} photos for this influencer
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-center text-base px-3 py-1">
          {photos.length} / {maxPhotos}
        </Badge>
      </div>

      {/* Photo Grid - Optimized for both full-width and sidebar contexts */}
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2 2xl:gap-6">
        {photos.map((photo, index) => (
          <EnhancedPhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            totalPhotos={photos.length}
            onUpdateDescription={onUpdateDescription}
            onDeletePhoto={onDeletePhoto}
            onMovePhoto={onMovePhoto}
          />
        ))}
        
        {canAddMore && (
          <AddPhotoCard
            onImageUploaded={onNewPhotoUrlChange}
            onAddPhoto={onAddPhoto}
            newPhotoUrl={newPhotoUrl}
            newPhotoDescription={newPhotoDescription}
            onDescriptionChange={onNewPhotoDescriptionChange}
            onImageRemoved={onImageRemoved}
            isUploading={isUploading}
            disabled={!canAddMore}
          />
        )}
      </div>

      {!canAddMore && (
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Maximum of {maxPhotos} photos reached. Delete a photo to add a new one.
          </p>
        </div>
      )}
    </div>
  );
}

export default EnhancedPhotoManager; 
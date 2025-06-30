import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, X } from 'lucide-react';
import SecureImageUpload from '@/components/SecureImageUpload';
import { InfluencerPhoto } from '@/types/vote';

interface PhotoManagerModalProps {
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

export function PhotoManagerModal({
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
}: PhotoManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <span className="font-medium">Manage Photos</span>
            <Badge variant="secondary" className="ml-1">
              {photos.length}/{maxPhotos}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Click to open photo gallery manager
          </p>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Photo Gallery Manager
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage up to {maxPhotos} photos for this influencer with proper space and preview
              </p>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1">
              {photos.length} / {maxPhotos}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {/* Enhanced Photo Manager with proper spacing for modal context */}
          <div className="space-y-6">
            {/* Photo Grid optimized for modal width */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {photos.map((photo, index) => (
                <div key={photo.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 bg-white rounded-xl border">
                  {/* Photo Display Area - Much larger in modal */}
                  <div className="relative">
                    <img 
                      src={photo.image_url} 
                      alt={photo.description || 'Gallery photo'} 
                      className="w-full h-64 md:h-72 lg:h-80 object-cover"
                    />
                    {/* Photo Order Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 left-3 bg-black/70 text-white border-0 text-sm px-2 py-1"
                    >
                      {index + 1}
                    </Badge>
                    {/* Quick Delete Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 p-0"
                      onClick={() => onDeletePhoto(photo.id)}
                      title="Delete photo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Description and Controls */}
                  <div className="p-4 space-y-3">
                    <div className="min-h-[80px] p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      {photo.description ? (
                        <p className="text-sm text-gray-700">{photo.description}</p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Click to add description...</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500 font-medium">REORDER</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMovePhoto(index, index - 1)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                          title="Move up"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMovePhoto(index, index + 1)}
                          disabled={index === photos.length - 1}
                          className="h-8 w-8 p-0"
                          title="Move down"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Photo Card - Only show if under limit */}
              {photos.length < maxPhotos && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="h-64 md:h-72 lg:h-80 flex flex-col items-center justify-center bg-gray-50 rounded-t-xl">
                    {newPhotoUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={newPhotoUrl} 
                          alt="New photo preview" 
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3 h-9 w-9 p-0"
                          onClick={onImageRemoved}
                          title="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-lg font-medium text-gray-600">Add New Photo</p>
                        <p className="text-sm text-gray-500">Upload a high-quality image</p>
                      </div>
                    )}
                  </div>

                                     <div className="p-4 space-y-3">
                     <SecureImageUpload
                       onImageUploaded={onNewPhotoUrlChange}
                       currentImage={newPhotoUrl || undefined}
                       onImageRemoved={onImageRemoved}
                     />
                    
                    <textarea 
                      value={newPhotoDescription}
                      onChange={(e) => onNewPhotoDescriptionChange(e.target.value)}
                      placeholder="Add a description for this photo..."
                      className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <Button 
                      onClick={onAddPhoto}
                      disabled={!newPhotoUrl || isUploading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding Photo...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photo to Gallery
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Max Photos Reached Message */}
            {photos.length >= maxPhotos && (
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  Maximum of {maxPhotos} photos reached
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Delete a photo to add a new one
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Photos will be displayed in the order shown above
            </p>
            <Button 
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="px-6"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PhotoManagerModal; 
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Eye, Star, StarOff, Plus } from 'lucide-react';
import { ProductImage } from '@/types/inventory';
const ImageGallery: () => = ({ images, onImagesChange, readonly = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage= {
          id: Date.now().toString() + index,
          url: e.target?.result=== 0 && index === 0,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current_user'
        };
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSetPrimary = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary=== imageId
    }));
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    // If we removed the primary image, set the first remaining image(updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    onImagesChange(updatedImages);
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setViewDialogOpen(true);
  };

  const primaryImage = images.find(img => img.isPrimary) || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      {primaryImage && (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleViewImage(primaryImage)}
          />
          <Badge className="absolute top-2 left-2 bg-blue-600">
            Primary
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => handleViewImage(primaryImage)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleViewImage(image)}
              />
            </div>
            
            {!readonly && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetPrimary(image.id)}
                  className="p-1 h-6 w-6"
                  title={image.isPrimary ? "Primary image" : "Set"}
                >
                  {image.isPrimary ? <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-3 w-3" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(image.id)}
                  className="p-1 h-6 w-6"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Add Image Button */}
        {!readonly && (
          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
              <Plus className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Add Image</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Image Count */}
      <div className="text-sm text-gray-500">
        {images.length} image{images.length !== 1 ? 's' : ''}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.alt}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {selectedImage.isPrimary && (
                  <Badge className="absolute top-2 left-2 bg-blue-600">
                    Primary Image
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Uploaded:</span>
                  <div>{new Date(selectedImage.uploadedAt).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">Uploaded by:</span>
                  <div>{selectedImage.uploadedBy}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;
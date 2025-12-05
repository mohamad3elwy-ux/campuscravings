import React, { useState, useRef, useCallback } from 'react';
import { X, Crop, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageCropper = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  cropShape = 'round' 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation) => {
    setRotation(rotation);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // to avoid CORS issues
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc,
    pixelCrop,
    rotation = 0,
    zoom = 1,
    flip = { horizontal: false, vertical: false }
  ) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotRad
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(zoom, zoom);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      return null;
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      croppedCanvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  const showCroppedImage = useCallback(async () => {
    try {
      // Create a canvas for cropping
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Failed to crop image');
        return;
      }

      // Calculate the visible crop area based on zoom
      const originalSize = Math.min(image.width, image.height);
      const scaledSize = originalSize / zoom;
      const cropSize = scaledSize * 0.9; // Use 90% of scaled size to ensure we crop within bounds

      // Set canvas size
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Calculate source crop position (center crop)
      const sx = (image.width - cropSize) / 2;
      const sy = (image.height - cropSize) / 2;

      // Clear canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw the cropped portion
      ctx.drawImage(
        image,
        sx, sy, cropSize, cropSize,  // Source rectangle
        0, 0, cropSize, cropSize     // Destination rectangle
      );

      ctx.restore();

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          console.log('✅ Image cropped successfully:', {
            originalSize: { width: image.width, height: image.height },
            cropSize: { width: cropSize, height: cropSize },
            rotation,
            zoom,
            blobSize: blob.size
          });
          onCropComplete(croppedImageUrl);
          toast.success('Image cropped successfully!');
        } else {
          toast.error('Failed to crop image');
        }
      }, 'image/jpeg', 0.9);

    } catch (e) {
      console.error('❌ Error cropping image:', e);
      toast.error('Failed to crop image');
    }
  }, [imageSrc, rotation, zoom, onCropComplete]);

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);

    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getRadianAngle = (degreeValue) => {
    return (degreeValue * Math.PI) / 180;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="relative">
            <img 
              src={imageSrc} 
              alt="Crop preview" 
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                transition: 'transform 0.1s ease-out',
                maxHeight: '320px'
              }}
            />
            {/* Crop overlay */}
            <div 
              className="absolute inset-0 border-2 border-red-600 pointer-events-none"
              style={{
                borderRadius: cropShape === 'round' ? '50%' : '8px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2 flex-1">
            <ZoomOut className="h-4 w-4 text-gray-600" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => onZoomChange(e.target.value)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </div>

          <div className="flex items-center space-x-2">
            <RotateCw className="h-4 w-4 text-gray-600" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => onRotationChange(e.target.value)}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={showCroppedImage}
            className="btn btn-primary flex-1 flex items-center justify-center"
          >
            <Crop className="h-4 w-4 mr-2" />
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;

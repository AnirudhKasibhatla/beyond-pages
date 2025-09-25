import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crop, RotateCw, Check, X } from 'lucide-react';

interface ImageCropProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w';
  x: number;
  y: number;
}

export const ImageCrop: React.FC<ImageCropProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  // Load image when dialog opens
  useEffect(() => {
    if (isOpen && imageFile) {
      const img = new Image();
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = img.src;
          setImageDimensions({ width: img.width, height: img.height });
          setImageLoaded(true);
        }
      };
      img.src = URL.createObjectURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // Draw the crop overlay
  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current && imageDimensions.width && imageDimensions.height) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!ctx) return;

      // Set canvas size to match displayed image
      const rect = img.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Scale context to account for device pixel ratio
      ctx.scale(pixelRatio, pixelRatio);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw crop area if exists
      if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
        const scaleX = rect.width / imageDimensions.width;
        const scaleY = rect.height / imageDimensions.height;
        
        const displayX = cropArea.x * scaleX;
        const displayY = cropArea.y * scaleY;
        const displayWidth = cropArea.width * scaleX;
        const displayHeight = cropArea.height * scaleY;

        // Draw dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Clear crop area
        ctx.clearRect(displayX, displayY, displayWidth, displayHeight);

        // Draw crop border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);

        // Draw resize handles
        const handleSize = 8;
        const handles = [
          { pos: 'nw', x: displayX - handleSize/2, y: displayY - handleSize/2 },
          { pos: 'ne', x: displayX + displayWidth - handleSize/2, y: displayY - handleSize/2 },
          { pos: 'sw', x: displayX - handleSize/2, y: displayY + displayHeight - handleSize/2 },
          { pos: 'se', x: displayX + displayWidth - handleSize/2, y: displayY + displayHeight - handleSize/2 },
          { pos: 'n', x: displayX + displayWidth/2 - handleSize/2, y: displayY - handleSize/2 },
          { pos: 'e', x: displayX + displayWidth - handleSize/2, y: displayY + displayHeight/2 - handleSize/2 },
          { pos: 's', x: displayX + displayWidth/2 - handleSize/2, y: displayY + displayHeight - handleSize/2 },
          { pos: 'w', x: displayX - handleSize/2, y: displayY + displayHeight/2 - handleSize/2 }
        ];

        ctx.fillStyle = '#3b82f6';
        handles.forEach(handle => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        });

        // Draw white border for handles
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        handles.forEach(handle => {
          ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
      }
    }
  }, [cropArea, imageLoaded, imageDimensions]);

  const getResizeHandle = useCallback((mouseX: number, mouseY: number, displayCrop: any) => {
    if (!displayCrop) return null;
    
    const handleSize = 8;
    const tolerance = 6;
    
    const handles = [
      { pos: 'nw', x: displayCrop.x - handleSize/2, y: displayCrop.y - handleSize/2 },
      { pos: 'ne', x: displayCrop.x + displayCrop.width - handleSize/2, y: displayCrop.y - handleSize/2 },
      { pos: 'sw', x: displayCrop.x - handleSize/2, y: displayCrop.y + displayCrop.height - handleSize/2 },
      { pos: 'se', x: displayCrop.x + displayCrop.width - handleSize/2, y: displayCrop.y + displayCrop.height - handleSize/2 },
      { pos: 'n', x: displayCrop.x + displayCrop.width/2 - handleSize/2, y: displayCrop.y - handleSize/2 },
      { pos: 'e', x: displayCrop.x + displayCrop.width - handleSize/2, y: displayCrop.y + displayCrop.height/2 - handleSize/2 },
      { pos: 's', x: displayCrop.x + displayCrop.width/2 - handleSize/2, y: displayCrop.y + displayCrop.height - handleSize/2 },
      { pos: 'w', x: displayCrop.x - handleSize/2, y: displayCrop.y + displayCrop.height/2 - handleSize/2 }
    ];
    
    for (const handle of handles) {
      if (mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance &&
          mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance) {
        return handle.pos;
      }
    }
    
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageDimensions.width || !imageDimensions.height) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if we're clicking on a resize handle
    if (cropArea) {
      const displayX = cropArea.x / scaleX;
      const displayY = cropArea.y / scaleY;
      const displayWidth = cropArea.width / scaleX;
      const displayHeight = cropArea.height / scaleY;
      
      const handle = getResizeHandle(mouseX, mouseY, {
        x: displayX,
        y: displayY,
        width: displayWidth,
        height: displayHeight
      });
      
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setStartPosition({ x: mouseX, y: mouseY });
        return;
      }
    }
    
    // Start new crop area
    const x = Math.max(0, Math.min((mouseX) * scaleX, imageDimensions.width));
    const y = Math.max(0, Math.min((mouseY) * scaleY, imageDimensions.height));

    setCropArea({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  }, [imageDimensions, cropArea, getResizeHandle]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageDimensions.width || !imageDimensions.height) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Handle resizing
    if (isResizing && resizeHandle && cropArea) {
      const deltaX = (mouseX - startPosition.x) * scaleX;
      const deltaY = (mouseY - startPosition.y) * scaleY;
      
      setCropArea(prev => {
        if (!prev) return null;
        
        let newArea = { ...prev };
        
        switch (resizeHandle) {
          case 'nw':
            newArea.x = Math.max(0, prev.x + deltaX);
            newArea.y = Math.max(0, prev.y + deltaY);
            newArea.width = Math.max(10, prev.width - deltaX);
            newArea.height = Math.max(10, prev.height - deltaY);
            break;
          case 'ne':
            newArea.y = Math.max(0, prev.y + deltaY);
            newArea.width = Math.max(10, prev.width + deltaX);
            newArea.height = Math.max(10, prev.height - deltaY);
            break;
          case 'sw':
            newArea.x = Math.max(0, prev.x + deltaX);
            newArea.width = Math.max(10, prev.width - deltaX);
            newArea.height = Math.max(10, prev.height + deltaY);
            break;
          case 'se':
            newArea.width = Math.max(10, prev.width + deltaX);
            newArea.height = Math.max(10, prev.height + deltaY);
            break;
          case 'n':
            newArea.y = Math.max(0, prev.y + deltaY);
            newArea.height = Math.max(10, prev.height - deltaY);
            break;
          case 's':
            newArea.height = Math.max(10, prev.height + deltaY);
            break;
          case 'e':
            newArea.width = Math.max(10, prev.width + deltaX);
            break;
          case 'w':
            newArea.x = Math.max(0, prev.x + deltaX);
            newArea.width = Math.max(10, prev.width - deltaX);
            break;
        }
        
        // Ensure crop area stays within image bounds
        newArea.x = Math.max(0, Math.min(newArea.x, imageDimensions.width - newArea.width));
        newArea.y = Math.max(0, Math.min(newArea.y, imageDimensions.height - newArea.height));
        newArea.width = Math.min(newArea.width, imageDimensions.width - newArea.x);
        newArea.height = Math.min(newArea.height, imageDimensions.height - newArea.y);
        
        return newArea;
      });
      
      setStartPosition({ x: mouseX, y: mouseY });
      return;
    }
    
    // Handle drawing new crop area
    if (isDrawing && cropArea) {
      const currentX = Math.max(0, Math.min(mouseX * scaleX, imageDimensions.width));
      const currentY = Math.max(0, Math.min(mouseY * scaleY, imageDimensions.height));

      setCropArea(prev => {
        if (!prev) return null;
        return {
          ...prev,
          width: Math.max(10, currentX - prev.x),
          height: Math.max(10, currentY - prev.y)
        };
      });
    }
    
    // Update cursor based on what we're hovering over
    if (cropArea && !isDrawing && !isResizing) {
      const displayX = cropArea.x / scaleX;
      const displayY = cropArea.y / scaleY;
      const displayWidth = cropArea.width / scaleX;
      const displayHeight = cropArea.height / scaleY;
      
      const handle = getResizeHandle(mouseX, mouseY, {
        x: displayX,
        y: displayY,
        width: displayWidth,
        height: displayHeight
      });
      
      const cursors: Record<string, string> = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'e': 'e-resize',
        'w': 'w-resize'
      };
      
      canvas.style.cursor = handle ? cursors[handle] : 'crosshair';
    }
  }, [isDrawing, isResizing, resizeHandle, cropArea, imageDimensions, startPosition, getResizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleCrop = async () => {
    if (!cropArea || !imageFile) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise<void>((resolve) => {
      img.onload = () => {
        if (!ctx) return;

        // Set canvas dimensions to crop area
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        // Draw cropped portion
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );

        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now()
            });
            onCropComplete(croppedFile);
          }
          resolve();
        }, imageFile.type, 0.9);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleSkipCrop = () => {
    onCropComplete(imageFile);
  };

  const handleReset = () => {
    setCropArea(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-primary" />
            Crop Image for Better Text Recognition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Draw a rectangle around the text you want to extract for better accuracy.
          </p>
          
          <div className="relative overflow-auto max-h-[60vh] border rounded-lg">
            <img
              ref={imageRef}
              className="max-w-full h-auto block"
              style={{ maxHeight: '60vh' }}
              alt="Image to crop"
            />
            {imageLoaded && (
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            )}
          </div>
          
          <div className="flex gap-3 justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!cropArea}
                size="sm"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkipCrop}>
                <X className="h-4 w-4 mr-1" />
                Skip Crop
              </Button>
              <Button 
                onClick={handleCrop}
                disabled={!cropArea || cropArea.width < 10 || cropArea.height < 10}
              >
                <Check className="h-4 w-4 mr-1" />
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
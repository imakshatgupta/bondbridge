import { useState, useRef, useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { CropIcon, ZoomIn, ZoomOut } from 'lucide-react';

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CroppedFile extends File {
  cropData?: CropData;
  previewUrl?: string;
}

interface MediaCropModalProps {
  open: boolean;
  onClose: () => void;
  media: File | null;
  onCropComplete: (croppedFile: CroppedFile) => void;
}

export function MediaCropModal({ open, onClose, media, onCropComplete }: MediaCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isVideo = media?.type.startsWith('video/');

  // Create and set URL when media changes
  useEffect(() => {
    if (media) {
      const url = URL.createObjectURL(media);
      setMediaUrl(url);
      // Reset position and zoom when media changes
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      return () => URL.revokeObjectURL(url);
    }
  }, [media]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle media element loaded
  const onMediaLoad = () => {
    // Center the media initially
    if (mediaRef.current && cropFrameRef.current) {
      centerMedia();
    }
  };

  // Center the media in the crop frame
  const centerMedia = () => {
    if (!mediaRef.current || !cropFrameRef.current || !containerRef.current) return;
    
    const media = mediaRef.current;
    const cropFrame = cropFrameRef.current;
    const container = containerRef.current;
    
    // Calculate dimensions
    const mediaWidth = isVideo 
      ? (media as HTMLVideoElement).videoWidth 
      : (media as HTMLImageElement).naturalWidth;
    const mediaHeight = isVideo 
      ? (media as HTMLVideoElement).videoHeight 
      : (media as HTMLImageElement).naturalHeight;
    
    const frameRect = cropFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the scaled media dimensions
    const scaledMediaWidth = mediaWidth * zoom;
    const scaledMediaHeight = mediaHeight * zoom;
    
    // Center position
    const newX = (containerRect.width - scaledMediaWidth) / 2;
    const newY = (containerRect.height - scaledMediaHeight) / 2;
    
    setPosition({ x: newX, y: newY });
  };

  // Handle dragging
  useEffect(() => {
    if (!open) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, open]);

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
    
    // Adjust position to keep the center point
    if (mediaRef.current && cropFrameRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const cropFrameRect = cropFrameRef.current.getBoundingClientRect();
      
      // Find the center point of the crop frame relative to the container
      const centerX = cropFrameRect.left - containerRect.left + cropFrameRect.width / 2;
      const centerY = cropFrameRect.top - containerRect.top + cropFrameRect.height / 2;
      
      // Calculate relative point from current media position
      const mediaWidth = isVideo 
        ? (mediaRef.current as HTMLVideoElement).videoWidth 
        : (mediaRef.current as HTMLImageElement).naturalWidth;
      const mediaHeight = isVideo 
        ? (mediaRef.current as HTMLVideoElement).videoHeight 
        : (mediaRef.current as HTMLImageElement).naturalHeight;
      
      const oldZoom = zoom;
      const newZoom = value[0];
      
      // Calculate the offset to maintain center point
      const oldWidth = mediaWidth * oldZoom;
      const oldHeight = mediaHeight * oldZoom;
      const newWidth = mediaWidth * newZoom;
      const newHeight = mediaHeight * newZoom;
      
      // Adjust position to keep the center point
      setPosition(prevPosition => ({
        x: prevPosition.x - (newWidth - oldWidth) / 2,
        y: prevPosition.y - (newHeight - oldHeight) / 2
      }));
    }
  };

  // Process cropped media
  const handleCropComplete = () => {
    if (!mediaRef.current || !cropFrameRef.current || !canvasRef.current || !media) return;

    const canvas = canvasRef.current;
    const mediaElement = mediaRef.current;
    const cropFrame = cropFrameRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Get the crop frame position relative to the media
    const frameRect = cropFrame.getBoundingClientRect();
    const mediaRect = mediaElement.getBoundingClientRect();
    
    // Calculate the crop area in original media coordinates
    const cropX = (frameRect.left - mediaRect.left) / zoom;
    const cropY = (frameRect.top - mediaRect.top) / zoom;
    const cropSize = frameRect.width / zoom; // Width = Height for square crop
    
    // Set canvas dimensions to be square (1:1 aspect ratio)
    const outputSize = 512; // Output size for the square crop
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    try {
      // Draw the media to the canvas
      ctx.drawImage(
        mediaElement,
        cropX, cropY, cropSize, cropSize, // Source rectangle
        0, 0, outputSize, outputSize // Destination rectangle
      );
      
      // Create the crop data object
      const mediaWidth = isVideo 
        ? (mediaElement as HTMLVideoElement).videoWidth 
        : (mediaElement as HTMLImageElement).naturalWidth;
      const mediaHeight = isVideo 
        ? (mediaElement as HTMLVideoElement).videoHeight 
        : (mediaElement as HTMLImageElement).naturalHeight;
        
      const cropData: CropData = {
        x: cropX / mediaWidth,         // Store as percentage of original dimensions
        y: cropY / mediaHeight,
        width: cropSize / mediaWidth,
        height: cropSize / mediaHeight
      };

      // Convert canvas to blob
      canvas.toBlob(blob => {
        if (!blob) return;
        
        if (isVideo) {
          // For videos: store the original file + crop metadata + preview image
          const previewUrl = canvas.toDataURL('image/jpeg');
          
          // Create a new File object with cropData attached
          const videoFile = new File([media], media.name, { type: media.type }) as CroppedFile;
          videoFile.cropData = cropData;
          videoFile.previewUrl = previewUrl;
          
          onCropComplete(videoFile);
          onClose();
        } else {
          // For images: create a new cropped image file
          const fileName = `cropped-${Date.now()}.jpg`;
          const croppedFile = new File([blob], fileName, { type: 'image/jpeg' }) as CroppedFile;
          croppedFile.cropData = cropData;
          
          onCropComplete(croppedFile);
          onClose();
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error cropping media:', error);
      // Fallback to original file
      const fallbackFile = media as CroppedFile;
      onCropComplete(fallbackFile);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop {isVideo ? 'Video' : 'Image'} to 1:1 Ratio
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Crop container */}
          <div 
            className="relative w-full bg-muted rounded-md overflow-hidden"
            style={{ height: '500px' }}
            ref={containerRef}
          >
            {/* Fixed square crop frame - centered */}
            <div 
              ref={cropFrameRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent border-4 border-white rounded-sm z-10 pointer-events-none"
              style={{ 
                width: '300px', 
                height: '300px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
              }}
            />
            
            {/* Draggable media container */}
            <div 
              className="absolute w-full h-full overflow-hidden cursor-move"
              onMouseDown={handleDragStart}
              style={{ touchAction: 'none' }}
            >
              {mediaUrl && !isVideo && (
                <img
                  src={mediaUrl}
                  alt="Crop preview"
                  ref={mediaRef as React.RefObject<HTMLImageElement>}
                  onLoad={onMediaLoad}
                  style={{ 
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transition: isDragging ? 'none' : 'transform 200ms ease',
                    maxWidth: 'none'
                  }}
                  draggable="false"
                />
              )}

              {mediaUrl && isVideo && (
                <video
                  src={mediaUrl}
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  controls={false}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={onMediaLoad}
                  style={{ 
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transition: isDragging ? 'none' : 'transform 200ms ease',
                    maxWidth: 'none'
                  }}
                />
              )}
            </div>
            
            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs py-1 px-3 rounded-full">
              Drag to position • Use slider to zoom
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={handleZoomChange}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Hidden canvas used for cropping */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCropComplete}
            className="bg-primary text-primary-foreground"
          >
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
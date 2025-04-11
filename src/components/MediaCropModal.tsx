import { useState, useRef, useEffect } from "react";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CropIcon, ZoomIn, ZoomOut, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export interface VideoFileWithThumbnail extends File {
  thumbnail: File;
  cropData?: CropData;
  previewUrl?: string;
}

// Define all aspect ratio types
type AspectRatioType = "1:1" | "4:5" | "16:9" | "original";

// Define aspect ratio options
const aspectRatioOptions: { value: AspectRatioType; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:5", label: "Portrait (4:5)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "original", label: "Original" },
];

// Calculate aspect ratio dimensions function
const getAspectRatioDimensions = (
  type: AspectRatioType,
  baseSize: number,
  mediaWidth?: number,
  mediaHeight?: number
): { width: number; height: number } => {
  switch (type) {
    case "1:1":
      return { width: baseSize, height: baseSize };
    case "4:5":
      return { width: baseSize * 0.8, height: baseSize };
    case "16:9":
      return { width: baseSize, height: baseSize * (9 / 16) };
    case "original": {
      if (!mediaWidth || !mediaHeight)
        return { width: baseSize, height: baseSize };
      // Maintain original ratio but fit within baseSize
      const ratio = mediaWidth / mediaHeight;
      return ratio >= 1
        ? { width: baseSize, height: baseSize / ratio }
        : { width: baseSize * ratio, height: baseSize };
    }
    default:
      return { width: baseSize, height: baseSize };
  }
};

interface MediaCropModalProps {
  open: boolean;
  onClose: () => void;
  media: File | null;
  onCropComplete: (croppedFile: CroppedFile) => void;
}

export function MediaCropModal({
  open,
  onClose,
  media,
  onCropComplete,
}: MediaCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [mediaDimensions, setMediaDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const cropFrameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create and set URL when media changes
  useEffect(() => {
    if (media) {
      const url = URL.createObjectURL(media);
      setMediaUrl(url);
      // Reset position and zoom when media changes
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setMediaDimensions(null);
      return () => URL.revokeObjectURL(url);
    }
  }, [media]);

  // Calculate min zoom level when image loads
  const calculateMinZoom = () => {
    if (!mediaRef.current || !cropFrameRef.current || !containerRef.current)
      return;

    const media = mediaRef.current;
    const cropFrame = cropFrameRef.current;

    // Get dimensions
    const mediaWidth = media.naturalWidth;
    const mediaHeight = media.naturalHeight;
    const cropFrameWidth = cropFrame.offsetWidth;
    const cropFrameHeight = cropFrame.offsetHeight;

    // Calculate min zoom to fit the crop frame within the image
    // The minimum zoom must ensure the crop frame fits fully inside the image
    const widthRatio = cropFrameWidth / mediaWidth;
    const heightRatio = cropFrameHeight / mediaHeight;

    // Take the larger ratio to ensure the crop frame is filled
    const newMinZoom = Math.max(widthRatio, heightRatio);

    console.log("Calculated min zoom:", newMinZoom);

    return newMinZoom;
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (newAspectRatio: AspectRatioType) => {
    setAspectRatio(newAspectRatio);

    if (!mediaRef.current || !containerRef.current || !mediaDimensions) return;

    const media = mediaRef.current;
    const container = containerRef.current;
    const mediaWidth = media.naturalWidth;
    const mediaHeight = media.naturalHeight;

    // Calculate the new target crop frame dimensions
    const baseSize = 280;
    const targetCropDimensions = getAspectRatioDimensions(
      newAspectRatio,
      baseSize,
      mediaDimensions.width,
      mediaDimensions.height
    );

    // Recalculate minZoom based on target frame dimensions
    const widthRatio = targetCropDimensions.width / mediaWidth;
    const heightRatio = targetCropDimensions.height / mediaHeight;
    const newMinZoom = Math.max(widthRatio, heightRatio);

    if (newMinZoom) {
      // Apply minimum zoom with slight buffer
      const zoomToApply = newMinZoom * 1.05;
      setMinZoom(newMinZoom);
      setZoom(zoomToApply); // Set zoom state immediately

      // Center the media using the new zoom and target dimensions, applying constraints
      const containerRect = container.getBoundingClientRect();
      const scaledMediaWidth = mediaWidth * zoomToApply;
      const scaledMediaHeight = mediaHeight * zoomToApply;

      // Frame center relative to container
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      // Ideal centered position (top-left corner of the image)
      const centeredX = containerCenterX - scaledMediaWidth / 2;
      const centeredY = containerCenterY - scaledMediaHeight / 2;

      // Apply constraints IMMEDIATELY based on target frame dimensions
      const frameWidth = targetCropDimensions.width;
      const frameHeight = targetCropDimensions.height;

      // Frame boundaries relative to the container (assuming centered frame)
      const frameLeft = (containerRect.width - frameWidth) / 2;
      const frameRight = frameLeft + frameWidth;
      const frameTop = (containerRect.height - frameHeight) / 2;
      const frameBottom = frameTop + frameHeight;

      // Calculate allowed movement range for the image's top-left corner
      // The image's left edge cannot go past the frame's left edge
      // The image's right edge cannot go past the frame's right edge
      const minX = frameRight - scaledMediaWidth;
      const maxX = frameLeft;
      const minY = frameBottom - scaledMediaHeight;
      const maxY = frameTop;

      let finalX = centeredX;
      let finalY = centeredY;

      // If image is smaller than frame, center it within the frame
      if (scaledMediaWidth < frameWidth) {
        finalX = frameLeft + (frameWidth - scaledMediaWidth) / 2;
      } else {
        // Otherwise, clamp the position so the frame is always covered
        finalX = Math.max(minX, Math.min(maxX, centeredX));
      }

      if (scaledMediaHeight < frameHeight) {
        finalY = frameTop + (frameHeight - scaledMediaHeight) / 2;
      } else {
        finalY = Math.max(minY, Math.min(maxY, centeredY));
      }

      // Set the constrained position
      setPosition({ x: finalX, y: finalY });

      // Constraint check is now synchronous, remove setTimeout
    }
  };

  // Center the media in the crop frame - improved precise centering
  const centerMedia = () => {
    if (!mediaRef.current || !cropFrameRef.current || !containerRef.current)
      return;

    const media = mediaRef.current;
    const cropFrame = cropFrameRef.current;
    const container = containerRef.current;

    // Get dimensions
    const mediaWidth = media.naturalWidth;
    const mediaHeight = media.naturalHeight;

    // Get the crop frame dimensions and position
    const frameRect = cropFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate the scaled media dimensions
    const scaledMediaWidth = mediaWidth * zoom;
    const scaledMediaHeight = mediaHeight * zoom;

    // Calculate the frame's center position relative to the container
    const frameCenterX =
      frameRect.width / 2 + (frameRect.left - containerRect.left);
    const frameCenterY =
      frameRect.height / 2 + (frameRect.top - containerRect.top);

    // Position the image so its center aligns exactly with the frame's center
    const newX = frameCenterX - scaledMediaWidth / 2;
    const newY = frameCenterY - scaledMediaHeight / 2;

    // Set the position
    setPosition({ x: newX, y: newY });
  };

  // Handle media element loaded - with improved precise positioning
  const onMediaLoad = () => {
    if (!mediaRef.current || !cropFrameRef.current || !containerRef.current)
      return;

    // Store original media dimensions
    if (mediaRef.current) {
      setMediaDimensions({
        width: mediaRef.current.naturalWidth,
        height: mediaRef.current.naturalHeight,
      });
    }

    // First ensure image is visible by setting a default position in the center
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const initialX = containerRect.width / 2;
    const initialY = containerRect.height / 2;
    setPosition({ x: initialX, y: initialY });

    // Calculate minimum zoom and apply it
    const newMinZoom = calculateMinZoom();
    if (!newMinZoom) return;

    // Apply minimum zoom with slight buffer to prevent edge cases
    const zoomToApply = newMinZoom * 1.05; // 5% larger to ensure no edge issues

    // Important: Set min zoom state first
    setMinZoom(newMinZoom);

    // Set the zoom to our buffered value
    setZoom(zoomToApply);

    // Use a synchronous approach to reduce flickering
    setTimeout(() => {
      if (mediaRef.current && cropFrameRef.current && containerRef.current) {
        const media = mediaRef.current;
        const cropFrame = cropFrameRef.current;

        // Get dimensions
        const mediaWidth = media.naturalWidth;
        const mediaHeight = media.naturalHeight;

        // Calculate the scaled media dimensions
        const scaledMediaWidth = mediaWidth * zoomToApply;
        const scaledMediaHeight = mediaHeight * zoomToApply;

        // Get frame position
        const frameRect = cropFrame.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate the exact center position
        const frameCenterX =
          frameRect.left - containerRect.left + frameRect.width / 2;
        const frameCenterY =
          frameRect.top - containerRect.top + frameRect.height / 2;

        // Calculate the position that will center the media on the frame
        const newX = frameCenterX - scaledMediaWidth / 2;
        const newY = frameCenterY - scaledMediaHeight / 2;

        // Apply the position directly
        setPosition({ x: newX, y: newY });
      }
    }, 50);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Fix the crop frame if image becomes smaller than it
  const ensureCropFrameWithinImage = () => {
    if (!mediaRef.current || !cropFrameRef.current || !containerRef.current)
      return;

    const media = mediaRef.current;
    const cropFrame = cropFrameRef.current;
    const container = containerRef.current;

    // Get dimensions
    const mediaWidth = media.naturalWidth * zoom;
    const mediaHeight = media.naturalHeight * zoom;

    const frameRect = cropFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // If the image is smaller than the crop frame in any dimension,
    // we need to center it
    if (mediaWidth < frameRect.width || mediaHeight < frameRect.height) {
      centerMedia();
      return;
    }

    // Calculate allowed regions for the image
    const mediaLeft = position.x;
    const mediaRight = position.x + mediaWidth;
    const mediaTop = position.y;
    const mediaBottom = position.y + mediaHeight;

    const frameLeft = (containerRect.width - frameRect.width) / 2;
    const frameRight = frameLeft + frameRect.width;
    const frameTop = (containerRect.height - frameRect.height) / 2;
    const frameBottom = frameTop + frameRect.height;

    // Check if any adjustments are needed
    let newX = position.x;
    let newY = position.y;
    let needsUpdate = false;

    // Image left edge should not be right of frame left edge
    if (mediaLeft > frameLeft) {
      newX = frameLeft;
      needsUpdate = true;
    }

    // Image right edge should not be left of frame right edge
    if (mediaRight < frameRight) {
      newX = frameRight - mediaWidth;
      needsUpdate = true;
    }

    // Image top edge should not be below frame top edge
    if (mediaTop > frameTop) {
      newY = frameTop;
      needsUpdate = true;
    }

    // Image bottom edge should not be above frame bottom edge
    if (mediaBottom < frameBottom) {
      newY = frameBottom - mediaHeight;
      needsUpdate = true;
    }

    // Update position if needed
    if (needsUpdate) {
      setPosition({ x: newX, y: newY });
    }
  };

  // Effect to ensure crop frame is within image bounds when zoom changes
  useEffect(() => {
    if (open) {
      ensureCropFrameWithinImage();
    }
  }, [zoom, open]);

  // Effect to recalculate min zoom when aspect ratio changes
  useEffect(() => {
    if (open && mediaRef.current && containerRef.current && mediaDimensions) {
      // Calculate target dimensions based on current aspect ratio
      const baseSize = 280;
      const targetCropDimensions = getAspectRatioDimensions(
        aspectRatio,
        baseSize,
        mediaDimensions.width,
        mediaDimensions.height
      );

      const media = mediaRef.current;
      const mediaWidth = media.naturalWidth;
      const mediaHeight = media.naturalHeight;

      // Recalculate minZoom based on target frame dimensions
      const widthRatio = targetCropDimensions.width / mediaWidth;
      const heightRatio = targetCropDimensions.height / mediaHeight;
      const newMinZoom = Math.max(widthRatio, heightRatio);

      if (newMinZoom) {
        const currentMinZoom = minZoom; // Capture current minZoom state
        if (newMinZoom !== currentMinZoom) {
          // Only update if minZoom actually changes
          setMinZoom(newMinZoom);
        }

        // If current zoom is less than new min zoom, update it
        // This hook ONLY ensures zoom validity, no recentering here.
        if (zoom < newMinZoom) {
          setZoom(newMinZoom * 1.05);
          // Constraint check will be handled by the zoom useEffect
        }
      }
    }
    // Depend on minZoom instead of zoom
  }, [aspectRatio, open, mediaDimensions, minZoom]);

  // Handle dragging
  useEffect(() => {
    if (!open) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (
        isDragging &&
        mediaRef.current &&
        cropFrameRef.current &&
        containerRef.current
      ) {
        // Get necessary elements and dimensions
        const media = mediaRef.current;
        const cropFrame = cropFrameRef.current;
        const container = containerRef.current;

        // Calculate raw new position based on drag
        const rawNewX = e.clientX - dragStart.x;
        const rawNewY = e.clientY - dragStart.y;

        // Get dimensions
        const mediaWidth = media.naturalWidth * zoom;
        const mediaHeight = media.naturalHeight * zoom;

        const frameRect = cropFrame.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate container and frame center points
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;

        // Calculate boundary limits
        // These are the maximum distances the image can move from center position
        const maxOffsetX = (mediaWidth - frameRect.width) / 2;
        const maxOffsetY = (mediaHeight - frameRect.height) / 2;

        // Calculate center-based coordinates
        const centerBasedX = rawNewX - containerCenterX + mediaWidth / 2;
        const centerBasedY = rawNewY - containerCenterY + mediaHeight / 2;

        // Clamp to ensure the image boundaries contain the crop frame
        const clampedX = Math.min(
          maxOffsetX,
          Math.max(-maxOffsetX, centerBasedX)
        );
        const clampedY = Math.min(
          maxOffsetY,
          Math.max(-maxOffsetY, centerBasedY)
        );

        // Convert back to top-left based coordinates
        const finalX = containerCenterX - mediaWidth / 2 + clampedX;
        const finalY = containerCenterY - mediaHeight / 2 + clampedY;

        // Update position
        setPosition({ x: finalX, y: finalY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, open, zoom]);

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];

    // Adjust position to keep the center of the crop frame aligned with the center of the image
    if (mediaRef.current && cropFrameRef.current && containerRef.current) {
      const media = mediaRef.current;
      const cropFrame = cropFrameRef.current;
      const container = containerRef.current;

      const mediaWidth = media.naturalWidth;
      const mediaHeight = media.naturalHeight;

      const frameRect = cropFrame.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Find the current center of the image
      const oldZoom = zoom;
      const oldWidth = mediaWidth * oldZoom;
      const oldHeight = mediaHeight * oldZoom;
      const oldCenterX = position.x + oldWidth / 2;
      const oldCenterY = position.y + oldHeight / 2;

      // Find the center of the container
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      // Calculate new image dimensions
      const newWidth = mediaWidth * newZoom;
      const newHeight = mediaHeight * newZoom;

      // Calculate offset from the center
      const offsetX = oldCenterX - containerCenterX;
      const offsetY = oldCenterY - containerCenterY;

      // Scale the offset proportionally
      const scaleRatio = newZoom / oldZoom;
      const newOffsetX = offsetX * scaleRatio;
      const newOffsetY = offsetY * scaleRatio;

      // Calculate new center point
      const newCenterX = containerCenterX + newOffsetX;
      const newCenterY = containerCenterY + newOffsetY;

      // Convert to top-left position
      let newX = newCenterX - newWidth / 2;
      let newY = newCenterY - newHeight / 2;

      // Calculate boundary limits after zoom
      const maxOffsetX = (newWidth - frameRect.width) / 2;
      const maxOffsetY = (newHeight - frameRect.height) / 2;

      // Calculate the current offset from center
      const currentOffsetX = newCenterX - containerCenterX;
      const currentOffsetY = newCenterY - containerCenterY;

      // Clamp the offset if it exceeds the boundaries
      const clampedOffsetX = Math.min(
        maxOffsetX,
        Math.max(-maxOffsetX, currentOffsetX)
      );
      const clampedOffsetY = Math.min(
        maxOffsetY,
        Math.max(-maxOffsetY, currentOffsetY)
      );

      // Recalculate the position if the offset was clamped
      if (
        currentOffsetX !== clampedOffsetX ||
        currentOffsetY !== clampedOffsetY
      ) {
        const adjustedCenterX = containerCenterX + clampedOffsetX;
        const adjustedCenterY = containerCenterY + clampedOffsetY;
        newX = adjustedCenterX - newWidth / 2;
        newY = adjustedCenterY - newHeight / 2;
      }

      // Set the new position
      setPosition({ x: newX, y: newY });
    }

    // Update zoom after calculating new position
    setZoom(newZoom);
  };

  // Process cropped media
  const handleCropComplete = () => {
    if (
      !mediaRef.current ||
      !cropFrameRef.current ||
      !canvasRef.current ||
      !media
    ) {
      console.error("Missing required refs for crop:", {
        mediaRef: !!mediaRef.current,
        cropFrameRef: !!cropFrameRef.current,
        canvasRef: !!canvasRef.current,
        media: !!media,
      });
      return;
    }

    const canvas = canvasRef.current;
    const mediaElement = mediaRef.current as HTMLImageElement;
    const cropFrame = cropFrameRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    try {
      // Get the crop frame position relative to the media
      const frameRect = cropFrame.getBoundingClientRect();
      const mediaRect = mediaElement.getBoundingClientRect();

      // Calculate the crop area in original media coordinates
      const cropX = Math.max(0, (frameRect.left - mediaRect.left) / zoom);
      const cropY = Math.max(0, (frameRect.top - mediaRect.top) / zoom);
      const cropWidth = Math.min(
        mediaElement.naturalWidth - cropX,
        frameRect.width / zoom
      );
      const cropHeight = Math.min(
        mediaElement.naturalHeight - cropY,
        frameRect.height / zoom
      );

      // Ensure we have valid crop dimensions
      if (cropWidth <= 0 || cropHeight <= 0) {
        console.error("Invalid crop dimensions:", { cropWidth, cropHeight });
        const fallbackFile = media as CroppedFile;
        onCropComplete(fallbackFile);
        onClose();
        return;
      }

      // Set canvas dimensions to match the aspect ratio
      let outputWidth = 512;
      let outputHeight = 512;

      // Set appropriate dimensions based on aspect ratio
      switch (aspectRatio) {
        case "1:1":
          outputWidth = 512;
          outputHeight = 512;
          break;
        case "4:5":
          outputWidth = 410; // 512 * 0.8
          outputHeight = 512;
          break;
        case "16:9":
          outputWidth = 512;
          outputHeight = 288; // 512 * (9/16)
          break;
        case "original":
          if (cropWidth >= cropHeight) {
            outputWidth = 512;
            outputHeight = (cropHeight / cropWidth) * 512;
          } else {
            outputHeight = 512;
            outputWidth = (cropWidth / cropHeight) * 512;
          }
          break;
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Draw the media to the canvas
      ctx.drawImage(
        mediaElement,
        cropX,
        cropY,
        cropWidth,
        cropHeight, // Source rectangle
        0,
        0,
        outputWidth,
        outputHeight // Destination rectangle
      );

      // Create the crop data object
      const mediaWidth = mediaElement.naturalWidth;
      const mediaHeight = mediaElement.naturalHeight;

      const cropData: CropData = {
        x: cropX / mediaWidth, // Store as percentage of original dimensions
        y: cropY / mediaHeight,
        width: cropWidth / mediaWidth,
        height: cropHeight / mediaHeight,
      };

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob from canvas");
            const fallbackFile = media as CroppedFile;
            onCropComplete(fallbackFile);
            onClose();
            return;
          }

          try {
            // Create a new cropped image file
            const fileName = `cropped-${Date.now()}.jpg`;
            const croppedFile = new File([blob], fileName, {
              type: "image/jpeg",
            }) as CroppedFile;
            croppedFile.cropData = cropData;

            // Log to debug
            console.log(
              "Crop completed, calling onCropComplete with:",
              croppedFile
            );

            // Call the callback with the cropped file
            onCropComplete(croppedFile);
            onClose();
          } catch (fileError) {
            console.error("Error creating File:", fileError);
            const fallbackFile = media as CroppedFile;
            onCropComplete(fallbackFile);
            onClose();
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("Error cropping media:", error);
      // Fallback to original file
      const fallbackFile = media as CroppedFile;
      onCropComplete(fallbackFile);
      onClose();
    }
  };

  // Get current aspect ratio dimensions
  const getCropFrameDimensions = () => {
    const baseSize = 280; // Base size for crop frame
    return getAspectRatioDimensions(
      aspectRatio,
      baseSize,
      mediaDimensions?.width,
      mediaDimensions?.height
    );
  };

  // Get aspect ratio title
  const getAspectRatioTitle = () => {
    const option = aspectRatioOptions.find((opt) => opt.value === aspectRatio);
    return option ? option.label : "Crop Image";
  };

  // Calculate crop frame dimensions
  const cropDimensions = getCropFrameDimensions();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Image ({getAspectRatioTitle()})
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Aspect ratio selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Aspect Ratio:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between gap-2 w-40"
                >
                  {getAspectRatioTitle()}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {aspectRatioOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="flex justify-between"
                    onClick={() => handleAspectRatioChange(option.value)}
                  >
                    {option.label}
                    {aspectRatio === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Crop container */}
          <div
            className="relative w-full bg-muted rounded-md overflow-hidden flex-1"
            style={{ minHeight: "450px" }}
            ref={containerRef}
          >
            {/* Dynamic crop frame - centered */}
            <div
              ref={cropFrameRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent border-4 border-white rounded-sm z-10 pointer-events-none"
              style={{
                width: `${cropDimensions.width}px`,
                height: `${cropDimensions.height}px`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
              }}
            />

            {/* Draggable media container */}
            <div
              className="absolute w-full h-full overflow-hidden cursor-move active:cursor-grabbing"
              onMouseDown={handleDragStart}
              style={{ touchAction: "none" }}
            >
              {mediaUrl && (
                <img
                  src={mediaUrl}
                  alt="Crop preview"
                  ref={mediaRef as React.RefObject<HTMLImageElement>}
                  onLoad={onMediaLoad}
                  style={{
                    position: "absolute",
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    transition: isDragging
                      ? "none"
                      : "transform 200ms ease, left 100ms ease, top 100ms ease",
                    maxWidth: "none",
                    willChange: "transform, left, top",
                  }}
                  draggable="false"
                />
              )}
            </div>

            {/* Instructions overlay */}
            <div className="absolute z-50 bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs py-1 px-3 rounded-full">
              Drag to position • Use slider to zoom
            </div>
          </div>
        </div>

        {/* Zoom controls - moved outside of the flex container and above footer */}
        <div className="flex items-center gap-2 py-4">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={minZoom}
            max={3}
            step={0.01}
            onValueChange={handleZoomChange}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Hidden canvas used for cropping */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            className="bg-primary text-primary-foreground font-medium"
          >
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

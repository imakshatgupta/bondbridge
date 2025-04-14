import { useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface VideoThumbnailProps {
  videoUrl: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const handleCanPlay = async () => {
      if (!isMounted) return;

      try {
        video.currentTime = 0;
        // Store the play promise
        playPromiseRef.current = video.play();
        await playPromiseRef.current;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Ignore abort errors as they're expected when component unmounts
          return;
        }
        console.error("Error playing video:", err);
      }
    };

    const handleTimeUpdate = () => {
      if (!isMounted) return;
      if (video.currentTime >= 0.3) {
        video.pause();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // Cleanup function
    return () => {
      isMounted = false;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);

      // Cancel any pending play operation
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            video.pause();
            video.currentTime = 0;
          })
          .catch(() => {
            // Ignore errors during cleanup
          });
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        muted
        loop={false}
      />

      {/* Play button overlay */}
      <div className="absolute bottom-3 right-3 flex items-center justify-center bg-black/30">
        <div className="bg-white/90 rounded-full p-2">
          <Play className="w-3 h-3 text-black" strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

export default VideoThumbnail; 
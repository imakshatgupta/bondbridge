import { useEffect } from 'react';

interface VideoObserverProps {
  feedId: string;
  media?: Array<{ type: string, url: string }>;
}

/**
 * Component that handles video intersection observation to auto-play/pause videos
 * based on visibility in the viewport.
 */
export function VideoObserver({ feedId, media = [] }: VideoObserverProps) {
  useEffect(() => {
    // Setup intersection observer for videos
    const videoElements = document.querySelectorAll<HTMLVideoElement>(`[data-post-id="${feedId}"] video`);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(err => console.log("Autoplay prevented:", err));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });
    
    videoElements.forEach(video => {
      observer.observe(video);
    });
    
    return () => {
      videoElements.forEach(video => {
        observer.unobserve(video);
      });
    };
  }, [feedId, media]);

  // This component doesn't render anything visible
  return null;
}

export default VideoObserver; 
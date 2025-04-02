import { useNavigate } from "react-router-dom";
import { ProfilePostData } from "../apis/apiTypes/response";
import { POST_IMAGE } from "../constants/posts";
import { Play } from "lucide-react";
import { useRef, useEffect } from "react";

// Default image to use when a post doesn't have an image
const DEFAULT_POST_IMAGE = POST_IMAGE;

interface Media {
  url: string;
  type: string;
}

interface Post {
  id: number | string;
  media: Media[];
  creationDate?: string;
  content?: string;
  author?: {
    name: string;
    profilePic: string;
  };
  stats?: {
    commentCount: number;
    hasReacted: boolean;
    reactionCount: number;
    reactionType: string | null;
  };
}

interface AllPostsProps {
  posts: (Post | ProfilePostData)[];
  userId: string;
}

const AllPosts: React.FC<AllPostsProps> = ({ posts, userId }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => {
        // Determine if it's a ProfilePostData or a regular Post
        const isProfilePost = "createdAt" in post;

        console.log(JSON.stringify(post, null, 2));

        // Extract the properties based on the type
        const postId = isProfilePost
          ? (post as ProfilePostData).id
          : (post as Post).id;

        const media = isProfilePost
          ? (post as ProfilePostData)?.media || []
          : (post as Post)?.media || [];

        const firstMedia = media[0];

        // Create feedId using post.id and creationDate
        let creationDate = "2025-03-16";

        if (isProfilePost) {
          // For ProfilePostData use the createdAt timestamp
          creationDate = new Date((post as ProfilePostData)?.createdAt * 1000)
            .toISOString()
            .split("T")[0];
        } else if ("creationDate" in post && post?.creationDate) {
          creationDate = post?.creationDate;
        }

        const feedId = `${postId}:${creationDate}`;
        const postWithUserId = { ...post, userId };

        return (
          <div
            key={postId.toString()}
            className="aspect-square border overflow-hidden rounded-3xl m-1 cursor-pointer relative group"
            onClick={() => {
              navigate(`/post/${feedId}`, { state: { post: postWithUserId } });
            }}
          >
            {firstMedia?.type === "image" ? (
              <img
                src={firstMedia.url || DEFAULT_POST_IMAGE}
                alt={`Post ${postId}`}
                className="w-full h-full object-cover"
              />
            ) : firstMedia?.type === "video" ? (
              <VideoThumbnail videoUrl={firstMedia.url} />
            ) : (
              <img
                src={DEFAULT_POST_IMAGE}
                alt={`Post ${postId}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const VideoThumbnail: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
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

export default AllPosts;

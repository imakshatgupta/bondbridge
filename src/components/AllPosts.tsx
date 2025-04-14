import { useNavigate } from "react-router-dom";
import { ProfilePostData } from "../apis/apiTypes/response";
import { POST_IMAGE } from "../constants/posts";
import VideoThumbnail from "./common/VideoThumbnail";

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
  reactionDetails?: {
    total: number;
    types: {
      like: number;
      love: number;
      haha: number;
      lulu: number;
    };
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
  
  // Filter posts to only include those with media
  const postsWithMedia = posts.filter(post => {
    const isProfilePost = "createdAt" in post;
    
    const media = isProfilePost
      ? (post as ProfilePostData)?.media || []
      : (post as Post)?.media || [];
      
    return media.length > 0;
  });

  // Sort the posts by date (newest first)
  const sortedPosts = [...postsWithMedia].sort((a, b) => {
    // Get timestamps for both posts
    const aTimestamp = "createdAt" in a 
      ? (a as ProfilePostData).createdAt 
      : ("creationDate" in a && a.creationDate) 
        ? new Date(a.creationDate).getTime() / 1000 
        : 0;
    
    const bTimestamp = "createdAt" in b 
      ? (b as ProfilePostData).createdAt 
      : ("creationDate" in b && b.creationDate) 
        ? new Date(b.creationDate).getTime() / 1000 
        : 0;
    
    // Sort in descending order (newest first)
    return bTimestamp - aTimestamp;
  });

  if (sortedPosts.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 text-muted-foreground">
        No Posts
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {sortedPosts.map((post) => {
        // Determine if it's a ProfilePostData or a regular Post
        const isProfilePost = "createdAt" in post;

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

export default AllPosts;

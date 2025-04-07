// import { useNavigate } from "react-router-dom";
// import { ProfilePostData } from "../apis/apiTypes/response";
// import { POST_IMAGE } from "../constants/posts";
// import { Play } from "lucide-react";
// import { useRef, useEffect } from "react";

// // Default image to use when a post doesn't have an image
// const DEFAULT_POST_IMAGE = POST_IMAGE;

// interface Media {
//   url: string;
//   type: string;
// }

// interface Post {
//   id: number | string;
//   media: Media[];
//   creationDate?: string;
//   content?: string;
//   author?: {
//     name: string;
//     profilePic: string;
//   };
//   stats?: {
//     commentCount: number;
//     hasReacted: boolean;
//     reactionCount: number;
//     reactionType: string | null;
//   };
// }

// // For handling the actual post structure from API
// interface HomePostData {
//   _id: string;
//   author: string;
//   createdAt: number;
//   data: {
//     content: string;
//     media: Array<{
//       url: string;
//       type: string;
//     }> | null;
//   };
//   name: string;
//   profilePic: string;
//   avatar?: string;
//   commentCount: number;
//   reactionCount: number;
//   reaction: {
//     hasReacted: boolean;
//     reactionType: string | null;
//   };
// }

// interface AllPostsProps {
//   posts: (Post | ProfilePostData | HomePostData)[];
//   userId: string;
//   displayType?: 'images' | 'text';
// }

// const AllPosts: React.FC<AllPostsProps> = ({ posts, userId, displayType = 'images' }) => {
//   const navigate = useNavigate();

//   // Filter posts based on display type
//   const filteredPosts = posts.filter(post => {
//     // Determine post type
//     const isHomePost = '_id' in post && 'data' in post;
//     const isProfilePost = "createdAt" in post && !isHomePost;
    
//     // Get media based on post type
//     let hasMedia = false;
    
//     if (isHomePost) {
//       const homePost = post as HomePostData;
//       hasMedia = Boolean(homePost.data?.media && homePost.data.media.length > 0);
//     } else if (isProfilePost) {
//       const profilePost = post as ProfilePostData;
//       hasMedia = Boolean(profilePost.media && profilePost.media.length > 0);
//     } else {
//       const standardPost = post as Post;
//       hasMedia = Boolean(standardPost.media && standardPost.media.length > 0);
//     }
    
//     // For image display, return posts with media
//     // For text display, return posts without media
//     return displayType === 'images' ? hasMedia : !hasMedia;
//   });
  
//   if (displayType === 'images') {
//     return (
//       <div className="grid grid-cols-3 gap-1">
//         {filteredPosts.map((post) => {
//           // Determine post type
//           const isHomePost = '_id' in post && 'data' in post;
//           const isProfilePost = "createdAt" in post && !isHomePost;

//           // Extract post properties based on type
//           let postId;
//           let media;
//           let firstMedia;
//           let creationDate = "";
          
//           if (isHomePost) {
//             const homePost = post as HomePostData;
//             postId = homePost._id;
//             media = homePost.data?.media || [];
//             firstMedia = media[0];
//             creationDate = new Date(homePost.createdAt * 1000)
//               .toISOString()
//               .split("T")[0];
//           } else if (isProfilePost) {
//             const profilePost = post as ProfilePostData;
//             postId = profilePost.id;
//             media = profilePost.media || [];
//             firstMedia = media[0];
//             creationDate = new Date(profilePost.createdAt * 1000)
//               .toISOString()
//               .split("T")[0];
//           } else {
//             const standardPost = post as Post;
//             postId = standardPost.id;
//             media = standardPost.media || [];
//             firstMedia = media[0];
//             if (standardPost.creationDate) {
//               creationDate = standardPost.creationDate;
//             }
//           }

//           const feedId = `${postId}:${creationDate}`;
//           const postWithUserId = { ...post, userId };

//           return (
//             <div
//               key={postId.toString()}
//               className="aspect-square border overflow-hidden rounded-3xl m-1 cursor-pointer relative group"
//               onClick={() => {
//                 navigate(`/post/${feedId}`, { state: { post: postWithUserId } });
//               }}
//             >
//               {firstMedia?.type === "image" ? (
//                 <img
//                   src={firstMedia.url || DEFAULT_POST_IMAGE}
//                   alt={`Post ${postId}`}
//                   className="w-full h-full object-cover"
//                 />
//               ) : firstMedia?.type === "video" ? (
//                 <VideoThumbnail videoUrl={firstMedia.url} />
//               ) : (
//                 <img
//                   src={DEFAULT_POST_IMAGE}
//                   alt={`Post ${postId}`}
//                   className="w-full h-full object-cover"
//                 />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   } else {
//     // Text posts timeline view
//     return (
//       <div className="flex flex-col space-y-4">
//         {filteredPosts.map((post) => {
//           // Determine post type
//           const isHomePost = '_id' in post && 'data' in post;
//           const isProfilePost = "createdAt" in post && !isHomePost;

//           // Extract post properties based on type
//           let postId;
//           let content;
//           let creationDate = "";
//           let displayDate = "";
//           let authorName;
//           let authorProfilePic;
//           let commentCount = 0;
//           let reactionCount = 0;
          
//           if (isHomePost) {
//             const homePost = post as HomePostData;
//             postId = homePost._id;
//             content = homePost.data?.content || "";
//             authorName = homePost.name;
//             authorProfilePic = homePost.profilePic || homePost.avatar;
//             commentCount = homePost.commentCount;
//             reactionCount = homePost.reactionCount;
            
//             const timestamp = homePost.createdAt * 1000;
//             creationDate = new Date(timestamp).toISOString().split("T")[0];
//             displayDate = new Date(timestamp).toLocaleDateString(undefined, {
//               year: 'numeric',
//               month: 'short',
//               day: 'numeric'
//             });
//           } else if (isProfilePost) {
//             const profilePost = post as ProfilePostData;
//             postId = profilePost.id;
//             content = profilePost.content || "";
//             authorName = profilePost.author?.name || "";
//             authorProfilePic = profilePost.author?.profilePic || "";
//             commentCount = profilePost.stats?.commentCount || 0;
//             reactionCount = profilePost.stats?.reactionCount || 0;
            
//             const timestamp = profilePost.createdAt * 1000;
//             creationDate = new Date(timestamp).toISOString().split("T")[0];
//             displayDate = new Date(timestamp).toLocaleDateString(undefined, {
//               year: 'numeric',
//               month: 'short',
//               day: 'numeric'
//             });
//           } else {
//             const standardPost = post as Post;
//             postId = standardPost.id;
//             content = standardPost.content || "";
//             authorName = standardPost.author?.name || "";
//             authorProfilePic = standardPost.author?.profilePic || "";
//             commentCount = standardPost.stats?.commentCount || 0;
//             reactionCount = standardPost.stats?.reactionCount || 0;
            
//             if (standardPost.creationDate) {
//               creationDate = standardPost.creationDate;
//               displayDate = new Date(standardPost.creationDate).toLocaleDateString(undefined, {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//               });
//             }
//           }

//           const feedId = `${postId}:${creationDate}`;
//           const postWithUserId = { ...post, userId };

//           return (
//             <div
//               key={postId.toString()}
//               className="border rounded-xl p-4 cursor-pointer hover:bg-muted/10 transition-colors"
//               onClick={() => {
//                 navigate(`/post/${feedId}`, { state: { post: postWithUserId } });
//               }}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <img 
//                   src={authorProfilePic} 
//                   alt={authorName || "User"}
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//                 <div>
//                   <div className="font-medium text-sm">{authorName || "Unknown User"}</div>
//                   <div className="text-xs text-muted-foreground">{displayDate}</div>
//                 </div>
//               </div>
              
//               <p className="text-sm mb-3">{content}</p>
              
//               <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                 <span>{reactionCount} likes</span>
//                 <span>{commentCount} comments</span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   }
// };

// const VideoThumbnail: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const playPromiseRef = useRef<Promise<void> | null>(null);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     let isMounted = true;

//     const handleCanPlay = async () => {
//       if (!isMounted) return;

//       try {
//         video.currentTime = 0;
//         // Store the play promise
//         playPromiseRef.current = video.play();
//         await playPromiseRef.current;
//       } catch (err) {
//         if (err instanceof Error && err.name === "AbortError") {
//           // Ignore abort errors as they're expected when component unmounts
//           return;
//         }
//         console.error("Error playing video:", err);
//       }
//     };

//     const handleTimeUpdate = () => {
//       if (!isMounted) return;
//       if (video.currentTime >= 0.3) {
//         video.pause();
//       }
//     };

//     video.addEventListener("canplay", handleCanPlay);
//     video.addEventListener("timeupdate", handleTimeUpdate);

//     // Cleanup function
//     return () => {
//       isMounted = false;
//       video.removeEventListener("canplay", handleCanPlay);
//       video.removeEventListener("timeupdate", handleTimeUpdate);

//       // Cancel any pending play operation
//       if (playPromiseRef.current) {
//         playPromiseRef.current
//           .then(() => {
//             video.pause();
//             video.currentTime = 0;
//           })
//           .catch(() => {
//             // Ignore errors during cleanup
//           });
//       }
//     };
//   }, [videoUrl]);

//   return (
//     <div className="w-full h-full relative">
//       <video
//         ref={videoRef}
//         src={videoUrl}
//         className="w-full h-full object-cover"
//         playsInline
//         muted
//         loop={false}
//       />

//       {/* Play button overlay */}
//       <div className="absolute bottom-3 right-3 flex items-center justify-center bg-black/30">
//         <div className="bg-white/90 rounded-full p-2">
//           <Play className="w-3 h-3 text-black" strokeWidth={4} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllPosts;

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

        // console.log(JSON.stringify(post, null, 2));

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

import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { fetchHomepageData } from "@/apis/commonApiCalls/homepageApi";
import {
  HomepageResponse,
  HomePostData,
  StoryData,
} from "@/apis/apiTypes/response";
import { useApiCall } from "@/apis/globalCatchError";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostSkeleton } from "@/components/skeletons/PostSkeleton";
import { StoryRowSkeleton } from "@/components/skeletons/StorySkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw, ImageIcon, AlertCircle, Plus } from "lucide-react";
import { getSelfStories } from "@/apis/commonApiCalls/storyApi";
import { useAppSelector } from "@/store";
import { fetchUserProfile } from "@/apis/commonApiCalls/profileApi";
import { useAppDispatch } from "@/store";
import { updateCurrentUser } from "@/store/currentUserSlice";

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomePostData[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [selfStories, setSelfStories] = useState<StoryData | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [preloadedMedia, setPreloadedMedia] = useState<Set<string>>(new Set());
  const preloadContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.currentUser);
  const dispatch = useAppDispatch();

  // Use our custom hook for API calls
  const [executeFetchHomepageData, isLoading] = useApiCall(fetchHomepageData);
  const [executeGetSelfStories, isLoadingSelfStories] =
    useApiCall(getSelfStories);
  const [executeProfileFetch] = useApiCall(fetchUserProfile);

  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  // Load complete user profile data if needed
  useEffect(() => {
    const fetchCompleteUserProfile = async () => {
      // Only fetch if we have userId but missing user data
      if (
        currentUserId &&
        (!currentUser.interests?.length ||
          !currentUser.profilePic ||
          !currentUser.bio)
      ) {
        const result = await executeProfileFetch(currentUserId, currentUserId);

        if (result.success && result.data) {
          // Update Redux store with complete user data
          dispatch(
            updateCurrentUser({
              username: result.data.data.username,
              nickname: result.data.data.nickName,
              email: result.data.data.email,
              avatar: result.data.data.avatarSrc,
              profilePic: result.data.data.profilePic,
              bio: result.data.data.bio,
              interests: result.data.data.interests,
              privacyLevel: result.data.data.privacyLevel,
              userId: currentUserId,
            })
          );
        }
      }
    };

    fetchCompleteUserProfile();
  }, [currentUserId]);

  // Load initial data
  useEffect(() => {
    const loadHomepageData = async () => {
      // Fetch self stories first
      const selfStoriesResult = await executeGetSelfStories();
      if (selfStoriesResult.success && selfStoriesResult.data) {
        setSelfStories(selfStoriesResult.data);
      }

      // Then fetch homepage data
      const result = await executeFetchHomepageData(1);

      if (result.success && result.data) {
        const { postsData, storiesData } = result.data as HomepageResponse;

        setPosts(postsData.posts);

        // Sort stories to show users with unseen stories first
        const sortedStories = [...storiesData.stories].sort((a, b) => {
          // Check if user A has any unseen stories
          const aHasUnseenStories = a.stories.some((story) => story.seen === 0);
          // Check if user B has any unseen stories
          const bHasUnseenStories = b.stories.some((story) => story.seen === 0);

          if (aHasUnseenStories && !bHasUnseenStories) {
            return -1; // A comes first
          } else if (!aHasUnseenStories && bHasUnseenStories) {
            return 1; // B comes first
          } else {
            // If both have the same seen status, sort by latest story time
            return b.latestStoryTime - a.latestStoryTime;
          }
        });

        setStories(sortedStories);
        setHasMore(postsData.hasMore || false);
      } else {
        setError(result.data?.message || "Failed to load homepage data");
      }
    };

    loadHomepageData();
  }, []);

  // Preload all story media (images and videos)
  useEffect(() => {
    // Skip if still loading
    if (isLoading || isLoadingSelfStories) return;

    // Collect all media URLs that need to be preloaded
    const mediaUrls: { url: string; type: "image" | "video" }[] = [];

    // Add self stories to preload list
    if (selfStories && selfStories.stories) {
      selfStories.stories.forEach((story) => {
        if (story.url && !preloadedMedia.has(story.url)) {
          mediaUrls.push({
            url: story.url,
            type: story.contentType === "video" ? "video" : "image",
          });
        }
      });
    }

    // Add other users' stories to preload list
    stories.forEach((user) => {
      if (user.stories) {
        user.stories.forEach((story) => {
          if (story.url && !preloadedMedia.has(story.url)) {
            mediaUrls.push({
              url: story.url,
              type: story.contentType === "video" ? "video" : "image",
            });
          }
        });
      }
    });

    // If no new media to preload, return early
    if (mediaUrls.length === 0) return;

    // Create a div to hold preloaded media if it doesn't exist
    if (!preloadContainerRef.current) {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.width = "0";
      container.style.height = "0";
      container.style.overflow = "hidden";
      container.style.visibility = "hidden";
      document.body.appendChild(container);
      preloadContainerRef.current = container;
    }

    // Preload all media
    const newPreloadedUrls = new Set(preloadedMedia);

    mediaUrls.forEach(({ url, type }) => {
      if (type === "image") {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          console.log(`Preloaded image: ${url}`);
          newPreloadedUrls.add(url);
        };
        if (preloadContainerRef.current) {
          preloadContainerRef.current.appendChild(img);
        }
      } else {
        // Preload video by creating a video element and loading metadata
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.muted = true;
        video.onloadedmetadata = () => {
          console.log(`Preloaded video metadata: ${url}`);
          newPreloadedUrls.add(url);
          // Load a small portion of the video to speed up playback start
          video.currentTime = 0;
        };
        // This will trigger actual data loading
        video.load();
        if (preloadContainerRef.current) {
          preloadContainerRef.current.appendChild(video);
        }
      }
    });

    // Update the preloaded media set
    setPreloadedMedia(newPreloadedUrls);

    // Clean up function to remove the preload container
    return () => {
      if (
        preloadContainerRef.current &&
        preloadContainerRef.current.parentNode
      ) {
        preloadContainerRef.current.parentNode.removeChild(
          preloadContainerRef.current
        );
      }
    };
  }, [stories, selfStories, isLoading, isLoadingSelfStories]);

  // Function to load more posts
  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    const result = await executeFetchHomepageData(nextPage);

    if (result.success && result.data) {
      const { postsData } = result.data as HomepageResponse;

      setPosts((prev) => [...prev, ...postsData.posts]);
      setHasMore(postsData.hasMore || false);
      setPage(nextPage);
    }
  };

  // Use infinite scroll hook
  const lastPostElementRef = useInfiniteScroll({
    isLoading,
    hasMore,
    onLoadMore: loadMorePosts,
  });

  const handleLikeClick = (postId: string) => {
    // Update the posts array with the latest reaction data
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId || post.feedId === postId) {
        // Get the updated reaction from the API response
        // Since we don't have the new reaction details here yet,
        // we'll rely on the Post component's optimistic UI updates for now
        // The next API call to fetch posts will get the correct data
        return post;
      }
      return post;
    }));
  };

  const handleCommentClick = (postId: string, post: HomePostData) => {
    navigate(`/post/${postId}`, { state: { post } });
  };

  // Process post data to handle both regular and community posts
  const processPostData = (post: HomePostData) => {
    if (post.isCommunity) {
      // For community posts, adapt the data structure to match what Post component expects
      return {
        ...post,
        data: {
          content: post.content || "",
          media: post.mediaUrls
            ? post.mediaUrls.map((url) => ({
                url,
                type: url.toLowerCase().endsWith(".mp4") ? "video" : "image",
              }))
            : null,
        },
      };
    }
    return post;
  };
  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.feedId !== postId));
  };

  // Render error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load feed"
          description={error}
          actionLabel="Try Again"
          actionIcon={RefreshCw}
          onAction={() => window.location.reload()}
          className="my-8"
        />
      </div>
    );
  }

  useEffect(() => {
    console.log("currentUser: ", currentUser);
  }, [currentUser]);

  // Prepare stories for display - format self story only once
  const formattedSelfStory = selfStories
    ? {
        user: "Your Story",
        userId: currentUserId || "",
        avatar: currentUser.avatar || "/profile/avatars/1.png",
        isLive: false,
        hasStory: selfStories.stories && selfStories.stories.length > 0,
        stories: selfStories.stories || [],
        latestStoryTime: selfStories.latestStoryTime || Date.now(),
        name: "Your Story",
        profilePic: currentUser.profilePic || "/profile/avatars/1.png",
      }
    : null;

  // Format all stories for the StoryPage component
  const allFormattedStories = [
    ...(formattedSelfStory ? [formattedSelfStory] : []),
    ...stories.map((story) => ({
      user: story.name,
      userId: story.userId,
      avatar: story.profilePic,
      isLive: story.isLive,
      hasStory: story.hasStory,
      stories: story.stories,
      latestStoryTime: story.latestStoryTime,
      name: story.name,
      profilePic: story.profilePic,
    })),
  ].filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto bg-background">
      {/* Stories Section */}
      {isLoading || isLoadingSelfStories ? (
        <StoryRowSkeleton />
      ) : (
        <div className="mb-2 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {/* Self Story */}
            <div className="relative">
              {formattedSelfStory &&
              formattedSelfStory.stories &&
              formattedSelfStory.stories.length > 0 ? (
                <Story
                  key="self-story"
                  user={formattedSelfStory.user}
                  userId={formattedSelfStory.userId}
                  avatar={formattedSelfStory.avatar}
                  profilePic={formattedSelfStory.profilePic}
                  isLive={formattedSelfStory.isLive}
                  hasStory={formattedSelfStory.hasStory}
                  stories={formattedSelfStory.stories}
                  latestStoryTime={formattedSelfStory.latestStoryTime}
                  allStories={allFormattedStories}
                  storyIndex={0}
                />
              ) : (
                <div className="flex flex-col items-center space-y-1 mx-2 my-1">
                  <div className="relative w-16 h-16 rounded-full ring-2 ring-muted">
                    <img
                      src={currentUser.profilePic || "/profile/avatars/1.png"}
                      alt="Your Story"
                      className="w-full h-full rounded-full object-cover p-[2px] bg-background"
                    />
                    <button
                      onClick={() => navigate('/create-story')}
                      className="absolute cursor-pointer -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors duration-200 border-2 border-background"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Your Story
                  </span>
                </div>
              )}
            </div>
            {/* Other Stories */}
            {stories.map((story, index) => (
              <Story
                key={`story-${story.userId || index}`}
                user={story.name}
                userId={story.userId}
                avatar={story.profilePic}
                isLive={story.isLive}
                hasStory={story.hasStory}
                stories={story.stories}
                latestStoryTime={story.latestStoryTime}
                allStories={allFormattedStories}
                storyIndex={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {isLoading || isLoadingSelfStories ? (
        <div className="py-4">
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        posts.map((post, index) => {
          const processedPost = processPostData(post);
          return (
            <div
              key={`post-${post._id || index}`}
              ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            >
              <Post
                user={post.name}
                avatar={post.profilePic}
                userId={post.isCommunity ? post.communityId || "" : post.userId}
                caption={processedPost.data.content}
                media={processedPost.data.media || []}
                image={
                  processedPost.data.media &&
                  processedPost.data.media.length > 0
                    ? processedPost.data.media[0].url
                    : undefined
                }
                likes={post.reactionCount}
                comments={post.commentCount}
                datePosted={post.ago_time}
                isOwner={currentUserId === post.userId}
                onCommentClick={() =>
                  handleCommentClick(post.feedId, processedPost)
                }
                onLikeClick={() => handleLikeClick(post._id)}
                feedId={post.feedId}
                isLiked={post.reaction?.hasReacted}
                reactionType={post.reaction?.reactionType}
                reactionDetails={post.reactionDetails}
                reaction={post.reaction}
                onDelete={handlePostDelete}
              />
            </div>
          );
        })
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No Posts Yet"
          description="There are no posts in your feed right now. Follow more people to see their posts here."
          className="my-8"
        />
      )}

      {/* End of content message */}
      {!hasMore && posts.length > 0 && !isLoading && !isLoadingSelfStories && (
        <div className="text-center py-6 mb-4 text-muted-foreground border-t border-border">
          <p className="text-sm font-medium">You're all caught up</p>
          <p className="text-xs">No more posts to load</p>
        </div>
      )}
    </div>
  );
}

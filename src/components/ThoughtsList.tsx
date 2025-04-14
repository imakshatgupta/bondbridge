import { useNavigate } from "react-router-dom";
import { ProfilePostData } from "../apis/apiTypes/response";
import ThreeDotsMenu, { ReportMenuItem } from "./global/ThreeDotsMenu";
import { MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SharePostPage from "./SharePostPage";
import { ReportModal } from './ReportModal';
import ReactionComponent from "./global/ReactionComponent";

// Helper function to format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;

  if (secondsAgo < 60) return `${secondsAgo}s`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)}w`;
  return `${Math.floor(secondsAgo / 2592000)}mo`;
};

interface Post {
  id: number | string;
  media: Array<{
    url: string;
    type: string;
  }>;
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
  reactionDetails?: {
    total: number;
    types: {
      [key: string]: number;
    };
  };
}

interface ThoughtsListProps {
  posts: (Post | ProfilePostData)[];
  userId: string;
}

const ThoughtsList: React.FC<ThoughtsListProps> = ({ posts, userId }) => {
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState<Record<string, boolean>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('userId') || '';
  
  // Filter posts with no media
  const thoughtPosts = posts.filter(post => {
    const isProfilePost = "createdAt" in post;
    
    const media = isProfilePost
      ? (post as ProfilePostData)?.media || []
      : (post as Post)?.media || [];
      
    return media.length === 0;
  });
  
  // Sort posts from recent to oldest
  const sortedThoughtPosts = [...thoughtPosts].sort((a, b) => {
    const timestampA = "createdAt" in a ? (a as ProfilePostData).createdAt : 0;
    const timestampB = "createdAt" in b ? (b as ProfilePostData).createdAt : 0;
    return timestampB - timestampA; // Descending order (newest first)
  });
  
  if (sortedThoughtPosts.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 text-muted-foreground">
        No Quotes
      </div>
    );
  }

  // Handle share button click
  const handleShareClick = (postId: string) => {
    setShareDialogOpen(prev => ({
      ...prev,
      [postId]: true
    }));
  };

  const handleReportClick = (feedId: string) => {
    setSelectedPostId(feedId);
    setIsReportModalOpen(true);
  };

  // Check if the current user is viewing their own profile
  const isOwnProfile = userId === currentUserId;

  // Initialize reaction counts for posts
  const getReactionCounts = (post: Post | ProfilePostData) => {
    const isProfilePost = "createdAt" in post;
    let reactionTypes = { like: 0, love: 0, haha: 0, lulu: 0 };
    
    if (isProfilePost) {
      const profilePost = post as ProfilePostData;
      if (profilePost.reactionDetails && typeof profilePost.reactionDetails === 'object') {
        const types = profilePost.reactionDetails.types || {};
        reactionTypes = {
          like: types.like || 0,
          love: types.love || 0,
          haha: types.haha || 0,
          lulu: types.lulu || 0
        };
      }
    } else {
      const regularPost = post as Post;
      if (regularPost.reactionDetails && typeof regularPost.reactionDetails === 'object') {
        const types = regularPost.reactionDetails.types || {};
        reactionTypes = {
          like: types.like || 0,
          love: types.love || 0,
          haha: types.haha || 0,
          lulu: types.lulu || 0
        };
      }
    }
    
    return reactionTypes;
  };

  return (
    <div className="flex flex-col space-y-4">
      {sortedThoughtPosts.map((post) => {
        // Determine if it's a ProfilePostData or a regular Post
        const isProfilePost = "createdAt" in post;
        
        // Extract post properties based on type
        const postId = isProfilePost
          ? (post as ProfilePostData).id
          : (post as Post).id;
          
        const content = isProfilePost
          ? (post as ProfilePostData).content
          : (post as Post).content || "";
          
        const authorName = isProfilePost
          ? (post as ProfilePostData).author?.name
          : (post as Post).author?.name || "";
          
        const authorProfilePic = isProfilePost
          ? (post as ProfilePostData).author?.profilePic
          : (post as Post).author?.profilePic || "";
          
        const commentCount = isProfilePost
          ? (post as ProfilePostData).stats?.commentCount || 0
          : (post as Post).stats?.commentCount || 0;
          
        const reactionCount = isProfilePost
          ? (post as ProfilePostData).stats?.reactionCount || 0
          : (post as Post).stats?.reactionCount || 0;
          
        const timestamp = isProfilePost
          ? (post as ProfilePostData).createdAt
          : 0;
          
        const timeAgo = isProfilePost ? formatTimeAgo(timestamp) : "";
        
        // Get reaction information
        const hasReacted = isProfilePost
          ? (post as ProfilePostData).stats?.hasReacted || false
          : (post as Post).stats?.hasReacted || false;
          
        const reactionType = isProfilePost
          ? (post as ProfilePostData).stats?.reactionType || null
          : (post as Post).stats?.reactionType || null;
        
        // Create feedId for navigation
        let creationDate = "2025-03-16";

        if (isProfilePost) {
          creationDate = new Date((post as ProfilePostData)?.createdAt * 1000)
            .toISOString()
            .split("T")[0];
        } else if ("creationDate" in post && post?.creationDate) {
          creationDate = post?.creationDate;
        }

        const feedId = `${postId}:${creationDate}`;
        const postWithUserId = { ...post, userId };
        
        // Menu items for the three dots menu
        const menuItems = [
          {
            ...ReportMenuItem,
            onClick: () => handleReportClick(feedId)
          }
        ];

        const postIdStr = postId.toString();

        return (
          <div key={postIdStr} className="border-b border-border pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={authorProfilePic || "/avatar.png"}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-row gap-3 items-center">
                  <div className="font-semibold">{authorName}</div>
                  <div className="text-sm text-muted-foreground">{timeAgo}</div>
                </div>
              </div>
              {!isOwnProfile && <ThreeDotsMenu items={menuItems} />}
            </div>
            
            <div 
              className="my-4 cursor-pointer"
              onClick={() => navigate(`/post/${feedId}`, { state: { post: postWithUserId } })}
            >
              <p className="text-foreground">{content}</p>
              {content.length > 100 && (
                <span className="text-primary cursor-pointer">Read more</span>
              )}
            </div>
            
            <div className="flex items-center gap-6 mt-2">
              <button 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => navigate(`/post/${feedId}`, { state: { post: postWithUserId } })}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{commentCount}</span>
              </button>

              <ReactionComponent 
                entityId={feedId}
                entityType="feed"
                initialReaction={{ hasReacted, reactionType }}
                initialTotalCount={reactionCount}
                initialReactionCounts={getReactionCounts(post)}
                onReactionChange={() => {}}
              />

              <button 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => handleShareClick(postIdStr)}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen[postIdStr] || false} onOpenChange={(open) => {
              setShareDialogOpen(prev => ({
                ...prev,
                [postIdStr]: open
              }));
            }}>
              <DialogContent className="sm:max-w-md h-[80vh]">
                <SharePostPage
                  postData={{
                    _id: feedId,
                    author: userId,
                    data: {
                      content: content,
                      media: []
                    },
                    feedId: feedId,
                    name: authorName
                  }}
                  onClose={() => setShareDialogOpen(prev => ({
                    ...prev,
                    [postIdStr]: false
                  }))}
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      })}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId || ''}
        reporterId={currentUserId}
      />
    </div>
  );
};

export default ThoughtsList; 
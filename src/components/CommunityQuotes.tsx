import { useNavigate } from "react-router-dom";
import ThreeDotsMenu, { ReportMenuItem } from "./global/ThreeDotsMenu";
import { MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SharePostPage from "./SharePostPage";
import { ReportModal } from './ReportModal';
import { CommunityPostData } from "@/apis/apiTypes/communitiesTypes";
import ReactionComponent from "./global/ReactionComponent";
import { getRelativeTime } from "@/lib/utils";

interface CommunityQuotesProps {
  posts: CommunityPostData[];
  communityId: string;
}

const CommunityQuotes: React.FC<CommunityQuotesProps> = ({ posts, communityId }) => {
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState<Record<string, boolean>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('userId') || '';
  
  // Filter posts with no media
  const thoughtPosts = posts.filter(post => {
    const media = post?.media || [];
    return media.length === 0;
  });
  
  // Sort posts from recent to oldest
  const sortedThoughtPosts = [...thoughtPosts].sort((a, b) => {
    const timestampA = a.createdAt || 0;
    const timestampB = b.createdAt || 0;
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

  const handleReportClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsReportModalOpen(true);
  };

  // Check if the current user is viewing their own profile
  const isOwnProfile = communityId === currentUserId;

  return (
    <div className="flex flex-col space-y-4">
      {sortedThoughtPosts.map((post) => {
        // Extract post properties
        const postId = post.id;
        const content = post.content || "";
        const authorName = post.author?.name || "";
        const authorProfilePic = post.author?.profilePic || "";
        const commentCount = post.stats?.commentCount || 0;
        const timestamp = post.createdAt || 0;
        const timeAgo = getRelativeTime(new Date(timestamp).toISOString());
        
        const postIdStr = postId.toString();
        
        // Menu items for the three dots menu
        const menuItems = [
          {
            ...ReportMenuItem,
            onClick: () => handleReportClick(postIdStr)
          }
        ];

        return (
          <div 
            key={postIdStr} 
            className="border-b border-border pb-4"
            data-post-id={postIdStr} // Add data attribute for potential custom event handling
          >
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
              className="mt-1 py-4 cursor-pointer"
              onClick={() => navigate(`/community/${communityId}/${postIdStr}`, { 
                state: { 
                  post: {
                    ...post,
                    communityId
                  } 
                } 
              })}
            >
              <p className="text-foreground">{content}</p>
              {content.length > 100 && (
                <span className="text-primary cursor-pointer">Read more</span>
              )}
            </div>
            
            <div className="flex items-center gap-6 mt-2">
              <button 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => navigate(`/community/${communityId}/${postIdStr}`, { 
                  state: { 
                    post: {
                      ...post,
                      communityId
                    } 
                  } 
                })}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{commentCount}</span>
              </button>

              {/* Add ReactionComponent for reactions */}
              <ReactionComponent 
                entityId={postIdStr}
                entityType="feed"
                initialReaction={{ 
                  hasReacted: post.stats?.hasReacted || false, 
                  reactionType: post.stats?.reactionType || null 
                }}
                initialTotalCount={post.stats?.reactionCount || 0}
                initialReactionCounts={post.reactionDetails?.types || {
                  like: 0,
                  love: 0,
                  haha: 0,
                  lulu: 0
                }}
                isCommunity={true}
                communityId={communityId}
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
                    _id: postIdStr,
                    author: communityId,
                    data: {
                      content: content,
                      media: []
                    },
                    feedId: postIdStr,
                    isCommunity: true,
                    communityId: communityId,
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

export default CommunityQuotes; 
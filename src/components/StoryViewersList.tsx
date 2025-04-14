import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryViewer } from '@/apis/commonApiCalls/storyApi';

interface StoryViewersListProps {
  viewers: StoryViewer[];
  isLoading: boolean;
  onClose: () => void;
}

export default function StoryViewersList({ viewers, isLoading, onClose }: StoryViewersListProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      className="absolute inset-0 bg-background z-20 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-border flex items-center">
        <button 
          className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer mr-1"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="font-medium">Viewers</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading viewers...</p>
          </div>
        ) : !Array.isArray(viewers) || viewers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Eye className="h-12 w-12 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground">No one has viewed this story yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {viewers.map((viewer) => (
              <div 
                key={viewer.userId || Math.random().toString(36).substring(7)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${viewer.userId}`)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={viewer.profilePic || ''} />
                  <AvatarFallback>{viewer.name ? viewer.name.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{viewer.name || 'Unknown User'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
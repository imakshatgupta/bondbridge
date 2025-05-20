import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreatePost from './CreatePost';
import { updatePost } from '@/apis/commonApiCalls/createPostApi';
import { editCommunityPost } from '@/apis/commonApiCalls/communitiesApi';
import { useApiCall } from '@/apis/globalCatchError';
import { toast } from 'sonner';
import { CroppedFile } from '@/components/MediaCropModal';
import { MediaItem, PostData, UpdatePostParams } from '@/constants/posts';

const EditPost = ({ communityPost = false }: { communityPost?: boolean }) => {
  const navigate = useNavigate();
  const { communityId, postId } = useParams<{ communityId: string, postId: string }>();
  const location = useLocation();
  const [initialContent, setInitialContent] = useState<string>('');
  const [initialMedia, setInitialMedia] = useState<CroppedFile[]>([]);
  const isAnonymous = location.state?.isAnonymous || false;
  const [isLoading, setIsLoading] = useState(true);
  const [executeUpdatePost] = useApiCall(updatePost);
  const [executeEditCommunityPost] = useApiCall(editCommunityPost);

  useEffect(() => {
    // Check if we have location state with post data
    if (location.state) {
      // Handle caption if present, otherwise use empty string
      setInitialContent(location.state.caption || '');
      
      console.log('Location state media:', location.state.media);
      
      // Handle media if present
      if (location.state.media && location.state.media.length > 0) {
        try {
          // Convert media objects to CroppedFile format
          const mediaFiles = location.state.media.map((item: MediaItem) => {
            // Create properties based on file type (image or video)
            const isVideo = item.type === 'video';
            
            console.log(`Processing media item: ${item.url}, type: ${item.type}, isVideo: ${isVideo}`);
            
            // Create a file-like object that matches CroppedFile interface
            const mediaFile = {
              previewUrl: item.url, // Store the URL in previewUrl property
              type: isVideo ? 'video/mp4' : 'image/jpeg', // Default MIME types
              name: item.url.split('/').pop() || 'media-file',
              size: 0, // Size won't be known from URL
              lastModified: Date.now(),
              // Add minimal File interface implementation
              slice: () => new Blob(),
              stream: () => new ReadableStream(),
              text: () => Promise.resolve(''),
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
            } as unknown as CroppedFile;
            
            console.log('Created media file:', mediaFile);
            
            return mediaFile;
          });

          console.log('Processed media files:', mediaFiles);
          setInitialMedia(mediaFiles);
        } catch (error) {
          console.error('Error processing media files:', error);
          toast.error('Failed to load media files');
        }
      }
      
      setIsLoading(false);
    } else if (postId) {
      // If no state is available, we could fetch the post data here
      toast.error('Post data not found');
      navigate(-1);
    } else {
      // No postId and no state
      toast.error('Invalid post');
      // navigate(-1);
    }
  }, [location.state, postId, navigate]);

  const handleSubmit = async (postData: PostData) => {
    try {
      if (!postId) {
        toast.error('Post ID is missing');
        return;
      }

      let result: { success: boolean; message?: string };

      if (communityPost) {
        if (!communityId) {
          toast.error('Community ID is missing for community post edit');
          return;
        }
        // Call the community post edit function
        result = await executeEditCommunityPost(communityId, postId, postData.content);
      } else {
        // Call the regular post edit function
        const updateParams: UpdatePostParams = {
          postId,
          content: postData.content
        };
        result = await executeUpdatePost(updateParams);
      }
      
      if (result.success) {
        toast.success('Post updated successfully!');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center">Loading Post...</div>;
  }

  return (
    <div>
      <CreatePost
        uploadMedia={false} // Don't allow new media uploads since API doesn't support it
        submitButtonText="Update"
        submitHandler={handleSubmit}
        initialContent={initialContent}
        initialMediaFiles={initialMedia}
        postId={postId}
        isAnonymousEditing={isAnonymous}
        onCancel={handleCancel}
        readOnlyMedia={true} // This flag will indicate media should be displayed but not editable
      />
    </div>
  );
};

export default EditPost; 
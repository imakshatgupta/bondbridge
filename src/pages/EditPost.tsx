import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreatePost from './CreatePost';
import { updatePost } from '@/apis/commonApiCalls/createPostApi';
import { useApiCall } from '@/apis/globalCatchError';
import { toast } from 'sonner';

const EditPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const [initialContent, setInitialContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [executeUpdatePost] = useApiCall(updatePost);

  useEffect(() => {
    // Get the post data from location state
    if (location.state?.caption) {
      setInitialContent(location.state.caption);
      setIsLoading(false);
    } else if (postId) {
      // If caption is not in state, we could fetch the post data here
      // For now, we'll just handle the case where we have the caption in state
      toast.error('Post data not found');
      navigate(-1);
    }
  }, [location.state, postId, navigate]);

  const handleSubmit = async (postData: any) => {
    try {
      if (!postId) {
        toast.error('Post ID is missing');
        return;
      }

      const result = await executeUpdatePost({
        postId,
        content: postData.content
      });
      
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
    return <div className="p-6 flex justify-center">Loading post...</div>;
  }

  return (
    <div>
      <CreatePost
        uploadMedia={false}
        submitButtonText="Update"
        submitHandler={handleSubmit}
        initialContent={initialContent}
        postId={postId}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditPost; 
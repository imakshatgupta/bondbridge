import { useNavigate } from 'react-router-dom';
import { ProfilePostData } from '../apis/apiTypes/response';
import { POST_IMAGE } from '../constants/posts';

// Default image to use when a post doesn't have an image
const DEFAULT_POST_IMAGE = POST_IMAGE;

interface Post {
  id: number | string;
  imageSrc?: string;
  creationDate?: string; // Optional creation date
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
}


const AllPosts: React.FC<AllPostsProps> = ({ posts }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map(post => {
        // Determine if it's a ProfilePostData or a regular Post
        const isProfilePost = 'createdAt' in post;
        
        // Extract the properties based on the type
        const postId = isProfilePost 
          ? (post as ProfilePostData).id 
          : (post as Post).id;
        
        const postImageSrc = isProfilePost
          ? (post as ProfilePostData)?.imageSrc
          : (post as Post)?.imageSrc;
        
        // Create feedId using post.id and creationDate
        let creationDate = '2025-03-16';
        
        if (isProfilePost) {
          // For ProfilePostData use the createdAt timestamp
          creationDate = new Date((post as ProfilePostData)?.createdAt * 1000)
            .toISOString().split('T')[0];
        } else if ('creationDate' in post && post?.creationDate) {
          creationDate = post?.creationDate;
        }
        
        const feedId = `${postId}:${creationDate}`;
        
        return (
          <div 
            key={postId.toString()} 
            className="aspect-square overflow-hidden rounded-3xl m-1 cursor-pointer" 
            onClick={() => {
              navigate(`/post/${feedId}`, { state: { post } });
            }}
          >
            <img 
              src={postImageSrc && postImageSrc.trim() !== '' ? postImageSrc : DEFAULT_POST_IMAGE} 
              alt={`Post ${postId}`} 
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
};

export default AllPosts; 
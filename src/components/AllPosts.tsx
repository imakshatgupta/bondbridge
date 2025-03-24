import { useNavigate } from 'react-router-dom';
import { ProfilePostData } from '../apis/apiTypes/response';

// Default image to use when a post doesn't have an image
const DEFAULT_POST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAANlBMVEX///+/v7+8vLzKysr8/Pzg4ODFxcXb29vT09Pj4+P4+PjBwcH6+vry8vLY2NjIyMjs7Ozo6Oia8u11AAAEdUlEQVR4nO2d65bqIAxGp/Smrb34/i971KqlEC7FGuJZ3/7dKewJBgK4/PsDAAAAAAAAAAAAAAAA4KUam5+i3m94UsUPoVoYwlA6MIShfGAIQ/nAEIbyOcBQSeNww9NZGOXBhuq8+w1fxugfDG1gmB0YBoFhdmAYBIbZgWEQGGYHhkFgmB0YBoFhdmAYBIbZyWB4qVI6mgyv4WUeH7u007lL7vFeWA3n8rUFrZqWK5KchnWvPapOTGFkNDQPOJrhk45Hw2d4Ns+oVPlRz2NhMxyawkTtv2OWAJvhSBwzfjBO2+g/5TLs7BDeSF4eDP0Y+yiX4UydFKtT4pRxa3SKTcVchtQgLYrobhq0Kj7+XIb0aX+fZtipHfH/ScPlZZG5Jq9hk2RYP96lTnFPcxnWpGF52d2eNrPGPc5lOJC5NDrl65Sv1fs16nEuw8v20sdCP+9uTh8NZVSuYVvTnKlBmjAdaqu/uH8Qm2FVWuNUJYSwOu3tLV9tcelNw5SF9yZjRaVixvpwbrZRTKnyuyKysRXOGn/QBqpK25QzptVm9598eyfqXDaPnah+GlNmwr/aGOcqYl3DvJtYzXU7jvU1bbVmVdExE+pP7Qjb6TiiOBFmOPuyD7XyC+djWYadGt2KxE5PzMpWluHtXc6KQZ/rNYK5RpThfWXnrGzp6iRcQ0ky7KbHK+iBup3rtQZD6wZJhq+9HDIsri89BBsUZPguIal0Y871K6ECRY6hXkFaimQeXQjVUHIMNwWkuVax5/q1xcC6Rozh0G+7vYmidaqzCaJ/whBjaEZJr608Y7QIHvBIMbR3/dfB55jr3/hrKCGGxMHN+vmi53rtSW+uEWLYUj1/dsY1169tetc1MgwHaw9HU3TN9Svec0huw4os6CZHcO7dcc/163O+XMNteC0JRfdk0Aby6BNfDcW9i1EquzedI4R36vAYLfy5htnwtnBRvaHo/SZxjN8Nz7UO5ltf97WnMgbqHCfhRbmHKa/hdXl2qxjzQQsaunMNr+FzUlD62W8bORD9TM4gshpe3xVg+Z7BonJlmN55mMhpWGkV4GughtacsbgvLnAa6hXga6B666I9OGsoRsPtMbCa7l2q6OVaAs6uMxpejXDdd+SPSTMP+vyGdri6+bAQui8u8BmaIbwxUdcXkg0dNRTjOf6BNiSOGirrXYxjcXQ+632ag6EPE7kMiU/h4dA1FJfhgUnTzZTRkCOEt8apYcpj+P1E6u4+j+H3E+kCdUmKxZAjkS4QrbMY8nwKC7qGYjFkSaQL9rqGw5AthORhIoMhUyJ9ksPwsDI+Brv97xtWY8mJNUwZYtixYu0qyjhd+yYwDALD7MAwCAyzA8MgMMwODIPAMDtHGxZ1JYvjDRvWajCC7SYRfhsBhvKBIQzlA0MYygeGMJQPDGEoHxjCUD4whKF8YAhD+cAQhvKBIQzlA0MYygeGMJQPDGEoHxjCUD4whKF8YAhD+cAQhvJJM/wpEgyv9U+R8iNaAAAAAAAAAAAAAAAAAP4r/gEYCYE2Xwz6DQAAAABJRU5ErkJggg==';

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
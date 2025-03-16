import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  imageSrc: string;
}

interface AllPostsProps {
  posts: Post[];
}

const AllPosts: React.FC<AllPostsProps> = ({ posts }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map(post => (
        <div key={post.id} className="aspect-square overflow-hidden rounded-3xl m-1 cursor-pointer" onClick={() => {
          navigate(`/post/${post.id}`, { state: { post } });
        }}>
          <img src={post.imageSrc} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

export default AllPosts; 
import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import avatarImage from "@/assets/avatar.png";
import { useNavigate } from "react-router-dom";


const StoryData = [
  { id: 1, user: "name one", avatar: avatarImage, isLive: true },
  { id: 2, user: "name two", avatar: avatarImage, isLive: false },
  { id: 3, user: "name three", avatar: avatarImage, isLive: false },
  { id: 4, user: "name four", avatar: avatarImage, isLive: false },
];

const PostsData = [
  {
    id: 1,
    user: "John Doe",
    avatar: avatarImage,
    postDate: "2024-03-21",
    caption: "Hello world!",
    image: avatarImage,
    likes: 210,
    comments: 32,
    datePosted: "2 days ago"
  },
  {
    id: 2,
    user: "Jane Smith",
    avatar: avatarImage,
    postDate: "2024-03-22",
    caption: "Beautiful day outside!",
    image: avatarImage,
    likes: 145,
    comments: 18,
    datePosted: "1 day ago"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  
  const handleCommentClick = (postId: number) => {
    navigate(`/comments/${postId}`);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories Section */}
      <div className="mb-2 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {StoryData.map((story) => (
            <Story
              key={story.id}
              user={story.user}
              avatar={story.avatar}
              isLive={story.isLive}
            />
          ))}
        </div>
      </div>

      {/* Posts Section */}
      {PostsData.map((post) => (
        <Post 
          key={post.id}
          user={post.user}
          avatar={post.avatar}
          postDate={post.postDate}
          caption={post.caption}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
          datePosted={post.datePosted}
          onCommentClick={() => handleCommentClick(post.id)}
        />
      ))}
    </div>
  );
}



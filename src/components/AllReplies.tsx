interface Reply {
  id: number;
  text: string;
  author: string;
}

interface AllRepliesProps {
  replies: Reply[];
}

const AllReplies: React.FC<AllRepliesProps> = ({ replies }) => {
  return (
    <div className="space-y-4">
      {replies.map(reply => (
        <div key={reply.id} className="p-3 border rounded-lg">
          <div className="font-medium mb-1">@{reply.author}</div>
          <p className="text-foreground">{reply.text}</p>
        </div>
      ))}
    </div>
  );
};

export default AllReplies; 
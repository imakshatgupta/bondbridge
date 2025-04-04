import { Person } from "@/apis/apiTypes/response";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
// import { sendFriendRequest } from "@/apis/commonApiCalls/friendRequestApi";
// import { useState } from "react";
// import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TruncatedText } from "./ui/TruncatedText";
import { Badge } from "./ui/badge";
import { UserPlus, Eye } from "lucide-react";

// Sample interests for demo purposes - in a real app, these would come from the user profile
const DEMO_INTERESTS = [
  "Technology", "Design", "Marketing", "Finance", "Healthcare", "Education"
];
  
type Props = {
  person: Person;
};

const SearchResults = ({ person }: Props) => {
  // const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // const handleSendFriendRequest = async () => {
  //   try {
  //     setIsLoading(true);
  //     await sendFriendRequest({ userId: person.id });
  //     toast.success(`Friend request sent to ${person.name}`);
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : "Failed to send friend request");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Randomly select 1-3 interests for demo purposes
  const randomInterests = () => {
    const shuffled = [...DEMO_INTERESTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
  };
  
  const interests = randomInterests();
  
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-accent/50 transition-all duration-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <img 
            src={person.profilePic || person.avatar} 
            alt={person.name} 
            className="h-12 w-12 rounded-full object-cover"
          />
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-medium">{person.name}</h3>
          <TruncatedText 
            text={person.bio} 
            limit={65}
            className="text-sm text-muted-foreground"
            showToggle={false}
          />
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {interests.map((interest, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-auto mt-2 sm:mt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary border-primary/50 hover:bg-primary/10 hover:text-primary"
          onClick={() => handleProfileClick(person.id)}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
        <Button 
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <UserPlus className="mr-1 h-4 w-4" />
          Connect
        </Button>
      </div>
    </div>
  );
};

export default SearchResults;

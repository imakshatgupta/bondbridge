import { Person } from "@/apis/apiTypes/response";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
// import { sendFriendRequest } from "@/apis/commonApiCalls/friendRequestApi";
// import { useState } from "react";
// import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
  
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
  return (
    <div
      key={person.id}
      className="flex items-center justify-between p-4 hover:bg-accent rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <img src={person.avatar} alt={person.name} />
        </Avatar>
        <div>
          <h3 className="font-medium">{person.name}</h3>
          <p className="text-sm text-muted-foreground">
            {person.bio && person.bio.length > 65  
              ? `${person.bio.substring(0, 65 )}...` 
              : person.bio}
          </p>
        </div>
      </div>
      <div className="flex gap-2 ">
        <Button variant="outline" className="text-primary border-primary cursor-pointer"  onClick={() => handleProfileClick(person.id)}>
          View Profile
        </Button>
        {/* <Button 
          className="bg-primary hover:bg-primary/90 cursor-pointer"
          onClick={handleSendFriendRequest}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Follow"}
        </Button> */}
      </div>
    </div>
  );
};

export default SearchResults;

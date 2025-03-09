import { Button } from "../ui/button";


type Props = {
    avatar: string;
    name: string;
    bio: string;
    requestId: number;
  }
  
  const FriendRequest = ({ avatar, name, bio }: Props) => {
      
    return (
      <div className="flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer">
        <div className="w-12 h-12">
          <img 
            src={avatar} 
            alt="User avatar" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-xl text-foreground">{name}</h3>
          <p className="text-muted-foreground">{bio}</p>
        </div>
        <div className="flex gap-2">
            <Button className="">
                Accept
            </Button>
            <Button variant={'outline'} className="border-primary text-primary">
                Decline
            </Button>
        </div>
      </div>
    )
  }
  
  export default FriendRequest
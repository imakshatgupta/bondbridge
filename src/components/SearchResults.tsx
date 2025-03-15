import { Person } from "@/apis/commonApiCalls/searchApi";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";

type Props = {
  person: Person;
};

const SearchResults = ({ person }: Props) => {
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
          <p className="text-sm text-muted-foreground">{person.bio}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="text-primary border-primary cursor-pointer">
          View Profile
        </Button>
        <Button className="bg-primary hover:bg-primary/90 cursor-pointer">Follow</Button>
      </div>
    </div>
  );
};

export default SearchResults;

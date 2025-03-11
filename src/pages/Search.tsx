import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import SearchResults from "@/components/SearchResults";

export interface Person {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

// API call
const searchPeople = async (query: string): Promise<Person[]> => {
  if (!query.trim()) return [];

  // Mock data
  const mockUsers: Person[] = [
    {
      id: "1",
      name: "John Doe",
      bio: "Software Engineer @ Google",
      avatar: "/profile/user.png",
    },
    {
      id: "2",
      name: "Jane Smith",
      bio: "Product Manager @ Microsoft",
      avatar: "/profile/user.png",
    },
    {
      id: "3",
      name: "Mike Johnson",
      bio: "UI Designer @ Apple",
      avatar: "/profile/user.png",
    },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter mock data based on query
  return mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.bio.toLowerCase().includes(query.toLowerCase())
  );

  /* Commented out actual API call
  try {
    const response = await axios.post(
      "http://localhost:3000/api/search",
      {
        searchString: query,
      },
      {
        headers: {
          token:
            "8Wg9B601p7BFwWCsl6sUmGhtpnRjYAXEgfnrUA78umKfbOcft5rsCfZ5QYnRlGB1",
          userid: "67d02bbc61192a1a4e8b99fc",
        },
      }
    );

    return response.data.users;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
  */
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!searchQuery.trim()) {
        setPeople([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchPeople(searchQuery);
        setPeople(results);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPeople();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const history = [
    "Software Engineers",
    "Product Managers",
    "UI Designers",
    "Data Scientists",
  ];

  return (
    <div className="max-w-2xl mx-auto bg-background min-h-screen p-4">
      <div className="sticky top-0 bg-background pb-4">
        {/* Search Bar with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                placeholder="Search"
                className="w-full bg-muted border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
              ) : (
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-2xl bg-muted border-none">
            <div className="space-y-2">
              <h3 className="text-sm text-muted-foreground">History</h3>
              {history.map((search) => (
                <div
                  key={search}
                  className="p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-sm text-muted-foreground mb-4">
        Recent Searches
      </div>
      {/* People List */}
      <div className="space-y-4">
        {people.map((person) => (
          <SearchResults key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import SearchResults from "@/components/SearchResults";
import mockUserData from "@/constants/users";
import { useNavigate } from "react-router-dom";

export interface Person {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

// API call
const searchPeople = async (query: string): Promise<Person[]> => {
  if (!query.trim()) return [];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Convert mockUserData to Person[] format and filter
  const results = Object.entries(mockUserData)
    .map(([id, user]) => ({
      id,
      name: user.username,
      bio: user.bio,
      avatar: user.avatarSrc,
    }))
    .filter(
      (person) =>
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.bio.toLowerCase().includes(query.toLowerCase())
    );

  return results;

  /* Commented out actual API call
  try {
    const response = await fetch("http://localhost:3000/api/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        searchString: query
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

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
  const navigate = useNavigate();

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

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const history = [
    "Software Engineers",
    "Product Managers",
    "UI Designers",
    "Data Scientists",
  ];

  return (
    <>
      <div className="max-w-2xl mx-auto bg-background px-4 pb-4">
        <div className="sticky top-0 bg-background py-4 z-10">
          {/* Search Bar */}
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
          {/* 
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
          */}
        </div>
        {searchQuery==="" && <div className="text-sm text-muted-foreground mb-4">Recent Searches</div>}
        {/* People List */}
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.id} onClick={() => handleProfileClick(person.id)}>
              <SearchResults person={person} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import SearchResults from "@/components/SearchResults";
// import { useNavigate } from "react-router-dom";
import { Person, searchPeople } from "@/apis/commonApiCalls/searchApi";
import { useApiCall } from "@/apis/globalCatchError";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);


  const [executeSearch, isLoading] = useApiCall(searchPeople);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!searchQuery.trim()) {
        setPeople([]);
        return;
      }

      const result = await executeSearch(searchQuery);

      console.log(result);
      if (result.success) {
        setPeople(result.data?.users || []);
      }
    };

    // Add debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPeople();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);



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
        </div>
        {searchQuery === "" && (
          <div className="text-sm text-muted-foreground mb-4">
            Recent Searches
          </div>
        )}
        {/* People List */}
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.id}>
              <SearchResults person={person} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

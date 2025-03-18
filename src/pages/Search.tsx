import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, Users, AlertCircle } from "lucide-react";
import SearchResults from "@/components/SearchResults";
// import { useNavigate } from "react-router-dom";
import { Person, searchPeople } from "@/apis/commonApiCalls/searchApi";
import { useApiCall } from "@/apis/globalCatchError";
import { SearchResultsListSkeleton } from "@/components/skeletons/SearchSkeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [executeSearch, isLoading] = useApiCall(searchPeople);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!searchQuery.trim()) {
        setPeople([]);
        setHasSearched(false);
        return;
      }

      try {
        const result = await executeSearch(searchQuery);
        setHasSearched(true);

        if (result.success) {
          setPeople(result.data?.users || []);
          setError(null);
        } else {
          setError(result.data?.message || "Failed to search for people");
          setPeople([]);
        }
      } catch (err) {
        console.log("err: ", err);
        setError("An error occurred while searching");
        setPeople([]);
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
        <div className="sticky bg-background py-4 z-10 -top-10 ">
          {/* Search Bar */}
          <div className="relative ">
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
        
        {/* Recent Searches */}
        {searchQuery === "" && !hasSearched && (
          <div className="text-sm text-muted-foreground mb-4">
            Recent Searches
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && searchQuery !== "" && (
          <SearchResultsListSkeleton />
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <EmptyState
            icon={AlertCircle}
            title="Search Error"
            description={error}
            className="my-8"
          />
        )}
        
        {/* Empty Results State */}
        {!isLoading && hasSearched && people.length === 0 && !error && (
          <EmptyState
            icon={Users}
            title="No results found"
            description={`No users found matching "${searchQuery}"`}
            className="my-8"
          />
        )}
        
        {/* People List */}
        {!isLoading && people.length > 0 && (
          <div className="space-y-4">
            {people.map((person) => (
              <div key={person.id}>
                <SearchResults person={person} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

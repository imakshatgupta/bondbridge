import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search as SearchIcon } from 'lucide-react';
import SearchResults from '@/components/SearchResults';
export interface Person {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with your actual data
  const people: Person[] = [
    {
      id: '1',
      name: 'Michel Smithwick',
      bio: 'SDE @ Paytm',
      avatar: '/profile/user.png',
    },
    {
      id: '2',
      name: 'Sena Foore',
      bio: 'SDE-II @ Paytm',
      avatar: '/profile/user.png',
    },
    // Add more people...
  ];

  const history = [
    'Software Engineers',
    'Product Managers',
    'UI Designers',
    'Data Scientists',
  ];

  return (
    <div className="max-w-2xl mx-auto bg-background min-h-screen p-4">
      <div className="sticky top-0 bg-background pb-4">
        {/* Search Bar with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                // type="search"
                placeholder="Search"
                className="w-full bg-muted border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

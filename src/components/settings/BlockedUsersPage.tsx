import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { blockUser, setSettingsActive, unblockUser } from '@/store/settingsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Search, UserX, UserPlus, ArrowLeft } from 'lucide-react';

// Mock user data for search
const MOCK_USERS = [
  { id: 'user3', name: 'Alex Johnson', avatar: '/profile/avatars/3.png' },
  { id: 'user4', name: 'Sam Wilson', avatar: '/profile/avatars/4.png' },
  { id: 'user5', name: 'Taylor Swift', avatar: '/profile/avatars/5.png' },
  { id: 'user6', name: 'Jordan Peterson', avatar: '/profile/avatars/6.png' },
  { id: 'user7', name: 'Morgan Freeman', avatar: '/profile/avatars/1.png' },
  { id: 'user8', name: 'Emma Watson', avatar: '/profile/avatars/2.png' },
];

const BlockedUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { blockedUsers } = useAppSelector((state) => state.settings);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleUnblock = (userId: string) => {
    dispatch(unblockUser(userId));
  };
  
  const handleBlock = (user: { id: string; name: string; avatar: string }) => {
    dispatch(blockUser(user));
    setDialogOpen(false);
    setSearchQuery('');
  };
  
  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !blockedUsers.some(blockedUser => blockedUser.id === user.id)
  );
  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
        <ArrowLeft className="h-4 w-4 mr-2 inline" onClick={handleCloseSettings} />
        Blocked Users</h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Block User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block a User</DialogTitle>
              <DialogDescription>
                Search for a user to block. Blocked users won't be able to message you or see your content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto mt-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleBlock(user)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {searchQuery ? 'No users found' : 'Type to search for users'}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {blockedUsers.length > 0 ? (
        <div className="space-y-2">
          {blockedUsers.map(user => (
            <div 
              key={user.id}
              className="flex items-center justify-between p-3 border border-border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleUnblock(user.id)}
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border rounded-md">
          <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">You haven't blocked any users yet</p>
        </div>
      )}
    </div>
  );
};

export default BlockedUsersPage; 
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateProfile, updateInterests, setSettingsActive } from '@/store/settingsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApiCall } from '@/apis/globalCatchError';
import { updateUserProfile } from '@/apis/commonApiCalls/profileApi';

const AVAILABLE_INTERESTS = [
  'Design', 'Photography', 'Travel', 'Music', 'Art', 'Technology', 
  'Cooking', 'Sports', 'Reading', 'Writing', 'Gaming', 'Fitness',
  'Fashion', 'Movies', 'Nature', 'Science', 'History', 'Politics'
];

const AVAILABLE_AVATARS = [
  '/profile/avatars/1.png',
  '/profile/avatars/2.png',
  '/profile/avatars/3.png',
  '/profile/avatars/4.png',
  '/profile/avatars/5.png',
  '/profile/avatars/6.png',
];

const EditProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { username, email, avatar, interests, privacyLevel } = useAppSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    username,
    email,
  });
  
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(interests);
  
  // Use the useApiCall hook for the updateUserProfile API
  const [executeUpdateProfile, isUpdatingProfile] = useApiCall(updateUserProfile);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };
  
  const handleAddInterest = (interest: string) => {
    if (!selectedInterests.includes(interest) && interest.trim() !== '') {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    const newInterests = selectedInterests.filter(i => i !== interest);
    setSelectedInterests(newInterests);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Starting profile update process...');
    
    // Prepare the request data
    const profileData = {
      name: formData.username,
      email: formData.email,
      interests: selectedInterests,
      privacyLevel: privacyLevel ?? 0, // Provide default value of 0 if privacyLevel is undefined
      avatar: selectedAvatar
    };
    
    console.log('📦 Form data prepared:', profileData);
    
    // Execute the API call using our hook
    const { data, success } = await executeUpdateProfile(profileData);
    
    if (success && data) {
      console.log('✅ Profile update successful, updating Redux store...');
      
      // Update Redux store
      dispatch(updateProfile({
        username: formData.username,
        email: formData.email,
        avatar: selectedAvatar,
        privacyLevel: privacyLevel ?? 0, // Provide default value of 0 if privacyLevel is undefined
      }));
      dispatch(updateInterests(selectedInterests));
      
      console.log('🎉 Redux store updated successfully');
      toast.success('Profile updated successfully');
    }
    
    console.log('🏁 Profile update process completed');
  };
  
  const availableInterestsFiltered = AVAILABLE_INTERESTS.filter(
    interest => !selectedInterests.includes(interest)
  );
  
  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
      <ArrowLeft className="h-4 w-4 mr-2 inline" onClick={handleCloseSettings} />
      Edit Profile</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Selection */}
        <div className="space-y-4">
          <Label>Profile Picture</Label>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedAvatar} alt="Profile" />
              <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Choose an avatar that represents you</p>
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_AVATARS.map((avatarUrl, index) => (
              <div 
                key={index}
                className={`relative cursor-pointer rounded-lg border-2 ${
                  selectedAvatar === avatarUrl 
                    ? 'border-primary' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => handleAvatarSelect(avatarUrl)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                </Avatar>
                {selectedAvatar === avatarUrl && (
                  <div className="absolute -top-2 -right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        {/* Interests */}
        <div className="space-y-4">
          <Label>Interests</Label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedInterests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {interest}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveInterest(interest);
                  }}
                  className="ml-1 focus:outline-none"
                >
                  <X className="h-3 w-3 cursor-pointer" />
                </button>
              </Badge>
            ))}
          </div>
        
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Suggested interests:</p>
            <div className="flex flex-wrap gap-2">
              {availableInterestsFiltered.slice(0, 8).map((interest) => (
                <Badge 
                  key={interest} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => handleAddInterest(interest)}
                >
                  + {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isUpdatingProfile}>
          {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditProfilePage; 
import React, { useState } from 'react';



const SelectAvatarTab: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Choose an avatar that represents you</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map((avatar, index) => (
          <div 
            key={index}
            className={`relative cursor-pointer rounded-lg border-2 ${
              selectedAvatar === avatar 
                ? 'border-primary bg-muted' 
                : 'border-input hover:border-ring'
            }`}
            onClick={() => setSelectedAvatar(avatar)}
          >
            <img 
              src={`/profile/avatars/${avatar}.png`} 
              alt={`Avatar ${index + 1}`}
              className="h-full w-full mx-auto object-cover rounded-lg"
            />
            {selectedAvatar === avatar && (
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectAvatarTab; 
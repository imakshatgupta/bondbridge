import { Trash2, Upload } from 'lucide-react';
import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setImage } from '../../store/createProfileSlice';

const CoverProfilePhotosTab: React.FC = () => {
  const dispatch = useAppDispatch();
  // Get the existing image from Redux store
  const existingImage = useAppSelector(state => state.createProfile.image);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing image in Redux store when component mounts
  useEffect(() => {
    if (existingImage) {
      // If we have a file object in Redux
      if (existingImage instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setProfilePhoto(e.target.result as string);
          }
        };
        reader.readAsDataURL(existingImage);
      } 
      // If we already have a string URL in Redux
      else if (typeof existingImage === 'string') {
        setProfilePhoto(existingImage);
      }
    }
  }, [existingImage]);

  const processFile = (file: File) => {
    // Store the file in Redux
    dispatch(setImage(file));

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setProfilePhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
    }
  };

  const handleDelete = () => {
    setProfilePhoto(null);
    dispatch(setImage(null)); // Clear the image in Redux
    if (profileInputRef.current) {
      profileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (profileInputRef.current) {
      profileInputRef.current.click();
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Set dropEffect to copy to show the user can drop
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        processFile(file);
      }
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Profile Photo</h3>
        
        <div 
          className="flex flex-col items-center justify-center bg-background p-8 rounded-lg border border-border shadow-sm"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div 
            className={`relative w-36 h-36 mb-4 ${isDragging ? 'ring-2 ring-primary' : ''}`}
          >
            {profilePhoto ? (
              <>
                <img 
                  src={profilePhoto} 
                  alt="Profile photo" 
                  className="w-full h-full object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={handleDelete}
                  className="absolute top-0 right-0 p-1 bg-destructive rounded-full shadow-md text-primary-foreground hover:bg-destructive/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className={`w-full h-full rounded-full bg-muted flex flex-col items-center justify-center border-2 ${isDragging ? 'border-primary bg-primary/10' : 'border-dashed border-input'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isDragging && <p className="text-xs text-primary mt-2">Drop image here</p>}
              </div>
            )}
          </div>
          
          <div className="w-full text-center">
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              UPLOAD
            </button>
            <input
              ref={profileInputRef}
              id="profile-photo"
              name="profile-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Recommended Size: 500px (square)
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop an image file here or click upload
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoverProfilePhotosTab;
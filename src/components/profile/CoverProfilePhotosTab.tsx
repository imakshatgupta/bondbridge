import { Trash2 } from 'lucide-react';
import React, { useState, useRef } from 'react';

const CoverProfilePhotosTab: React.FC = () => {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle file selection
  const handleFileChange = (type: 'cover' | 'profile', event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          if (type === 'cover') {
            setCoverPhoto(e.target.result as string);
          } else {
            setProfilePhoto(e.target.result as string);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Function to handle delete
  const handleDelete = (type: 'cover' | 'profile') => {
    if (type === 'cover') {
      setCoverPhoto(null);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    } else {
      setProfilePhoto(null);
      if (profileInputRef.current) {
        profileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Cover Photo</h3>
        <div className="relative h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
          {coverPhoto ? (
            <>
              <img 
                src={coverPhoto} 
                alt="Cover photo" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete('cover')}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full shadow-md text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4 flex flex-col text-center">
                <p className="text-sm text-gray-600">Drag and drop a file here, or click to select a file</p>
                <p className="text-xs text-gray-500">Recommended size: 1500x500px</p>
              </div>
              <label htmlFor="cover-photo">
                <button
                  type="button"
                  onClick={() => document.getElementById('cover-photo')?.click()}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Cover Photo
                </button>
              </label>
            </div>
          )}
          <input
            ref={coverInputRef}
            id="cover-photo"
            name="cover-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFileChange('cover', e)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
              {profilePhoto ? (
                <>
                  <img 
                    src={profilePhoto} 
                    alt="Profile photo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete('profile')}
                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-md text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8zm0 4a3 3 0 110 6 3 3 0 010-6zm0 32c-4.964 0-9.412-2.2-12.456-5.672C13.524 35.143 18.273 32 24 32c5.727 0 10.476 3.143 12.456 6.328C33.412 41.8 28.964 44 24 44z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="profile-photo">
              <button
                type="button"
                onClick={() => document.getElementById('profile-photo')?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Profile Photo
              </button>
            </label>
            <input
              ref={profileInputRef}
              id="profile-photo"
              name="profile-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFileChange('profile', e)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverProfilePhotosTab;
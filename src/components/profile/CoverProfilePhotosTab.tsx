import React from 'react';

const CoverProfilePhotosTab: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Cover Photo</h3>
        <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4 flex flex-col text-center">
            <p className="text-sm text-gray-600">Drag and drop a file here, or click to select a file</p>
            <p className="text-xs text-gray-500">Recommended size: 1500x500px</p>
          </div>
          <input
            id="cover-photo"
            name="cover-photo"
            type="file"
            className="sr-only"
          />
          <button
            type="button"
            className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Cover Photo
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8zm0 4a3 3 0 110 6 3 3 0 010-6zm0 32c-4.964 0-9.412-2.2-12.456-5.672C13.524 35.143 18.273 32 24 32c5.727 0 10.476 3.143 12.456 6.328C33.412 41.8 28.964 44 24 44z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Profile Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverProfilePhotosTab; 
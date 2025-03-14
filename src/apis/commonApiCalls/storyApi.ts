import { formDataApiClient } from '@/apis/apiClient';
import { UploadStoryResponse } from '../apiTypes/response';
import { StoryData } from '../apiTypes/request';

/**
 * Function to upload stories (with or without media) 
 * @param storiesData - Array of story data to upload
 * @returns Promise with the upload story response
 */
export const uploadStory = async (storiesData: StoryData[]): Promise<UploadStoryResponse> => {
  if (!storiesData || storiesData.length === 0) {
    throw new Error('At least one story is required');
  }
  
  // Check if any story has empty content
  const emptyStory = storiesData.find(story => {
    if (typeof story.content === 'string') {
      return !story.content.trim();
    }
    // For File or Blob, check if size is 0
    if (story.content instanceof File || story.content instanceof Blob) {
      return story.content.size === 0;
    } 
    return false;
  });
  
  if (emptyStory) {
    throw new Error('All stories must have content');
  }
  
  // Take the first story's details for the main request
  const primaryStory = storiesData[0];
  console.log("Story data received:", primaryStory);
  
  // Create FormData object
  const formData = new FormData();
  
  // Add required fields to FormData
  formData.append('contentType', primaryStory.type === 'photo' ? 'image' : primaryStory.type === 'video' ? 'video' : 'text');
  formData.append('privacy', primaryStory.privacy.toString());
  
  // Collect all images, videos, and texts from stories
  const images: File[] = [];
  const videos: File[] = [];
  const texts: string[] = [];
  
  // Process all stories to extract media files and texts
  storiesData.forEach(story => {
    if (story.type === 'text') {
      texts.push(story.content.toString());
    } else if (story.content instanceof File) {
      // Check file size (1MB = 1024 * 1024 bytes)
      const maxSize = 1024 * 1024; // 1MB in bytes
      if (story.content.size > maxSize) {
        throw new Error(`File ${story.content.name} exceeds maximum size of 1MB`);
      }

      if (story.type === 'photo') {
        images.push(story.content);
      } else if (story.type === 'video') {
        videos.push(story.content);
      }
    }
  });
  
  // Append all texts
  texts.forEach(text => {
    formData.append('text', text);
  });

  // Append all images
  images.forEach(image => {
    formData.append('image', image, image.name);
  });
  
  // Append all videos
  videos.forEach(video => {
    formData.append('video', video, video.name);
  });

  // Make the API request
  const response = await formDataApiClient.post('/upload-story', formData);

  if (response.status === 200 || response.status === 201) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to upload story');
  }
};

// Additional helper to verify FormData is correctly built
export function validateFormData(formData: FormData): boolean {
  const keys = [...formData.keys()];
  const hasRequiredFields = keys.includes('contentType') && keys.includes('privacy');
  const hasContent = keys.includes('content') || keys.includes('data');
  
  return hasRequiredFields && hasContent;
}
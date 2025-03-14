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
  
  // Add theme if provided
  // if (primaryStory.theme) {
  //   formData.append('theme', primaryStory.theme);
  // }

  if (primaryStory.type === 'text') {
    formData.append('text', primaryStory.content.toString());
  } else if (primaryStory.type === 'photo' || primaryStory.type === 'video') {
    // Check if content is already a File object
    if (primaryStory.content instanceof File) {
      if (primaryStory.type === 'photo') {
        formData.append('image', primaryStory.content, primaryStory.content.name);
      } else if (primaryStory.type === 'video') {
        formData.append('video', primaryStory.content, primaryStory.content.name);
      }
    } 
  }
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
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
  
  // Add basic fields from the first story
  formData.append('contentType', primaryStory.type === 'photo' ? 'image' : primaryStory.type === 'video' ? 'video' : 'text');
  formData.append('privacy', primaryStory.privacy.toString());
  
  // Process all stories
  const mediaFiles: { images: File[], videos: File[], thumbnails: File[] } = {
    images: [],
    videos: [],
    thumbnails: []
  };

  // Process each story and collect media files
  storiesData.forEach((story) => {
    if (story.type === 'text' && typeof story.content === 'string') {
      formData.append('text', story.content);
    } else if (story.content instanceof File) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (story.content.size > maxSize) {
        throw new Error(`File ${story.content.name} exceeds maximum size of 10MB`);
      }

      if (story.type === 'photo') {
        mediaFiles.images.push(story.content);
      } else if (story.type === 'video') {
        mediaFiles.videos.push(story.content);
        if ('thumbnail' in story && story.thumbnail instanceof File) {
          mediaFiles.thumbnails.push(story.thumbnail);
        }
      }
    }
  });

  // Append all collected media files to FormData
  mediaFiles.images.forEach((image) => {
    formData.append('image', image);
  });

  mediaFiles.videos.forEach((video) => {
    formData.append('video', video);
  });

  mediaFiles.thumbnails.forEach((thumbnail) => {
    formData.append('thumbnail', thumbnail);
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

/**
 * Function to mark a story as seen by the current user
 * @param storyId - The ID of the story that was viewed
 * @returns Promise with the API response
 */
export const saveStoryInteraction = async (storyId: string): Promise<{ success: boolean; message: string }> => {
  if (!storyId) {
    throw new Error('Story ID is required');
  }
  
  const formData = new FormData();
  formData.append('storyId', storyId);
  
  const response = await formDataApiClient.post('/save-interaction', formData);
  
  if (response.status === 200) {
    return {
      success: true,
      message: response.data.message || 'Story interaction saved successfully'
    };
  } else {
    throw new Error(response.data.message || 'Failed to save story interaction');
  }
};

/**
 * Function to get self stories
 * @returns Promise with the self stories response
 */
export const getSelfStories = async () => {
  const response = await formDataApiClient.get('/get-self-stories');
  return response.data;
};

/**
 * Function to get stories for a specific user by userId
 * @param userId - The ID of the user whose stories to fetch
 * @returns Promise with the user's stories
 */
export const getStoryForUser = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const response = await formDataApiClient.post('/get-story-for-user', {
    userId: userId
  });
  
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to fetch user stories');
  }
};
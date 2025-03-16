export interface StoryItem {
    _id: string;
    author: string;
    privacy: number;
    contentType: string;
    taggedUsers: string[] | null;
    hideFrom: string[];
    createdAt: number;
    url: string;
    status: number;
    ago_time: string;
    seen: number;
} 
  
export interface StoryUser {
    user: string;
    userId: string;
    avatar: string;
    isLive: boolean;
    hasStory: boolean;
    stories: StoryItem[];
    latestStoryTime: number;
}
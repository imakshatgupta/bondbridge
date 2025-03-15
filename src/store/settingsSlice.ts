import { UserProfileData } from '@/apis/apiTypes/profileTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SettingPage = 'profile' | 'privacy' | 'notifications' | 'blocked' | 'voice' | 'help' | 'account';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
}

interface VoiceOption {
  id: string;
  name: string;
  preview: string;
}

interface SettingsState {
  isSettingsActive: boolean;
  activePage: SettingPage;
  username: string;
  email: string;
  avatar: string;
  currentUser: UserProfileData | null;
  interests: string[];
  selectedVoice: string;
  voiceOptions: VoiceOption[];
  blockedUsers: BlockedUser[];
  privacyLevel?: number;
  privacySettings: {
    isProfilePublic: boolean;
    showOnlineStatus: boolean;
    allowMessagesFromNonFriends: boolean;
  };
}

const initialState: SettingsState = {
  isSettingsActive: false,
  activePage: 'profile',
  currentUser: null,
  username: 'Jo Hall',
  email: 'cloudysanfrancisco@gmail.com',
  avatar: '/profile/avatars/1.png',
  interests: ['Design', 'Photography', 'Travel', 'Music'],
  selectedVoice: 'voice1',
  privacyLevel: 0,
  voiceOptions: [
    { id: 'voice1', name: 'Default Voice', preview: '/audio/sample.mp3' },
    { id: 'voice2', name: 'Deep Voice', preview: '/audio/sample.mp3' },
    { id: 'voice3', name: 'Soft Voice', preview: '/audio/sample.mp3' },
    { id: 'voice4', name: 'Energetic Voice', preview: '/audio/sample.mp3' },
    { id: 'voice5', name: 'Calm Voice', preview: '/audio/sample.mp3' },
    { id: 'voice6', name: 'Professional Voice', preview: '/audio/sample.mp3' },
  ],
  blockedUsers: [
    { id: 'user1', name: 'John Doe', avatar: '/profile/avatars/3.png' },
    { id: 'user2', name: 'Jane Smith', avatar: '/profile/avatars/4.png' },
  ],
  privacySettings: {
    isProfilePublic: true,
    showOnlineStatus: true,
    allowMessagesFromNonFriends: true
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettingsActive: (state, action: PayloadAction<boolean>) => {
      state.isSettingsActive = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<Partial<UserProfileData>>) => {
      state.currentUser = {
        ...state.currentUser,
        ...action.payload
      } as UserProfileData;
    },
    setActivePage: (state, action: PayloadAction<SettingPage>) => {
      state.activePage = action.payload;
    },
    updateProfile: (state, action: PayloadAction<{username?: string; email?: string; avatar?: string; privacyLevel?: number}>) => {
      Object.assign(state, action.payload);
    },
    updateInterests: (state, action: PayloadAction<string[]>) => {
      state.interests = action.payload;
    },
    setSelectedVoice: (state, action: PayloadAction<string>) => {
      state.selectedVoice = action.payload;
    },
    blockUser: (state, action: PayloadAction<BlockedUser>) => {
      // Check if user is already blocked
      const userExists = state.blockedUsers.some(user => user.id === action.payload.id);
      if (!userExists) {
        state.blockedUsers.push(action.payload);
      }
    },
    unblockUser: (state, action: PayloadAction<string>) => {
      state.blockedUsers = state.blockedUsers.filter(user => user.id !== action.payload);
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<typeof initialState.privacySettings>>) => {
      Object.assign(state.privacySettings, action.payload);
    },
    logout: () => initialState,
    deleteAccount: () => initialState, // In a real app, this would trigger an API call
  }
});

export const {
  setSettingsActive,
  setActivePage,
  updateProfile,
  updateInterests,
  setSelectedVoice,
  blockUser,
  unblockUser,
  updatePrivacySettings,
  logout,
  deleteAccount,
  setCurrentUser
} = settingsSlice.actions;

export default settingsSlice.reducer;

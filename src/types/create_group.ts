export const tabs = [
    { id: "info", label: "Group Information" },
    { id: "skills", label: "Skills/Interests" },
    { id: "friends", label: "Select friends" },
  ];

export interface Friend {
  _id: string;
  name: string;
  profilePic: string;
  bio: string;
  followers: number;
  followings: number;
}
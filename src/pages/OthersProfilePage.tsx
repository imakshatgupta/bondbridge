import React from "react";
import Profile from "@/components/Profile";
import avatar from "@/assets/avatar.png";

export default function OthersProfilePage() {
  // Mock data for demonstration
  const userData = {
    username: "Others Profile",
    email: "",  // We might not show email for other profiles
    followers: 20034,
    following: 3987,
    avatarSrc: avatar,
    isCurrentUser: false, // This ensures we show the Message/Add Friend buttons instead of Settings
  };

  return (
    <Profile 
      username={userData.username}
      email={userData.email}
      followers={userData.followers}
      following={userData.following}
      avatarSrc={userData.avatarSrc}
      isCurrentUser={userData.isCurrentUser}
    />
  );
} 
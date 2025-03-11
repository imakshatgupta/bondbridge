import React from "react";
import Profile from "@/components/Profile";
import { useParams } from "react-router-dom";
import avatar from "/profile/user.png";

interface ProfilePageProps {
  isOthersProfile?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isOthersProfile = false }) => {
  const { username } = useParams<{ username: string }>();
  
  // In a real app, you would fetch user data based on the username
  // This is mock data for demonstration
  const userData = {
    username: username || "Jo Hall",
    email: "cloudysanfrancisco@gmail.com",
    followers: 20034,
    following: 3987,
    avatarSrc: avatar,
    isCurrentUser: !isOthersProfile, // You would determine this based on authentication
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
};

export default ProfilePage; 
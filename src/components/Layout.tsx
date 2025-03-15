

import React, { useEffect } from "react";
import { Button } from "./ui/button";
import SidebarAvatar from "./profile/SidebarAvatar";
import Navbar from "./Navbar";
import { useAppDispatch, useAppSelector } from "@/store";
import ChatInterface from "./activity/ChatInterface";
import { setActiveChat } from "@/store/chatSlice";
import { Link, useLocation } from "react-router-dom";
import mockUserData from "@/constants/users";
import { fetchUserProfile } from "@/apis/commonApiCalls/profileApi";
import type { UserProfileData } from "@/apis/apiTypes/profileTypes";
import SettingLayout from './settings/SettingLayout';
import LeftSidebar from "./auth/LeftSidebar";
import { setCurrentUser as setCurrentUserHandler } from "@/store/settingsSlice";
interface LayoutProps {
  children: React.ReactNode;
  showSidebars?: boolean; // Flag to control sidebar visibility
  className?: string;
}


const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebars = false,
  className,
}) => {
  const dispatch = useAppDispatch();
  const activeChat = useAppSelector((state) => state.chat.activeChat);
  const currentUserId = localStorage.getItem('userId') || "";
  const currentUser = useAppSelector((state) => state.settings.currentUser);
  const setCurrentUser = (user: UserProfileData) => {
    dispatch(setCurrentUserHandler(user));
  }
  const location = useLocation();

  useEffect(() => {
    // console.log("location: ", location);
    const loadCurrentUser = async () => {
      const result = await fetchUserProfile(currentUserId, currentUserId);
      if (result.success) {
        setCurrentUser(result.data);
      }
    };
    loadCurrentUser();
  }, [currentUserId,location]);
  const isSettingsActive = useAppSelector((state) => state.settings.isSettingsActive);

  // Convert mockUserData to array and filter out current user
  const sidebarUsers = Object.entries(mockUserData)
    .filter(([id]) => id !== currentUserId)
    .map(([id, user]) => ({
      id,
      username: user.username,
      avatarSrc: user.avatarSrc,
    }));

  const handleCloseChat = () => {
    dispatch(setActiveChat(null));
  };

  return (
    <>
    <div className="flex justify-center items-center h-screen w-screen overflow-x-hidden md:hidden">
      <div className="text-2xl font-bold">Please open on app</div>
    </div>
    <div className=" flex-col overflow-hidden h-screen w-screen overflow-x-hidden hidden md:flex">
      {/* Navbar */}
      <Navbar />

      {showSidebars ? (
        <div className="grid lg:grid-cols-12 w-full">
          {/* Left Sidebar */}
          <LeftSidebar />
          <div className="flex col-span-10">
            {/* Main Content */}
            <div
              className={`border-r w-full border-border p-10 overflow-y-auto app-scrollbar bg-background h-[calc(100vh-64px)] ${className}`}
            >
              {children}
            </div>

            {/* Right Sidebar */}
            {isSettingsActive ? (
              <div className="w-2/3">
                <SettingLayout />
              </div>
            ) : activeChat ? (
              <div className="w-2/3">
                <ChatInterface
                  chatId={activeChat.id}
                  name={activeChat.name}
                  avatar={activeChat.avatar}
                  onClose={handleCloseChat}
                />
              </div>
            ) : (
              <div className="p-5 w-1/2 px-12 space-y-6 *:rounded-xl">
                <div className="p-4 border-2 border-sidebar-border">
                  <div className="flex flex-col items-center">
                    <img
                      src={currentUser?.avatarSrc || "/profile/avatars/1.png"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full mb-2 border-2 border-sidebar-border"
                    />
                    <h3 className="font-semibold text-xl text-sidebar-foreground">
                      {currentUser?.username || "Loading..."}
                    </h3>
                    <p className="text-sidebar-foreground/60">
                      {currentUser?.bio || ""}
                    </p>
                    <Link to={`/profile/${currentUserId}`}>
                      <Button
                        variant={"outline"}
                        className="mt-2 cursor-pointer text-sidebar-primary text-sm font-medium border-primary w-full"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6 border-2 overflow-y-auto max-h-[52vh] app-scrollbar">
                  <h3 className="font-semibold text-lg mb-4 text-sidebar-foreground">
                    People
                  </h3>
                  <ul className="space-y-3">
                    {sidebarUsers.map((user) => (
                      <SidebarAvatar
                        key={user.id}
                        id={user.id}
                        username={user.username}
                        avatarSrc={user.avatarSrc}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main content without sidebars */
        <main className="flex-grow">{children}</main>
      )}
    </div>
    </>
  );
};

export default Layout;
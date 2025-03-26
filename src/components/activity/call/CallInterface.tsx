import React, { useEffect, useRef, useState } from "react";
import { useCall } from "@/context/CallContext";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ChatHeader from "../chat/ChatHeader";

const CallInterface: React.FC = () => {
  const {
    isInCall,
    isCalling,
    callType,
    localTracks,
    remoteUsers,
    participants,
    leaveCall,
    toggleMic,
    toggleCamera,
    callId,
    addParticipant,
  } = useCall();

  const localVideoRef = useRef<HTMLDivElement>(null);
  const [shouldRerender, setShouldRerender] = useState(0);

  // Force re-render every 2 seconds during the initial call setup
  // This helps ensure remote videos get rendered properly
  useEffect(() => {
    if (isInCall && callType === "video") {
      const timer = setInterval(() => {
        if (remoteUsers.length > 0) {
          setShouldRerender(prev => prev + 1);
        }
      }, 2000);
      
      // Clear interval after 15 seconds (or when component unmounts)
      const maxTimer = setTimeout(() => {
        clearInterval(timer);
      }, 15000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(maxTimer);
      };
    }
  }, [isInCall, callType, remoteUsers.length]);

  // Mount local video track to DOM
  useEffect(() => {
    if (localTracks.videoTrack && localVideoRef.current) {
      localTracks.videoTrack.play(localVideoRef.current);
    }
    
    return () => {
      localTracks.videoTrack?.stop();
    };
  }, [localTracks.videoTrack]);

  // If not in a call or calling, don't render anything
  if (!isInCall && !isCalling) return null;

  // Debug active call information
  console.log("CallInterface active with:", {
    isInCall,
    callType,
    remoteUsersCount: remoteUsers.length,
    participantsCount: participants.length,
    localVideo: !!localTracks.videoTrack,
    localAudio: !!localTracks.audioTrack,
    renderCounter: shouldRerender
  });

  if (remoteUsers.length > 0) {
    console.log("Remote users detail:", remoteUsers.map(user => ({
      uid: user.uid,
      hasAudio: user.hasAudio,
      hasVideo: user.hasVideo,
      videoTrack: !!user.videoTrack
    })));
  }

  // Force refreshing of video connections
  const handleRefreshVideos = () => {
    setShouldRerender(prev => prev + 1);
    console.log("Manually refreshing video connections");
    
    // Re-play local video if needed
    if (localTracks.videoTrack && localVideoRef.current) {
      localTracks.videoTrack.stop();
      setTimeout(() => {
        localTracks.videoTrack?.play(localVideoRef.current!);
      }, 200);
    }
  };

  // Render remote users and their video tracks
  const renderRemoteUsers = () => {
    if (remoteUsers.length === 0) {
      // Get the other participant's info for display while waiting
      let otherUserInfo = null;
      let statusMessage = "No participants yet";
      
      if (participants.length > 1) {
        // Find a participant who isn't the current user
        const localUserId = localStorage.getItem("userId") || "";
        const otherParticipant = participants.find(p => p.userId !== localUserId);
        
        if (otherParticipant) {
          otherUserInfo = otherParticipant.userInfo;
          statusMessage = isCalling ? "Calling..." : "Connecting...";
        }
      } else if (isCalling) {
        statusMessage = "Calling...";
      }
      
      return (
        <div className="flex items-center justify-center h-full bg-muted rounded-lg">
          <div className="text-center">
            {otherUserInfo ? (
              <>
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={otherUserInfo.avatar} alt={otherUserInfo.name} />
                  <AvatarFallback>{otherUserInfo.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <p className="text-lg font-medium mb-1">{otherUserInfo.name}</p>
              </>
            ) : (
              <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            )}
            <p className="text-muted-foreground">
              {statusMessage}
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={handleRefreshVideos}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh Connection
            </Button>
          </div>
        </div>
      );
    }

    return remoteUsers.map((user) => {
      // Debug info for this specific user
      console.log(`Rendering remote user ${user.uid}:`, {
        hasVideo: user.hasVideo,
        hasVideoTrack: !!user.videoTrack,
        hasAudio: user.hasAudio
      });
      
      return (
        <div key={`${user.uid}-${shouldRerender}`} className="relative h-full rounded-lg overflow-hidden bg-black">
          {user.videoTrack ? (
            <div 
              className="h-full w-full object-cover"
              ref={el => {
                if (el) {
                  // First clean up any previous rendering
                  el.innerHTML = '';
                  // Then play the video track in this element
                  console.log(`Playing video for user ${user.uid}`);
                  try {
                    // Stop the track first if it's already playing somewhere
                    if (user.videoTrack && user.videoTrack.isPlaying) {
                      user.videoTrack.stop();
                    }
                    // Set fit mode to cover (fills container)
                    if (user.videoTrack) {
                      user.videoTrack.play(el, { fit: "cover" });
                      console.log(`Successfully played video for user ${user.uid}`);
                    }
                  } catch (err) {
                    console.error(`Error playing video for user ${user.uid}:`, err);
                  }
                }
              }}
            />
          ) : (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarFallback>
                  {participants.find((p) => p.userId === user.uid)?.userInfo?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-xs mt-2">
                {user.hasVideo ? "Video connecting..." : "No video"}
              </p>
              {user.hasVideo && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRefreshUserVideo(user)}
                  className="mt-1 text-xs py-1 h-auto"
                >
                  Retry Video
                </Button>
              )}
            </div>
          )}
          
          {/* Display name and status of remote user */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center">
            <span>
              {participants.find((p) => p.userId === user.uid)?.userInfo?.name || "User"}
            </span>
            {user.hasAudio === false && (
              <MicOff className="h-3 w-3 ml-1 text-red-400" />
            )}
          </div>
        </div>
      );
    });
  };

  // Force refresh for a specific user's video
  const handleRefreshUserVideo = async (user: any) => {
    console.log(`Attempting to refresh video for user ${user.uid}`);
    
    if (user.hasVideo) {
      try {
        // Try to resubscribe
        if (user.videoTrack) {
          // First stop the existing track
          user.videoTrack.stop();
        }
        
        // Force state update to trigger re-render
        setShouldRerender(prev => prev + 1);
      } catch (err) {
        console.error(`Error refreshing video for user ${user.uid}:`, err);
      }
    }
  };

  // Get user info for header
  const getCallInfo = () => {
    // Defensive check - ensure participants is an array
    const safeParticipants = Array.isArray(participants) ? participants : [];
    
    // IMPORTANT: Never show less than 2 participants for an active call
    // This ensures we always show both the caller and callee
    let participantsCount = safeParticipants.length;
    if (isInCall && participantsCount < 2) {
      console.warn("Call is active but participants count < 2. Forcing to show 2 participants");
      participantsCount = 2;
    }
    
    if (participantsCount === 0) {
      return {
        name: "Call",
        avatar: "",
        type: callType === "video" ? "Video Call" : "Audio Call",
        participantsCount
      };
    }
    
    if (participantsCount === 1) {
      const participant = safeParticipants[0]?.userInfo;
      return {
        name: participant?.name || "Unknown",
        avatar: participant?.avatar || "",
        type: callType === "video" ? "Video Call" : "Audio Call",
        participantsCount
      };
    }
    
    // If we have multiple participants but not all have joined with video/audio yet
    if (participantsCount > 1 && remoteUsers.length === 0) {
      // Find any participant that's not the first one as an example
      const participant = safeParticipants[1]?.userInfo;
      return {
        name: participant?.name || "Connecting...",
        avatar: participant?.avatar || "",
        type: callType === "video" ? "Video Call" : "Audio Call",
        participantsCount
      };
    }
    
    return {
      name: "Group Call",
      avatar: "",
      type: callType === "video" ? "Video Call" : "Audio Call",
      participantsCount
    };
  };

  const callInfo = getCallInfo();

  // Add a participant to the call
  const handleAddParticipant = () => {
    // This would typically open a modal to select users
    // For now, just a placeholder
    const userId = prompt("Enter user ID to add to call:");
    if (userId && callId) {
      addParticipant(callId, userId);
    }
  };

  // Define menu items for the header
  const menuItems = [
    {
      label: "Add participant",
      icon: <PlusCircle className="h-4 w-4" />,
      onClick: handleAddParticipant,
    },
    {
      label: "Refresh video",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleRefreshVideos,
    },
    {
      label: "End call for everyone",
      icon: <PhoneOff className="h-4 w-4" />,
      onClick: leaveCall,
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Call header */}
      <ChatHeader
        name={callInfo.name}
        avatar={callInfo.avatar}
        chatType={callInfo.type}
        participantsCount={callInfo.participantsCount}
        onClose={leaveCall}
        onProfileClick={() => {}}
        menuItems={menuItems}
      />

      {/* Call body */}
      <div className="flex flex-col flex-1 p-4 space-y-4 overflow-hidden">
        {/* Call type indicator */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="px-2 py-1 text-xs">
            {callType === "video" ? "Video Call" : "Audio Call"}
            {isCalling && " • Connecting..."}
            {remoteUsers.length > 0 && ` • ${remoteUsers.length} connected`}
          </Badge>
        </div>

        {/* Main video area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          {renderRemoteUsers()}
        </div>

        {/* Local video preview (if video call) */}
        {callType === "video" && localTracks.videoTrack && (
          <div className="absolute bottom-24 right-4 w-40 h-60 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
            <div id="local-video" ref={localVideoRef} className="h-full w-full bg-black"></div>
          </div>
        )}

        {/* Call controls */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMic}
          >
            {localTracks.audioTrack?.enabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {callType === "video" && (
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleCamera}
            >
              {localTracks.videoTrack?.enabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={leaveCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface; 
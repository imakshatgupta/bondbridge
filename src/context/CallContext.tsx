import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAppSelector } from "@/store";
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack 
} from "agora-rtc-sdk-ng";

interface CallState {
  isInCall: boolean;
  isCalling: boolean;
  callId: string | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  localTracks: {
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  };
  callType: "audio" | "video" | null;
  participants: any[];
}

interface CallContextProps extends CallState {
  initializeCall: (userId: string, otherId: string, type: "audio" | "video") => Promise<void>;
  joinCall: (callId: string, userId: string) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  answerCall: (callData: any) => Promise<void>;
  rejectCall: (callData: any) => void;
  addParticipant: (callId: string, userId: string) => void;
  incomingCall: any | null;
}

// Create Agora client with optimized settings
const client: IAgoraRTCClient = AgoraRTC.createClient({ 
  mode: "rtc", 
  codec: "vp8"
});

// Initialize Agora client and set up event listeners
AgoraRTC.setLogLevel(1); // 0: debug, 1: info, 2: warning, 3: error, 4: none

// Add any startup check for browser compatibility
// This can help detect issues before they happen
const systemCheck = AgoraRTC.checkSystemRequirements();
console.log("Agora system requirements check:", systemCheck);

// Add this helper function at the top, after the client declaration
// Helper function to ensure consistent Agora client setup
const setupAgoraClient = (userId: string): IAgoraRTCClient => {
  // Set client user ID context
  console.log(`Setting Agora client user context: ${userId}`);
  // Set any client options as needed
  return client;
};

const CallContext = createContext<CallContextProps | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const currentUser = useAppSelector((state) => state.currentUser);
  const userId = localStorage.getItem("userId") || "";
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCalling: false,
    callId: null,
    remoteUsers: [],
    localTracks: {
      videoTrack: null,
      audioTrack: null,
    },
    callType: null,
    participants: [],
  });

  // Helper function to check socket connection and reconnect if needed
  const checkSocketConnection = useCallback(async (operation: string): Promise<boolean> => {
    console.log(`🔌 Socket check before ${operation}:`, { 
      isConnected: socket?.connected, 
      socketId: socket?.id 
    });
    
    if (!socket) {
      console.error(`Socket object is null during ${operation}`);
      return false;
    }
    
    if (!socket.connected) {
      console.warn(`Socket disconnected before ${operation}. Attempting to reconnect...`);
      socket.connect();
      
      // Wait briefly for connection to re-establish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Socket status after reconnect attempt (${operation}):`, { 
        isConnected: socket.connected, 
        socketId: socket.id 
      });
      
      return socket.connected;
    }
    
    return true;
  }, [socket]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle incoming call
    socket.on("pickUp", (data) => {
      console.log("📱 Incoming call (full data):", JSON.stringify(data));
      setIncomingCall(data);
    });

    // Handle user joining call
    socket.on("userJoined", (data) => {
      console.log("👤 User joined call - FULL DATA:", JSON.stringify(data));
      console.log("Current participants before update:", callState.participants);
      
      // Check if participants array exists and is not empty
      if (!data.participants || data.participants.length === 0) {
        console.warn("Received userJoined event without valid participants data");
        
        // If we don't have participants from the server, use what we have locally
        // and add the joining user based on the data provided
        if (callState.participants.length > 0) {
          console.log("Using existing participants and adding joining user");
          
          // Extract user info from the data
          const joiningUserId = data.userId || "";
          
          // Check if this user is already in our participants list
          const userExists = callState.participants.some(p => p.userId === joiningUserId);
          
          if (!userExists && joiningUserId) {
            setCallState(prev => ({
              ...prev,
              participants: [
                ...prev.participants,
                {
                  userId: joiningUserId,
                  userInfo: data.userInfo || {},
                  status: "active"
                }
              ]
            }));
          } else {
            console.log("User already exists in participants or no userId provided");
          }
        } else {
          console.warn("No participants data available locally or from server");
        }
      } else {
        // Normal flow - update with server-provided participants
        console.log("Setting participants from server data:", data.participants);
        setCallState(prev => ({
          ...prev,
          participants: data.participants
        }));
      }
    });

    // Handle user leaving call
    socket.on("userLeft", (data) => {
      console.log("User left call:", data.userId);
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.userId !== data.userId)
      }));
    });

    // Handle call ended
    socket.on("callEnded", (data) => {
      console.log("Call ended:", data);
      handleLeaveCall();
    });

    // Handle user added to call
    socket.on("userAdded", (data) => {
      console.log("User added to call:", data);
      setCallState(prev => ({
        ...prev,
        participants: data.participants
      }));
    });

    return () => {
      socket.off("pickUp");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("callEnded");
      socket.off("userAdded");
    };
  }, [socket, isConnected]);

  // Handle Agora client events
  useEffect(() => {
    if (!callState.isInCall) return;

    // Set up Agora event listeners
    client.on("user-published", async (user, mediaType) => {
      console.log(`Remote user ${user.uid} published ${mediaType} track`);
      
      try {
        // Subscribe to the remote user
        await client.subscribe(user, mediaType);
        console.log(`Successfully subscribed to ${user.uid}'s ${mediaType}`);

        if (mediaType === "video") {
          console.log(`Remote user ${user.uid} published video - adding to remoteUsers list`);
          // Update remoteUsers list to include this user with video
          setCallState(prev => {
            // Check if this user is already in our remoteUsers array
            const userExists = prev.remoteUsers.some(u => u.uid === user.uid);
            
            if (userExists) {
              // Update existing user entry
              console.log(`User ${user.uid} already exists in remoteUsers, updating`);
              return {
                ...prev,
                remoteUsers: prev.remoteUsers.map(u => 
                  u.uid === user.uid ? user : u
                )
              };
            } else {
              // Add new user
              console.log(`Adding new user ${user.uid} to remoteUsers`);
              return {
                ...prev,
                remoteUsers: [...prev.remoteUsers, user]
              };
            }
          });
        }
        
        if (mediaType === "audio") {
          console.log(`Playing audio for user ${user.uid}`);
          
          // IMPORTANT: Explicitly play the audio track
          if (user.audioTrack) {
            try {
              // Stop if already playing somewhere
              if (user.audioTrack.isPlaying) {
                user.audioTrack.stop();
              }
              
              // Play with specified playback options (default)
              user.audioTrack.play();
              console.log(`Successfully started playing audio for ${user.uid}`);
            } catch (err) {
              console.error(`Error playing audio for ${user.uid}:`, err);
            }
          } else {
            console.warn(`User ${user.uid} published audio but no audioTrack is available`);
          }
          
          // Even for audio-only users, we want them in the remoteUsers list
          // so they show with avatar instead of video
          setCallState(prev => {
            // Only add if not already in the list
            if (!prev.remoteUsers.some(u => u.uid === user.uid)) {
              return {
                ...prev,
                remoteUsers: [...prev.remoteUsers, user]
              };
            } else {
              // Update existing entry to make sure it has the latest audio state
              return {
                ...prev,
                remoteUsers: prev.remoteUsers.map(u => 
                  u.uid === user.uid ? user : u
                )
              };
            }
          });
        }
      } catch (error) {
        console.error(`Error subscribing to ${user.uid}'s ${mediaType}:`, error);
      }
    });

    client.on("user-unpublished", (user, mediaType) => {
      console.log(`Remote user ${user.uid} unpublished ${mediaType}`);
      
      if (mediaType === "video") {
        // Don't remove user completely, just update the reference to show they have no video
        // This approach avoids TypeScript errors while achieving the same goal
        setCallState(prev => {
          // Create a safe copy of the remote users array
          const updatedRemoteUsers = prev.remoteUsers.map(u => {
            if (u.uid === user.uid) {
              // This is the user who unpublished their video
              // We'll replace them with the updated user object from Agora
              return user; // This will have videoTrack set to undefined
            }
            return u;
          });
          
          return {
            ...prev,
            remoteUsers: updatedRemoteUsers
          };
        });
      }
    });

    client.on("user-left", (user) => {
      console.log(`Remote user ${user.uid} left the call`);
      
      // Remove user from remoteUsers list
      setCallState(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
      }));
    });

    // Debugging - log all users currently in the channel
    console.log("Current remote users in channel:", client.remoteUsers);
    if (client.remoteUsers.length > 0 && callState.remoteUsers.length === 0) {
      // If there are users in the channel but not in our state, add them
      console.log("Found existing users in channel, adding to state");
      setCallState(prev => ({
        ...prev,
        remoteUsers: client.remoteUsers
      }));
    }

    return () => {
      client.removeAllListeners();
    };
  }, [callState.isInCall]);

  // Initialize call (caller side)
  const initializeCall = useCallback(async (userId: string, otherId: string, type: "audio" | "video") => {
    console.group("📞 INITIALIZE CALL - ENHANCED");
    console.log("Call initialization requested:", { userId, otherId, type });
    
    // Check socket connection before proceeding
    const isSocketReady = await checkSocketConnection("initializing call");
    if (!isSocketReady) {
      console.error("Cannot initialize call: Socket connection check failed");
      console.groupEnd();
      return;
    }

    try {
      // Generate a unique call ID
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("Generated call ID:", callId);
      
      // Emit openCall event to join the room
      console.log("Emitting openCall event for user:", userId);
      socket?.emit("openCall", userId);
      
      // Create local tracks based on call type
      console.log("Creating audio track");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      let videoTrack = null;
      
      if (type === "video") {
        console.log("Creating video track (video call)");
        try {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
          console.log("Video track created successfully");
        } catch (err) {
          console.error("Failed to create video track:", err);
        }
      }
      console.log("Successfully created local media tracks");

      // Check socket connection again after media creation
      const isStillConnected = await checkSocketConnection("after media creation");
      if (!isStillConnected) {
        console.error("Socket connection lost after media creation. Cannot continue call initialization.");
        console.groupEnd();
        return;
      }

      // IMPORTANT: Connect to Agora immediately for the caller too
      console.log("Connecting caller to Agora...");
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) {
        console.error("Agora App ID not found in environment variables");
        console.groupEnd();
        throw new Error("Agora App ID not found");
      }
      
      // Leave any existing channel first to prevent errors
      if (client.connectionState === 'CONNECTED') {
        console.log("Client already connected to a channel. Leaving first...");
        await client.leave();
      }
      
      // Join the Agora channel as the caller
      console.log("Joining Agora channel with ID:", callId);
      console.log("Using user ID for Agora:", userId);
      const agoraClient = setupAgoraClient(userId);
      await agoraClient.join(appId, callId, null, userId);
      console.log("Caller successfully joined Agora channel");
      
      // Publish tracks to Agora
      console.log("Publishing caller's tracks to Agora");
      const tracksToPublish = [];
      if (audioTrack) tracksToPublish.push(audioTrack);
      if (videoTrack) tracksToPublish.push(videoTrack);
      
      let publishSuccess = false;
      if (tracksToPublish.length > 0) {
        try {
          await client.publish(tracksToPublish);
          console.log("Successfully published caller's tracks to Agora");
          publishSuccess = true;
        } catch (err) {
          console.error("Failed to publish all tracks at once:", err);
          
          // Try publishing one by one if bulk publish fails
          console.log("Trying to publish tracks individually...");
          publishSuccess = true; // Assume success until a failure
          
          if (audioTrack) {
            try {
              await client.publish(audioTrack);
              console.log("Successfully published audio track");
            } catch (err) {
              console.error("Failed to publish audio track:", err);
              publishSuccess = false;
            }
          }
          
          if (videoTrack) {
            try {
              await client.publish(videoTrack);
              console.log("Successfully published video track");
            } catch (err) {
              console.error("Failed to publish video track:", err);
              // Don't set publishSuccess to false here as audio might still work
            }
          }
        }
      }

      // Create participants array with both users
      const participants = [
        {
          userId,
          userInfo: {
            name: currentUser.username,
            avatar: currentUser.avatar,
            _id: userId
          }
        },
        {
          userId: otherId,
          status: "pending"  // Status pending until they join
        }
      ];
      console.log("Initial participants:", participants);
      
      // Update call state with both users in participants
      console.log("Updating call state: isCalling=true");
      setCallState(prev => ({
        ...prev,
        isCalling: true,
        callId,
        callType: type,
        localTracks: {
          audioTrack,
          videoTrack: videoTrack
        },
        participants,
        isInCall: true // IMPORTANT: Mark as in call immediately so Agora events are handled
      }));
      
      // Emit callInit event to notify the other user
      const callData = {
        callId,
        userId,
        otherId,
        type,
        userInfo: {
          name: currentUser.username,
          avatar: currentUser.avatar,
          _id: userId
        },
        participants
      };
      console.log("Emitting callInit event:", callData);
      
      socket?.emit("callInit", callData);
      
      console.log("Call initialization completed successfully");
      console.groupEnd();
      
      // Add a delayed check to ensure local tracks are properly published
      if (type === "video" && videoTrack) {
        setTimeout(async () => {
          // Check if our local video track got properly published
          const localUser = client.uid;
          const localStreamIsPublished = client.localTracks.some(track => 
            track.trackMediaType === "video"
          );
          
          console.log(`Delayed check - local user ${localUser} video published:`, localStreamIsPublished);
          
          // If not published properly, try republishing
          if (!localStreamIsPublished && videoTrack) {
            console.log("Local video track not properly published, attempting republish");
            try {
              await client.publish(videoTrack);
              console.log("Successfully republished video track");
            } catch (err) {
              console.error("Failed to republish video track:", err);
            }
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error initializing call:", error);
      console.log("Socket connection status at error:", { 
        isConnected: socket?.connected, 
        socketId: socket?.id 
      });
      console.groupEnd();
    }
  }, [socket, isConnected, currentUser, checkSocketConnection]);

  // Join an existing call
  const joinCall = useCallback(async (callId: string, _userId: string) => {
    console.group("📞 JOIN CALL - ENHANCED");
    console.log("Starting call join process:", { callId, userId: _userId });
    
    // Check socket connection before proceeding
    const isSocketReady = await checkSocketConnection("joining call");
    if (!isSocketReady) {
      console.error("Cannot join call: Socket connection check failed");
      console.groupEnd();
      return;
    }

    try {
      // Store current remote users to prevent them being lost in state updates
      const currentRemoteUsers = [...callState.remoteUsers];
      
      // Connect to Agora channel
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) {
        console.error("Agora App ID not found in environment variables");
        console.groupEnd();
        throw new Error("Agora App ID not found");
      }
      console.log("Using Agora App ID:", appId.substring(0, 4) + "...");

      // IMPORTANT: Leave any existing channel first to prevent errors
      if (client.connectionState === 'CONNECTED') {
        console.log("Client already connected to a channel. Leaving first...");
        await client.leave();
      }

      // Join the Agora channel (using callId as channel name)
      console.log("Joining Agora channel with ID:", callId);
      console.log("Using user ID for Agora:", userId);
      const agoraClient = setupAgoraClient(userId);
      await agoraClient.join(appId, callId, null, userId);
      console.log("Successfully joined Agora channel");

      // Create and publish local tracks
      console.log("Creating audio track");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      let videoTrack = null;
      
      // Determine call type - using a more reliable approach
      const callTypeToUse = callState.callType || incomingCall?.type || 'audio';
      const isVideoCall = callTypeToUse === 'video';
      
      console.log("Call type determined as:", callTypeToUse);
      console.log("Is this a video call?", isVideoCall);
      
      // For video calls, create video track
      if (isVideoCall) {
        try {
          console.log("Creating video track for video call");
          videoTrack = await AgoraRTC.createCameraVideoTrack();
          console.log("Video track created successfully");
        } catch (err) {
          console.error("Failed to create video track:", err);
        }
      }
      
      // Create an array of tracks to publish
      const tracksToPublish = [];
      if (audioTrack) {
        tracksToPublish.push(audioTrack);
        console.log("Added audio track to publish");
      }
      
      if (videoTrack) {
        tracksToPublish.push(videoTrack);
        console.log("Added video track to publish");
      }
      
      // Publish tracks
      if (tracksToPublish.length > 0) {
        console.log(`Publishing ${tracksToPublish.length} tracks to Agora`);
        try {
          await client.publish(tracksToPublish);
          console.log("Successfully published tracks to Agora");
        } catch (err) {
          console.error("Failed to publish tracks:", err);
        }
      } else {
        console.warn("No tracks to publish");
      }

      // Check socket connection again before sending join event
      const isStillConnected = await checkSocketConnection("after media setup");
      if (!isStillConnected) {
        console.error("Socket connection lost after media setup. Cannot continue call join.");
        console.groupEnd();
        return;
      }

      // Emit joinCall event to update participants
      const userInfo = {
        name: currentUser.username,
        avatar: currentUser.avatar,
        _id: userId
      };
      console.log("Emitting joinCall event:", { callId, userId, userInfo });
      
      if (socket) {
        // Get existing participants to send them along
        const existingParticipants = callState.participants.length > 0 ? 
          callState.participants : 
          (incomingCall?.participants || []);
        
        socket.emit("joinCall", {
          callId,
          userId,
          userInfo,
          participants: existingParticipants
        });
      } else {
        console.error("Cannot emit joinCall event: Socket is null");
      }

      // Special handling for reconnection - check for existing users
      console.log("Getting remote users in channel");
      const remoteUsers = client.remoteUsers;
      console.log("Found remote users:", remoteUsers.length ? remoteUsers : "None");
      
      // Update call state
      console.log("Updating call state: isInCall=true, isCalling=false");
      console.log("Current participants:", callState.participants);
      console.log("Incoming call participants:", incomingCall?.participants || []);
      
      setCallState(prev => {
        // Use the most complete participants data available
        let finalParticipants: any[] = [];
        
        // If we have local participants data, start with that
        if (prev.participants && prev.participants.length > 0) {
          finalParticipants = [...prev.participants];
          console.log("Using existing participants from state:", finalParticipants);
        }
        // If we have incoming call participants data, merge or use it
        else if (incomingCall?.participants && incomingCall.participants.length > 0) {
          finalParticipants = [...incomingCall.participants];
          console.log("Using participants from incoming call:", finalParticipants);
        }
        
        // If we still have no participants but know the call details, create basic entries
        if (finalParticipants.length === 0 && incomingCall) {
          console.log("Creating basic participants from call data");
          // Add the caller
          const callerId = incomingCall.userId || incomingCall.callerId || incomingCall.from || "";
          console.log("Identified caller ID:", callerId);
          
          // Make sure the caller ID is not our own ID
          if (callerId && callerId !== userId) {
            finalParticipants.push({
              userId: callerId,
              userInfo: incomingCall.userInfo || {},
              status: "active"
            });
            console.log("Added caller to participants:", callerId);
          }
          
          // Add ourselves (the callee)
          finalParticipants.push({
            userId,
            userInfo: {
              name: currentUser.username,
              avatar: currentUser.avatar,
              _id: userId
            },
            status: "active"
          });
          console.log("Added ourselves to participants:", userId);
          
          console.log("Created basic participants:", finalParticipants);
        } else if (finalParticipants.length === 1) {
          // If we only have one participant (likely ourselves), add the other party
          console.log("Only one participant found, checking if we need to add the other party");
          
          const existingUserId = finalParticipants[0].userId;
          let otherUserId;
          
          // If the incoming call exists, try to get the other ID from it
          if (incomingCall) {
            otherUserId = incomingCall.userId || incomingCall.callerId || incomingCall.from;
            
            // If that's our ID, then we're the caller - check for otherId
            if (otherUserId === userId) {
              otherUserId = incomingCall.otherId || incomingCall.to;
            }
          }
          
          // Make sure the other ID isn't already in our list
          if (otherUserId && otherUserId !== existingUserId) {
            console.log("Adding missing user to participants:", otherUserId);
            
            finalParticipants.push({
              userId: otherUserId,
              userInfo: otherUserId === incomingCall?.userId ? 
                (incomingCall?.userInfo || {}) : {},
              status: "active"
            });
          }
        }
        
        console.log("Final participants being set:", finalParticipants);
        
        // Combine existing remote users with any new ones
        const combinedRemoteUsers = [...currentRemoteUsers, ...remoteUsers];
        const uniqueRemoteUsers = combinedRemoteUsers.filter((user, index, self) => 
          index === self.findIndex(u => u.uid === user.uid)
        );
        
        return {
          ...prev,
          isInCall: true,
          isCalling: false,
          callId,
          callType: callTypeToUse,
          localTracks: {
            audioTrack,
            videoTrack
          },
          participants: finalParticipants,
          remoteUsers: uniqueRemoteUsers
        };
      });

      console.log("Call join process completed successfully");
      
      // Clear incoming call data
      setIncomingCall(null);
      console.groupEnd();
      
    } catch (error) {
      console.error("Error joining call:", error);
      console.log("Socket connection status at error:", { 
        isConnected: socket?.connected, 
        socketId: socket?.id 
      });
      console.groupEnd();
    }
  }, [socket, isConnected, callState.callType, callState.remoteUsers, incomingCall, userId, currentUser, checkSocketConnection]);

  // Leave call
  const handleLeaveCall = useCallback(async () => {
    try {
      // Stop and close local tracks
      callState.localTracks.audioTrack?.close();
      callState.localTracks.videoTrack?.close();

      // Leave Agora channel
      await client.leave();

      // Reset call state
      setCallState({
        isInCall: false,
        isCalling: false,
        callId: null,
        remoteUsers: [],
        localTracks: {
          videoTrack: null,
          audioTrack: null,
        },
        callType: null,
        participants: [],
      });

      // Clear incoming call data
      setIncomingCall(null);
      
    } catch (error) {
      console.error("Error leaving call:", error);
    }
  }, [callState.localTracks]);

  // Emit endCall event and handle leave
  const leaveCall = useCallback(async () => {
    if (!socket || !isConnected || !callState.callId) {
      console.error("Cannot leave call: Socket not connected or no active call");
      return;
    }

    // Emit endCall event
    socket.emit("endCall", {
      callId: callState.callId,
      userId: userId,
    });

    // Leave the call
    await handleLeaveCall();
  }, [socket, isConnected, callState.callId, handleLeaveCall, userId]);

  // Toggle microphone
  const toggleMic = useCallback(async () => {
    if (!callState.localTracks.audioTrack) return;
    
    if (callState.localTracks.audioTrack.isPlaying) {
      callState.localTracks.audioTrack.stop();
    } else {
      callState.localTracks.audioTrack.play();
    }
    
    callState.localTracks.audioTrack.setEnabled(
      !callState.localTracks.audioTrack.enabled
    );
  }, [callState.localTracks.audioTrack]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!callState.localTracks.videoTrack) return;
    
    if (callState.localTracks.videoTrack.isPlaying) {
      callState.localTracks.videoTrack.stop();
    } else {
      callState.localTracks.videoTrack.play("local-video");
    }
    
    callState.localTracks.videoTrack.setEnabled(
      !callState.localTracks.videoTrack.enabled
    );
  }, [callState.localTracks.videoTrack]);

  // Answer an incoming call
  const answerCall = useCallback(async (callData: any) => {
    console.group("📞 ANSWER CALL - ENHANCED DEBUGGING");
    if (!callData) {
      console.error("No call data available");
      console.groupEnd();
      return;
    }

    console.log("Answering call with FULL data:", JSON.stringify(callData));
    
    // Check socket connection before proceeding
    const isSocketReady = await checkSocketConnection("answering call");
    if (!isSocketReady) {
      console.error("Cannot answer call: Socket connection check failed");
      console.groupEnd();
      return;
    }
    
    // Set call type and participants from incoming call data
    console.log("Setting call state with incoming data");
    console.log("Call type:", callData.type);
    console.log("Participants from incoming call (DETAILED):", JSON.stringify(callData.participants || []));
    
    // Create default participants if none are provided
    let initialParticipants = callData.participants || [];
    
    if (initialParticipants.length === 0) {
      console.log("No participants in incoming call data, creating default entries");
      
      // Add the caller - try to find caller ID from multiple possible locations
      const callerId = callData.userId || callData.callerId || callData.from || "";
      console.log("Identified caller ID:", callerId);
      
      if (callerId && callerId !== userId) {
        initialParticipants.push({
          userId: callerId,
          userInfo: callData.userInfo || {},
          status: "active"
        });
        console.log("Added caller to participants:", callerId);
      }
      
      // Add ourselves (the callee)
      initialParticipants.push({
        userId,
        userInfo: {
          name: currentUser.username,
          avatar: currentUser.avatar,
          _id: userId
        },
        status: "active"
      });
      console.log("Added ourselves to participants:", userId);
      
      console.log("Created default participants:", JSON.stringify(initialParticipants));
    } else {
      console.log("Checking if all participants are present");
      // Make sure both users are in the participants array
      const callerIdFromData = callData.userId || callData.callerId || callData.from || "";
      console.log("CallerID extracted from data:", callerIdFromData);
      console.log("Our userID:", userId);
      
      const hasCallerInParticipants = initialParticipants.some((p: any) => p.userId === callerIdFromData);
      const hasReceiverInParticipants = initialParticipants.some((p: any) => p.userId === userId);
      
      console.log("Caller exists in participants?", hasCallerInParticipants);
      console.log("Receiver exists in participants?", hasReceiverInParticipants);
      
      if (!hasCallerInParticipants && callerIdFromData && callerIdFromData !== userId) {
        console.log("Adding missing caller to participants:", callerIdFromData);
        initialParticipants.push({
          userId: callerIdFromData,
          userInfo: callData.userInfo || {},
          status: "active"
        });
      }
      
      if (!hasReceiverInParticipants) {
        console.log("Adding missing receiver (ourselves) to participants");
        initialParticipants.push({
          userId,
          userInfo: {
            name: currentUser.username,
            avatar: currentUser.avatar,
            _id: userId
          },
          status: "active"
        });
      }
    }
    
    console.log("Final participants list for answerCall:", JSON.stringify(initialParticipants));
    console.log("Participant count:", initialParticipants.length);
    
    // IMPORTANT: Force the call type to be correctly set before joining
    const callType = callData.type || 'audio';
    console.log("Setting call type to:", callType);
    
    // IMPORTANT: Force the participant data to be set before joining call
    setCallState(prev => ({
      ...prev,
      callType: callType,
      participants: initialParticipants
    }));
    
    // Give a small delay to let the state update before joining call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Join the call
    console.log("Proceeding to join call:", callData.callId);
    await joinCall(callData.callId, userId);
    
    // IMPORTANT: After joining, double-check for users already in the channel
    setTimeout(async () => {
      // If we're in the call but don't see any remote users yet
      if (client.remoteUsers.length > 0 && callState.remoteUsers.length === 0) {
        console.log("🔍 Post-join check: Found users in channel that weren't detected:", 
          client.remoteUsers.map(u => u.uid));
        
        // Force subscribe to all remote users
        for (const remoteUser of client.remoteUsers) {
          console.log(`Attempting to force subscribe to user ${remoteUser.uid}'s tracks`);
          
          if (remoteUser.hasVideo) {
            try {
              console.log(`👁️ Force subscribing to ${remoteUser.uid}'s video`);
              await client.subscribe(remoteUser, "video");
              console.log(`✅ Successfully subscribed to ${remoteUser.uid}'s video`);
            } catch (err) {
              console.error(`❌ Error subscribing to ${remoteUser.uid}'s video:`, err);
            }
          }
          
          if (remoteUser.hasAudio) {
            try {
              console.log(`🔊 Force subscribing to ${remoteUser.uid}'s audio`);
              await client.subscribe(remoteUser, "audio");
              remoteUser.audioTrack?.play();
              console.log(`✅ Successfully subscribed to ${remoteUser.uid}'s audio`);
            } catch (err) {
              console.error(`❌ Error subscribing to ${remoteUser.uid}'s audio:`, err);
            }
          }
        }
        
        // Update state with all remote users
        setCallState(prev => ({
          ...prev,
          remoteUsers: client.remoteUsers
        }));
      }
      
      // Continue with second update for participants
      setCallState(prev => {
        // If the participants somehow got lost in the joinCall process,
        // restore our initialParticipants array
        const finalParticipants = 
          prev.participants.length >= initialParticipants.length ? 
          prev.participants : initialParticipants;
        
        console.log("Post-join participants check. Current:", 
          JSON.stringify(prev.participants),
          "Initial:", JSON.stringify(initialParticipants),
          "Using:", JSON.stringify(finalParticipants)
        );
        
        return {
          ...prev,
          participants: finalParticipants,
          callType: callType // Ensure call type is preserved
        };
      });
    }, 1000); // Give a bit more time for network operations to settle
    
    console.groupEnd();
  }, [joinCall, userId, checkSocketConnection, currentUser, callState.remoteUsers.length]);

  // Reject an incoming call
  const rejectCall = useCallback((callData: any) => {
    if (!socket || !isConnected) {
      console.error("Socket not connected");
      return;
    }
    
    // Could implement rejection notification here
    // socket.emit("rejectCall", { callId: callData.callId, userId: socket.id });
    
    // Clear incoming call data
    setIncomingCall(null);
  }, [socket, isConnected]);

  // Add a participant to a call
  const addParticipant = useCallback((callId: string, userId: string) => {
    if (!socket || !isConnected) {
      console.error("Socket not connected");
      return;
    }
    
    socket.emit("add", {
      callId,
      userId
    });
  }, [socket, isConnected]);

  // Inside the CallProvider component, add this effect to log client state changes
  useEffect(() => {
    // Log Agora client connection state changes
    client.on("connection-state-change", (curState, prevState) => {
      console.log(`Agora client connection state changed: ${prevState} -> ${curState}`);
    });
    
    return () => {
      client.off("connection-state-change", () => {});
    };
  }, []);

  // Periodic check for remote users when in a call
  useEffect(() => {
    if (!callState.isInCall || !callState.callId) return;
    
    console.log("Setting up periodic remote user check");
    
    // Check if audio playback is working for all users with audio
    const audioPlaybackCheckInterval = setInterval(() => {
      const usersWithAudio = client.remoteUsers.filter(user => user.hasAudio);
      
      if (usersWithAudio.length > 0) {
        console.log(`Checking audio playback for ${usersWithAudio.length} users with audio`);
        
        usersWithAudio.forEach(async (user) => {
          // If the user has audio but it's not playing, try to fix it
          if (user.audioTrack && !user.audioTrack.isPlaying) {
            console.log(`User ${user.uid} has audio but it's not playing. Attempting to play...`);
            
            try {
              // Try to play the audio track
              user.audioTrack.play();
              console.log(`Successfully started playing audio for ${user.uid}`);
            } catch (err) {
              console.error(`Error playing audio for ${user.uid}:`, err);
              
              // If that fails, try to resubscribe
              try {
                console.log(`Resubscribing to audio for ${user.uid}`);
                await client.unsubscribe(user, "audio");
                await client.subscribe(user, "audio");
                
                // Try to play again after resubscribe
                if (user.audioTrack) {
                  user.audioTrack.play();
                  console.log(`Successfully playing audio after resubscribe for ${user.uid}`);
                }
              } catch (subErr) {
                console.error(`Failed to resubscribe to audio for ${user.uid}:`, subErr);
              }
            }
          }
        });
      }
    }, 3000); // Check every 3 seconds
    
    // Check if user-published events might not be firing
    const userPublishedCheckInterval = setInterval(() => {
      // For each remote user that has video but no videoTrack
      const usersWithVideoButNoTrack = client.remoteUsers.filter(
        user => user.hasVideo && !user.videoTrack
      );
      
      if (usersWithVideoButNoTrack.length > 0) {
        console.log(`Found ${usersWithVideoButNoTrack.length} users with video but no tracks:`, 
          usersWithVideoButNoTrack.map(u => u.uid));
        
        // Force (re)subscribe to their video tracks
        usersWithVideoButNoTrack.forEach(async (user) => {
          console.log(`Attempting to force resubscribe to ${user.uid}'s video`);
          
          try {
            // First try unsubscribing
            await client.unsubscribe(user, "video");
            console.log(`Successfully unsubscribed from ${user.uid}'s video`);
            
            // Then resubscribe
            await client.subscribe(user, "video");
            console.log(`Successfully resubscribed to ${user.uid}'s video`);
            
            // Update remoteUsers to trigger UI update
            setCallState(prev => ({
              ...prev,
              remoteUsers: [...prev.remoteUsers.filter(u => u.uid !== user.uid), user]
            }));
          } catch (err) {
            console.error(`Error resubscribing to ${user.uid}'s video:`, err);
          }
        });
      }
      
      // Also check for users with audio issues
      const usersWithAudioButNoTrack = client.remoteUsers.filter(
        user => user.hasAudio && !user.audioTrack
      );
      
      if (usersWithAudioButNoTrack.length > 0) {
        console.log(`Found ${usersWithAudioButNoTrack.length} users with audio but no tracks:`, 
          usersWithAudioButNoTrack.map(u => u.uid));
        
        // Force (re)subscribe to their audio tracks
        usersWithAudioButNoTrack.forEach(async (user) => {
          console.log(`Attempting to force resubscribe to ${user.uid}'s audio`);
          
          try {
            // First try unsubscribing
            await client.unsubscribe(user, "audio");
            console.log(`Successfully unsubscribed from ${user.uid}'s audio`);
            
            // Then resubscribe
            await client.subscribe(user, "audio");
            console.log(`Successfully resubscribed to ${user.uid}'s audio`);
            
            // Play the audio track if available
            if (user.audioTrack) {
              user.audioTrack.play();
              console.log(`Playing audio track for ${user.uid} after resubscribe`);
            }
            
            // Update remoteUsers to trigger UI update
            setCallState(prev => ({
              ...prev,
              remoteUsers: [...prev.remoteUsers.filter(u => u.uid !== user.uid), user]
            }));
          } catch (err) {
            console.error(`Error resubscribing to ${user.uid}'s audio:`, err);
          }
        });
      }
    }, 5000); // Check every 5 seconds
    
    // Regularly check for remote users that we might have missed
    const interval = setInterval(() => {
      // Get current remote users from the Agora client
      const currentRemoteUsers = client.remoteUsers;
      
      // If we have remote users in the channel but not in our state, add them
      if (currentRemoteUsers.length > 0 && 
          (callState.remoteUsers.length === 0 || 
           currentRemoteUsers.length > callState.remoteUsers.length)) {
        
        console.log("Found remote users in periodic check:", currentRemoteUsers.map(u => u.uid));
        console.log("Current state remote users:", callState.remoteUsers.map(u => u.uid));
        
        // Check for users in client.remoteUsers that aren't in our state
        const missingUsers = currentRemoteUsers.filter(
          remoteUser => !callState.remoteUsers.some(u => u.uid === remoteUser.uid)
        );
        
        if (missingUsers.length > 0) {
          console.log("Adding missing remote users to state:", missingUsers.map(u => u.uid));
          
          // Update state with all remote users
          setCallState(prev => ({
            ...prev,
            remoteUsers: [...prev.remoteUsers, ...missingUsers]
          }));
          
          // Try to subscribe to any missing users' tracks
          missingUsers.forEach(async (user) => {
            // Try to subscribe to video if available
            if (user.hasVideo) {
              console.log(`Trying to subscribe to missing user ${user.uid}'s video`);
              try {
                await client.subscribe(user, "video");
                console.log(`Successfully subscribed to ${user.uid}'s video`);
              } catch (err) {
                console.error(`Error subscribing to ${user.uid}'s video:`, err);
              }
            }
            
            // Try to subscribe to audio if available
            if (user.hasAudio) {
              console.log(`Trying to subscribe to missing user ${user.uid}'s audio`);
              try {
                await client.subscribe(user, "audio");
                console.log(`Successfully subscribed to ${user.uid}'s audio`);
                
                // Explicitly play the audio track
                if (user.audioTrack) {
                  user.audioTrack.play();
                  console.log(`Playing audio for ${user.uid} after subscription`);
                } else {
                  console.warn(`No audio track available for ${user.uid} after subscription`);
                }
              } catch (err) {
                console.error(`Error subscribing to ${user.uid}'s audio:`, err);
              }
            }
          });
        }
      }
    }, 3000); // Check every 3 seconds
    
    return () => {
      clearInterval(interval);
      clearInterval(userPublishedCheckInterval);
      clearInterval(audioPlaybackCheckInterval);
    };
  }, [callState.isInCall, callState.callId, callState.remoteUsers.length]);

  return (
    <CallContext.Provider 
      value={{
        ...callState,
        initializeCall,
        joinCall,
        leaveCall,
        toggleMic,
        toggleCamera,
        answerCall,
        rejectCall,
        addParticipant,
        incomingCall
      }}
    >
      {children}
    </CallContext.Provider>
  );
}; 
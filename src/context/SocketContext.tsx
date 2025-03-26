import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketToken = localStorage.getItem("socketToken");

  useEffect(() => {
    // Only attempt to connect if socketToken exists
    if (!socketToken) {
      console.log("No socket token available, skipping socket connection");
      return;
    }

    console.log("Connecting to socket with token");
    const newSocket = io(`${import.meta.env.VITE_API_SOCKET_URL}`, {
      auth: {
        token: socketToken,
      },
      reconnection: true, // Enable reconnection
      reconnectionAttempts: Infinity, // Unlimited reconnection attempts
      reconnectionDelay: 1000, // Start with 1 sec delay
      reconnectionDelayMax: 5000, // Max 5 sec delay
      timeout: 20000, // Connection timeout
      autoConnect: true, // Connect automatically
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("🟢 Socket connected to server with ID:", newSocket.id);
      console.log("Socket transport:", newSocket.io.engine.transport.name);
      setIsConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔴 Socket connect error:", error.message);
      console.error("Error details:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected from server. Reason:", reason);
      
      // Log more details about the disconnection
      if (reason === "io server disconnect") {
        console.error("The server has forcefully disconnected the socket");
      } else if (reason === "io client disconnect") {
        console.log("The client manually disconnected the socket");
      } else if (reason === "ping timeout") {
        console.error("The server did not respond to the ping within the timeout");
      } else if (reason === "transport close") {
        console.error("The connection was closed (possible network issue)");
      } else if (reason === "transport error") {
        console.error("The connection encountered an error");
      }
      
      setIsConnected(false);

      // If the disconnection was initiated by the server, try to reconnect
      if (reason === "io server disconnect") {
        console.log("Attempting to reconnect after server disconnect");
        newSocket.connect();
      }
    });

    // Socket connection lifecycle events
    newSocket.io.on("reconnect", (attemptNumber) => {
      console.log("🟢 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.io.on("reconnect_attempt", (attemptNumber) => {
      console.log("🟠 Socket attempting to reconnect... Attempt #", attemptNumber);
    });

    newSocket.io.on("reconnect_error", (error) => {
      console.error("🔴 Socket reconnection error:", error);
    });

    newSocket.io.on("reconnect_failed", () => {
      console.error("🔴 Socket failed to reconnect after all attempts");
    });

    // Monitor for potential issues
    newSocket.io.on("error", (error) => {
      console.error("🔴 Socket error:", error);
    });

    // Implement heartbeat mechanism
    const heartbeat = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping");
      }
    }, 25000); // Send heartbeat every 25 seconds

    newSocket.on("pong", () => {
      // Server responded to our ping
      console.debug("Received pong from server");
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      clearInterval(heartbeat);
      newSocket.close();
    };
  }, [socketToken]); // Recreate socket if token changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

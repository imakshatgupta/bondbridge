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
      console.log("Connected to server with ID:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setIsConnected(false);

      // If the disconnection was initiated by the server, try to reconnect
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    // Reconnection event handlers
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting to reconnect...", attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect");
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

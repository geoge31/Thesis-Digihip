"use client"; // Ensure this component is client-side

import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

// Define the context props
interface UnreadMessagesContextProps {
  unreadCount: number;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const UnreadMessagesContext = createContext<
  UnreadMessagesContextProps | undefined
>(undefined);

// Provider component
export const UnreadMessagesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize the WebSocket connection
    const socketConnection = io(process.env.NEXT_PUBLIC_WS_URL || "", {
      transports: ["websocket"],
    });

    // Listen for "newMessage" events from the server
    socketConnection.on("newMessage", (data) => {
      // Ensure `data.messages` exists and has at least one message
      if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1]; // Get the last message in the array

        if (lastMessage.sender_id === data.patient_id) {
          incrementUnreadCount(); // Increment only if the patient sent the last message
        }
      }
    });

    // Cleanup on component unmount
    return () => {
      socketConnection.off("newMessage");
      socketConnection.disconnect();
    };
  }, []);

  // Function to increment the unread count
  const incrementUnreadCount = () => setUnreadCount((count) => count + 1);

  // Function to reset the unread count (e.g., when viewing messages)
  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadCount, incrementUnreadCount, resetUnreadCount }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

// Custom hook for accessing the context
export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error(
      "useUnreadMessages must be used within an UnreadMessagesProvider"
    );
  }
  return context;
};

"use client";

import { useContext, createContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = 'hi' //useMemo(() => {
    // return io(process.env.NEXT_PUBLIC_SERVER_URL, {
    //   autoConnect: false,
    // });
  // }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

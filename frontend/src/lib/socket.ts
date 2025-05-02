import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000", {
      autoConnect: false, 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket!.id);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}
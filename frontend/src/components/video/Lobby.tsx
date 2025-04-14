"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useReducedState";
import { UserData } from "@/types/type";
import { useRouter,useParams } from "next/navigation";
import Preview from "./Preview";

const Lobby = ({ user }: { user: UserData }) => {
  const {roomId} = useParams()
  const router = useRouter();
  const socket = useSocket();

  // useEffect(() => {
  //   const handleJoinedRoom = (data: { message: string; roomId: number }) => {
  //     router.push("/room/" + data.roomId);
  //     console.log("CLIENT: Received 'joined-room' event!");
  //     if (data && data.message && data.roomId !== undefined) {
  //       console.log("CLIENT: Message:", data.message, "Room ID:", data.roomId);
  //     } else {
  //       console.log(
  //         "CLIENT: Received 'joined-room' but data format unexpected:",
  //         data
  //       );
  //     }
  //   };

  //   socket.on("joined-room", handleJoinedRoom);

  //   return () => {
  //     socket.off("joined-room", handleJoinedRoom);
  //   };
  // }, [socket, router]);

  // useEffect(() => {
  //   if (socket?.connected) {
  //     console.log("Socket is connected!");
  //   } else {
  //     console.log("Socket not connected!");
  //   }
  // }, [socket]);
  


  // const handleStartSession = () => {
  //   if (!socket) {
  //     console.error("Socket is not initialized");
  //     return;
  //   }

  //   const roomData = { email: user.email, roomId: 1 };
  //   console.log("CLIENT: Emitting 'join-room' with data:", roomData);
  //   socket.emit("join-room", roomData);
  // };

  return (
    <>
      <div className="flex flex-col justify-center items-center w-1/2 ml-4 p-4">
        <p className="text-gray-900 mb-2 text-center">
          Adjust your video and audio settings before starting the meeting.
        </p>
        <Preview />
      </div>

      <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4 raleway">Host your Meeting</h1>
        <p className="text-lg mb-8 text-center">
          Set up your meeting and get started as a host.
        </p>
        <button
          onClick={handleStartSession}
          className="bg-yellow-500 text-white px-6 py-3 cursor-pointer rounded font-medium shadow hover:bg-yellow-600"
        >
          Start your Session
        </button>
      </div>
    </>
  );
};

export default Lobby;

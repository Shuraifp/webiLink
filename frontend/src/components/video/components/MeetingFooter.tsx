// "use client";

// import { Mic, MicOff, Camera, LogOut } from "lucide-react";
// import { useReducedState } from "@/hooks/useReducedState";
// import { Socket } from "socket.io-client";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// interface Props {
//   socketRef: Socket | null;
//   zpRef: React.RefObject<ZegoUIKitPrebuilt | null>;
//   expressEngineRef: React.RefObject<any>; // Adjust type if needed
// }

// const MeetingFooter = ({ socketRef, zpRef, expressEngineRef }: Props) => {
//   const { state, dispatch } = useReducedState();

//   const toggleMute = () => {
//     if (!socketRef || !expressEngineRef.current) return;
//     const isMuted = !state.isMuted;
//     socketRef.emit("toggle-mute", {
//       roomId: state.roomId,
//       userId: state.currentUserId,
//       isMuted,
//     });

//     if (!zpRef.current) return;
//     zpRef.current.toggleMicrophone();
//     expressEngineRef.current.mutePublishStreamAudio(true);
//     dispatch({ type: "TOGGLE_MUTE", payload: isMuted });
//   };

//   const toggleCamera = () => {
//     if (!expressEngineRef.current) return;
//     const isCameraOn = !state.isCameraOn; // Assuming isCameraOn is in state
//     expressEngineRef.current.mutePublishStreamVideo(!isCameraOn); // Full control over video
//     dispatch({ type: "TOGGLE_CAMERA", payload: isCameraOn });
//   };

//   const leaveMeeting = () => {
//     if (!socketRef || !zpRef.current) return;
//     socketRef.emit("leave-room", {
//       roomId: state.roomId,
//       userId: state.currentUserId,
//     });
//     zpRef.current.hangUp();
//   };

//   return (
//     <div className="flex justify-center gap-4 p-4 bg-gray-800 rounded-lg z-10 absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[300px] shadow-lg">
//       <button
//         onClick={toggleMute}
//         className="flex items-center gap-1 text-white hover:text-gray-300 cursor-pointer"
//       >
//         {state.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
//         {state.isMuted ? "Unmute" : "Mute"}
//       </button>
//       <button
//         onClick={toggleCamera}
//         className="flex items-center gap-1 text-white hover:text-gray-300"
//       >
//         <Camera size={20} /> Cam
//       </button>
//       <button
//         onClick={leaveMeeting}
//         className="flex items-center gap-1 text-red-500 hover:text-red-300"
//       >
//         <LogOut size={20} /> Leave
//       </button>
//     </div>
//   );
// };

// export default MeetingFooter;

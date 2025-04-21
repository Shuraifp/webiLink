"use client";

import { SetStateAction, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import MeetingFooter from "./MeetingFooter";
import MeetingNavbar from "./MeetingNavbar";
import { Socket } from "socket.io-client";
import ChatPanel from "./ChatPanel";
import { useReducedState } from "@/hooks/useReducedState";

interface Props {
  userId: string;
  socketRef: Socket | null;
}

export default function MeetingRoomUI({
  userId,
  socketRef,
}: Props) {
  const { state } = useReducedState()
  const [layout, setLayout] = useState("everyone");
  const [highlighted, setHighlighted] =
    useState<SetStateAction<number | null>>(null);

    console.log("video streams in meeting room ui ",state);

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLayout(e.target.value);
    setHighlighted(null);
  };

  const handleHighlight = (index: number) => {
    setHighlighted((prev: number | null) => (prev === index ? null : index));
  };

  const renderVideos = () => {
    if (layout === "hide") return null;

    if (layout === "speaker" && state.videoStreams.length > 0) {
      const speakerIndex = highlighted ?? 0;
      const stream = state.videoStreams[Number(speakerIndex)];
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl aspect-vide bg-black rounded-lg overflow-hidden ring-4 mb-14 ring-blue-400"
            onDoubleClick={() => handleHighlight(Number(speakerIndex))}
            style={{ minHeight: "200px" }}
          >
            <VideoPlayer
              stream={stream.stream!}
              isLocal={stream.userId === userId}
              username={stream.username}
              isMuted={stream.isMuted || false}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`grid gap-4 p-5 min-w-screen h-full overflow-hidden ${
          layout === "everyone"
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center"
            : "hidden"
        }`}
      >
        {state.videoStreams.map((videoStream, index) => (
          <div
            key={videoStream.userId}
            className={`relative bg-black overflow-hidden rounded-lg transition-all duration-300 ${ // aspect-video ?
              highlighted === index
                ? "ring-4 ring-blue-400 scale-105 z-10"
                : "hover:ring-2 hover:ring-white"
            }`}
            onDoubleClick={() => handleHighlight(index)}
          >
            <VideoPlayer
              stream={videoStream.stream!}
              isLocal={videoStream.userId === userId}
              username={videoStream.username}
              isMuted={videoStream.isMuted || false}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-w-screen text-white flex flex-col relative overflow-hidden">
      <MeetingNavbar 
      layout={layout}
      handleLayoutChange={handleLayoutChange}
      />

      <div className="flex-1">{renderVideos()}</div>

      <ChatPanel socketRef={socketRef} isOpen={state.isChatActive} />

      <div className="bg-white .......">
        <MeetingFooter socketRef={socketRef} />
      </div>
    </div>
  );
}

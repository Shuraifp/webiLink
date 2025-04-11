import { VideoPlayer } from "./VideoPlayer";
import MeetingFooter from "./MeetingFooter";
import MeetingNavbar from "./MeetingNavbar";

interface VideoStream {
  userId: string;
  stream: MediaStream;
}

interface Props {
  roomId: string;
  statusMessage: string | null;
  videoStreams: VideoStream[];
  userId: string;
}

export default function MeetingRoomUI({
  roomId,
  statusMessage,
  videoStreams,
  userId,
}: Props) {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <MeetingNavbar />
      <h1 className="mb-5">Meeting Room: {roomId}</h1>
      {statusMessage && (
        <div
          className={`mb-2 p-2 rounded ${
            statusMessage.startsWith("Error") ? "text-red-500 bg-gray-700" : "text-white bg-gray-700"
          }`}
        >
          {statusMessage}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 p-5 rounded-lg">
        {videoStreams.map((videoStream) => (
          <div
            key={videoStream.userId}
            className="border-2 border-gray-500 rounded-lg overflow-hidden bg-black"
          >
            <VideoPlayer
              stream={videoStream.stream}
              isLocal={videoStream.userId === userId}
            />
            <div className="p-2 text-center bg-gray-700">
              {videoStream.userId}
            </div>
          </div>
        ))}
      </div>
      <MeetingFooter />
    </div>
  );
}
import { useEffect, useRef } from "react";


export function VideoPlayer({
  stream,
  isLocal,
}: {
  stream: MediaStream;
  isLocal: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      style={{
        width: "100%",
        height: "auto",
        transform: isLocal ? "scaleX(-1)" : "none",
      }}
    />
  );
}

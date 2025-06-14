"use client";

import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io-client";
import { userApiWithAuth } from "@/lib/api/axios";
import { AxiosError } from "axios";

// interface RecordingEventPayload {
//   roomId: string;
//   userId: string;
//   username: string;
//   recordingId: string;
//   timestamp: string;
//   duration?: number;
//   shareableLink?: string;
// }
interface UseRecordingProps {
  socketRef: React.RefObject<Socket>;
  roomId: string;
  currentUserId: string;
  currentUsername: string;
}
// interface RecordingError {
//   message: string;
//   code?: string;
// }
export const useRecording = ({
  roomId,
  currentUserId,
  currentUsername,
}: UseRecordingProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  // const [processingRecording, setProcessingRecording] =
  //   useState<boolean>(false);
  // const [recordingURL, setRecordingURL] = useState<string | null>(null);
  // const [recordingId, setRecordingId] = useState<string | null>(null);
  // const [error, setError] = useState<RecordingError | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // const emitSocketEvent = (
  //   eventName: string,
  //   payload: RecordingEventPayload
  // ): void => {
  //   try {
  //     if (!socketRef.current?.connected) {
  //       console.warn("Socket is not connected, event not sent:", eventName);
  //       return;
  //     }
  //     socketRef.current.emit(eventName, payload);
  //   } catch (error) {
  //     console.error(`Error emitting socket event ${eventName}:`, error);
  //   }
  // };

  const startRecording = async (): Promise<void> => {
    // setError(null);
    recordedChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        throw new Error("Your browser doesn't support screen recording");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" }, // cursor: "always", omited
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;

      const newRecordingId = uuidv4();
      // setRecordingId(newRecordingId);

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        // stopRecording();
      };

      mediaRecorder.onstop = async () => {
        // setProcessingRecording(true);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // if (recordedChunksRef.current.length === 0) {
        //   setProcessingRecording(false);
        //   setError({
        //     message: "No recording data was captured",
        //     code: "NO_DATA",
        //   });
        //   return;
        // }

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        try {
          const uploadedUrl = await uploadToBackend(blob, newRecordingId);
          if (!uploadedUrl) {
            throw new Error("Failed to get URL after upload");
          }

          // const shareableLink = generateShareableLink(newRecordingId);

          // emitSocketEvent("recording-complete", {
          //   roomId,
          //   userId: currentUserId,
          //   username: currentUsername,
          //   recordingId: newRecordingId,
          //   timestamp: new Date().toISOString(),
          //   duration: recordingTime,
          //   shareableLink,
          // });

          // setRecordingURL(uploadedUrl);
        } catch (error) {
          console.error("Error processing recording:", error);
          // if (error instanceof Error) {
          //   setError({
          //     message: error.message || "Failed to save recording",
          //   });
          // } else {
          //   setError({
          //     message: String(error) || "Failed to save recording",
          //     code: "UPLOAD_ERROR",
          //   });
          // }
        } finally {
          // setProcessingRecording(false);
        }
      };

      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

      // emitSocketEvent("recording-started", {
      //   roomId,
      //   userId: currentUserId,
      //   username: currentUsername,
      //   recordingId: newRecordingId,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      console.error("Error starting screen recording:", error);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping recording:", error);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
        // setProcessingRecording(false);
      }
    }
  };

  const getSupportedMimeType = (): string => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "video/webm";
  };

  const uploadToBackend = async (
    blob: Blob,
    recordingId: string
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("recording", blob, `${recordingId}.webm`);
      formData.append("roomId", roomId);
      formData.append("userId", currentUserId);
      formData.append("username", currentUsername);
      formData.append("recordingDate", new Date().toISOString());

      const res = await userApiWithAuth.post("/recordings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data.data.url) {
        throw new Error("No URL returned from backend");
      }
      return res.data.data.url;
    } catch (error) {
      console.error(
        "Upload error:",
        (error as AxiosError).response?.data ||
          (error as Error).message ||
          error
      );
      let message = "Failed to upload recording";
      const code = "BACKEND_UPLOAD_ERROR";

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      } else {
        message = String(error) || message;
      }

      throw { message, code };
    }
  };

  // const generateShareableLink = (recordingId: string): string => {
  //   const baseUrl = window.location.origin;
  //   return `${baseUrl}/shared-recording/${recordingId}`;
  // };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // const resetRecording = (): void => {
  //   setError(null);
  //   setRecordingTime(0);
  //   setRecordingURL(null);
  //   setRecordingId(null);
  // };

  return {
    isRecording,
    recordingTime,
    // processingRecording,
    // recordingURL,
    // recordingId,
    // error,
    startRecording,
    stopRecording,
    formatTime,
    // resetRecording,
  //   generateShareableLink: () =>
  //     recordingId ? generateShareableLink(recordingId) : null,
  };
};

export default useRecording;

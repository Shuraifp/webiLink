"use client";

import { useEffect, useRef } from 'react';

const LocalVideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }, 
          audio: true
        });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }, // Fallback
                audio: true
            });
            currentStream = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
            }
        } catch (fallbackErr) {
             console.error("Fallback Error accessing media devices:", fallbackErr);
        }
      }
    };

    getMedia();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      // if (videoRef.current) {
      //   videoRef.current.srcObject = null;
      // }
    };
  }, []);

  return (
    <div className='bg-gray-900 p-2 mt-4 max-w-[580px] rounded-xl' >
      <h4 style={{ marginTop: '0', marginLeft: '4px', marginBottom: '6px', color: '#555', fontWeight: 500 }}>
        Camera Preview
      </h4>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%', 
          display: 'block',
          borderRadius: '6px', 
          transform: 'scaleX(-1)', 
          backgroundColor: '#000' 
        }}
      />
    </div>
  );
};

export default LocalVideoPreview;
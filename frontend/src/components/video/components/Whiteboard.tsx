"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
// import { getSocket } from "@/lib/socket";
import { DrawEvent, DrawingState, SocketEvent } from "@/types/chatRoom";
import { useReducedState } from "@/hooks/useReducedState";

interface WhiteboardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  socketRef: React.RefObject<Socket>;
}

export default function Whiteboard({ containerRef,socketRef }: WhiteboardProps) {
  // const socketRef = useRef<Socket>(getSocket());
  const socket = socketRef.current;
  const { state } = useReducedState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [color] = useState("#000000");
  const [lineWidth] = useState(2);
  const drawingActionsRef = useRef<DrawEvent[]>([]);

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);
    console.log("SocketEvent.Whiteboard_DRAW:", SocketEvent.Whiteboard_DRAW);
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const container = containerRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      const prevWidth = canvas.width;
      const prevHeight = canvas.height;
      canvas.width = container.clientWidth || 100;
      canvas.height = container.clientHeight || 300;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";

      const scaleX = canvas.width / (prevWidth || canvas.width);
      const scaleY = canvas.height / (prevHeight || canvas.height);
      replayDrawings(scaleX, scaleY);
    };

    const replayDrawings = (scaleX: number, scaleY: number) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingActionsRef.current.forEach((action) => {
        const scaledX = action.x * scaleX;
        const scaledY = action.y * scaleY;
        if (action.type === DrawingState.START) {
          ctx.beginPath();
          ctx.moveTo(scaledX, scaledY);
        } else if (action.type === DrawingState.DRAW) {
          ctx.lineTo(scaledX, scaledY);
          ctx.stroke();
        } else if (action.type === DrawingState.END) {
          ctx.closePath();
        }
      });
    };

    resizeCanvas();
    setContext(ctx);

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [color, lineWidth, containerRef]);

  useEffect(() => {
    const handleDraw = (data: DrawEvent) => {
      console.log("Received whiteboard-draw:", data);
      if (!context) return;

      drawingActionsRef.current.push(data); // Store the action
      if (data.type === DrawingState.START) {
        context.beginPath();
        context.moveTo(data.x, data.y);
      } else if (data.type === DrawingState.DRAW) {
        context.lineTo(data.x, data.y);
        context.stroke();
      } else if (data.type === DrawingState.END) {
        context.closePath();
      }
    };

    socket.on(SocketEvent.Whiteboard_DRAW, handleDraw);
    console.log("Socket listener set up for:", SocketEvent.Whiteboard_DRAW);

    return () => {
      socket.off(SocketEvent.Whiteboard_DRAW, handleDraw);
    };
  }, [socket, context]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);

    const drawEvent: DrawEvent = { roomId: state.roomId, x, y, type: DrawingState.START, color, lineWidth };
    drawingActionsRef.current.push(drawEvent);
    socket.emit("whiteboard-draw", drawEvent);
    console.log("Emitting whiteboard-draw (start):", drawEvent);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    context.lineTo(x, y);
    context.stroke();

    const drawEvent: DrawEvent = { roomId: state.roomId, x, y, type: DrawingState.DRAW, color, lineWidth };
    drawingActionsRef.current.push(drawEvent);
    socket.emit("whiteboard-draw", drawEvent, () => {
      console.log("Draw event emitted:", drawEvent);
    }
    );
    console.log("Emitting whiteboard-draw (draw):", drawEvent);
  };

  const stopDrawing = () => {
    if (!context) return;

    context.closePath();
    setIsDrawing(false);

    const drawEvent: DrawEvent = { roomId: state.roomId, x: 0, y: 0, type: DrawingState.END, color, lineWidth };
    drawingActionsRef.current.push(drawEvent);
    socket.emit(SocketEvent.Whiteboard_DRAW, drawEvent);
    console.log("Emitting whiteboard-draw (end):", drawEvent);
  };

  return (
    <div
      className="canvas-container"
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#ddd",
        zIndex: 30,
        marginRight: "10px",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ display: "block", width: "100%", height: "100%", position: "relative", zIndex: 31 }}
      />
    </div>
  );
}
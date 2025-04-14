import { Server } from "socket.io";
import { RoomManager } from "./roomManager";
import { RoomService } from "../services/roomService";
import { RoomRepository } from "../repositories/RoomRepository";
import Room from "../models/mainRoomModel";

export default (io: Server) => {
  const roomManager = new RoomManager(io, new RoomService(new RoomRepository(Room)));

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (data) => roomManager.handleJoin(socket, data));
    socket.on("leave-room", (data) => roomManager.handleLeave(socket, data));
    socket.on("offer", (data) => roomManager.handleSignaling(socket, "offer", data));
    socket.on("answer", (data) => roomManager.handleSignaling(socket, "answer", data));
    socket.on("ice-candidate", (data) => roomManager.handleSignaling(socket, "ice-candidate", data));
    socket.on("toggle-mute", (data) => roomManager.handleToggleMute(socket, data));
    socket.on("ready-for-stream", (data) => roomManager.handleReadyForStream(socket, data));
    socket.on("disconnect", () => roomManager.handleDisconnect(socket));
  });
};
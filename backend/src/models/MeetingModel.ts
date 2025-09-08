import mongoose, { Schema } from "mongoose";
import { IMeeting } from "../types/models";



const meetingSchema = new Schema<IMeeting>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    hostId: {  
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
        avatar: {
          type: String,
          default: null,
        },
        joinTime: {
          type: Date,
          required: true,
          default: Date.now,
        },
        leaveTime: {
          type: Date,
          default: null,
        },
        role: {
          type: String,
          enum: ["host", "joinee"],
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeeting>("Meeting", meetingSchema);

"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { createRoom, fetchRooms } from "@/lib/api/user/roomApi";
import axios from "axios";
import toast from "react-hot-toast";
import { isPremiumUser } from "@/lib/api/user/planApi";

interface CreateMeetingProps {
  onSectionChange: Dispatch<SetStateAction<string>>;
  prevSection: string;
}

export default function CreateMeeting({
  onSectionChange,
  prevSection,
}: CreateMeetingProps) {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingType, setMeetingType] = useState<"one-time" | "reusable">(
    "reusable"
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [timeZone, setTimeZone] = useState("GMT");
  const [errors, setErrors] = useState({
    meetingTitle: "",
    date: "",
    startTime: "",
  });
  const [isPremium, setIsPremium] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const checkingSubscriptionStatus = async () => {
      try {
        const res = await isPremiumUser();
        if (res.data.isPremiumUser) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };
    const getRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res);
      } catch (err) {
        console.log("error Fetching rooms: ", err);
      }
    };
    checkingSubscriptionStatus();
    getRooms();
  }, []);

  const handleSave = async () => {
    const newErrors = { meetingTitle: "", date: "", startTime: "" };
    setErrors(newErrors);
    if (meetingType === "reusable") {
      if (meetingTitle === "") {
        newErrors.meetingTitle = "Title is required for reusable meetings";
        setErrors(newErrors);
        return;
      }
      if (rooms.length > 0 && !isPremium) {
        toast.error(
          "You have reached the limit of 1 reusable room. Please upgrade to premium to create more rooms."
        );
        return;
      }
      try {
        await createRoom({ name: meetingTitle });
        onSectionChange("rooms");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    }
  };

  const handleCancel = () => {
    onSectionChange(prevSection);
  };

  return (
    <div className="pt-4 pr-3">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800">
          {prevSection === "rooms" ? "create a Room" : "schedule a meeting"}
        </h2>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 cursor-pointer rounded-lg hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting title
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            maxLength={100}
            className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Max 100 characters"
          />
          {errors.meetingTitle && (
            <p className="text-sm text-red-400">{errors.meetingTitle}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting type
          </label>
          <div className="space-y-2">
            {/* <label className="flex items-center">
              <input
                type="radio"
                name="meetingType"
                value="one-time"
                checked={meetingType === "one-time"}
                onChange={() => setMeetingType("one-time")}
                className="mr-2"
              />
              <span className="text-gray-800">One-time meeting</span>
              <span className="ml-2 text-gray-600 text-sm">
                Pick a date and meet using a temporary link.
              </span>
            </label> */}
            {meetingType === "one-time" && (
              <div className="ml-6 space-y-2">
                <div>
                  <label className="block text-sm text-gray-800">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm text-gray-800">Start</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 border border-gray-400 rounded-lg"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm text-gray-8800">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-2 border border-gray-400 rounded-lg"
                    >
                      <option value="30">30 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    Time zone
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full p-2 border border-gray-400 rounded-lg"
                  >
                    <option value="GMT">GMT, Greenwich Mean Time (GMT0)</option>
                    {/* <option value="UTC">UTC</option> */}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    {startTime && (
                      <p>
                        Your invite will say this meeting starts at {startTime}{" "}
                        AM
                      </p>
                    )}
                  </p>
                </div>
              </div>
            )}
            <label className="flex items-center">
              <input
                type="radio"
                name="meetingType"
                value="reusable"
                checked={meetingType === "reusable"}
                onChange={() => setMeetingType("reusable")}
                className="mr-2"
              />
              <span className="text-gray-700">Reusable meeting room</span>
              <span className="ml-2 text-gray-500 text-sm">
                Meet whenever you like. The link never expires.
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

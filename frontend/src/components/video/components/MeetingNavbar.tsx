"use client";
import { useState } from "react";
import { Info, Lock, Unlock, User, MessageCircle, MoreVertical } from "lucide-react";

const MeetingNavbar = () => {
  const [isInfoActive, setIsInfoActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isMoreActive, setIsMoreActive] = useState(false);

  return (
    <div className="flex justify-between items-center p-2 bg-gray-800 mb-5">
      <div className="flex items-center space-x-4">
        <button
          className={`hover:text-white cursor-pointer ${
            isInfoActive ? "text-blue-600" : "text-gray-300"
          }`}
          onClick={() => setIsInfoActive(!isInfoActive)}
        >
          <Info size={20} />
          skjkl
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            isLocked ? "text-green-400" : ""
          }`}
          onClick={() => setIsLocked(!isLocked)}
        >
          <Lock size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            !isLocked ? "text-red-400" : ""
          }`}
          onClick={() => setIsLocked(!isLocked)}
        >
          <Unlock size={20} />
        </button>
        <select className="bg-gray-700 text-white focus:outline-0 p-1 rounded">
          <option>Everyone</option>
          <option>{`Who's talking`}</option>
          <option>Active cameras</option>
          <option>Hide everyone</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className={`text-gray-300 hover:text-white ${
            isUserActive ? "text-blue-400" : ""
          }`}
          onClick={() => setIsUserActive(!isUserActive)}
        >
          <User size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            isChatActive ? "text-blue-400" : ""
          }`}
          onClick={() => setIsChatActive(!isChatActive)}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            isMoreActive ? "text-blue-400" : ""
          }`}
          onClick={() => setIsMoreActive(!isMoreActive)}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default MeetingNavbar;
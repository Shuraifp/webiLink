"use client";

import {
  Info,
  Lock,
  Unlock,
  User,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType } from "@/lib/MeetingContext";

interface Props {
  handleLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  layout: string;
}

const MeetingNavbar = ({ handleLayoutChange, layout }: Props) => {
  const { state, dispatch } = useReducedState();

  return (
    <div className="flex justify-between items-center p-2 bg-gray-800 mb-2">
      <div className="flex items-center space-x-4">
        <button
          className={`hover:text-white cursor-pointer ${
            state.isInfoActive ? "text-blue-600" : "text-gray-300"
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_INFO })}
        >
          <Info size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            state.isLocked ? "text-green-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_LOCK })}
        >
          <Lock size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            !state.isLocked ? "text-red-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_LOCK })}
        >
          <Unlock size={20} />
        </button>
        <select
          className="bg-gray-700 text-white focus:outline-0 p-1 rounded"
          value={layout}
          onChange={handleLayoutChange}
        >
          <option value={"everyone"}>Everyone</option>
          <option value={"speaker"}>{`Who's talking`}</option>
          <option value={"hide"}>Hide everyone</option>
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <button
          className={`text-gray-300 hover:text-white ${
            state.isUserActive ? "text-blue-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_USER })}
        >
          <User size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            state.isChatActive ? "text-blue-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_CHAT })}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            state.isMoreActive ? "text-blue-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_MORE })}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};
export default MeetingNavbar;

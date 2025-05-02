"use client";

import { User, MessageCircle, MoreVertical, MessageSquare } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType, PanelType } from "@/lib/MeetingContext";
import BreakoutRoomManager from "./BreakoutRoomManager";
import { Socket } from "socket.io-client";

interface Props {
  handleLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  layout: string;
  socketRef: Socket;
}

const MeetingNavbar = ({ socketRef }: Props) => {
  const { state, dispatch } = useReducedState();
  // const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const togglePanel = (panel: PanelType) => {
    if (state.isSidebarOpen && state.activePanel === panel) {
      dispatch({ type: MeetingActionType.CLOSE_SIDEBAR });
    } else {
      dispatch({ type: MeetingActionType.OPEN_SIDEBAR, payload: { panel } });
    }
  };

  return (
    <div className={`flex justify-between items-center p-2 bg-gray-800 mb-3 ${state.isLeftMeeting ? "hidden" : ""}`}>
      <div className="flex items-center space-x-4">
        <BreakoutRoomManager socketRef={socketRef} />
      </div>
      <div className="flex items-center space-x-4">
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.USERS ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.USERS);
          }}
        >
          <User size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.CHAT ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.CHAT);
          }}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.POLLS_AND_QA ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.POLLS_AND_QA);
          }}
        >
          <MessageSquare size={20} />
        </button>
        <div className="relative">
          <button
          // className={`text-gray-300 pt-2 hover:text-white cursor-pointer

          // onClick={() => {
          //   toggleSidebar();
          //   toggleMoreMenu();
          // }
          >
            <MoreVertical size={20} />
          </button>
          {/* {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 cursor-pointer rounded-md shadow-lg z-10">
            nothing
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default MeetingNavbar;

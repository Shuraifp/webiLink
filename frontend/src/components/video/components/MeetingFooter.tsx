import { 
  Video, 
  Smile, 
  Hand, 
  Mic, 
  Camera, 
  Share2, 
  Settings, 
  LogOut 
} from "lucide-react";

const MeetingFooter = () => {
  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex gap-4 p-2 bg-gray-800 rounded-lg">
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Video size={20} /> Record
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Smile size={20} /> Reactions
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Hand size={20} /> Rise
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Mic size={20} /> Mic
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Camera size={20} /> Cam
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Share2 size={20} /> Share
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Settings size={20} /> Tools
      </button>
      <button className="flex items-center gap-1 text-red-500 hover:text-red-300">
        <LogOut size={20} /> Leave
      </button>
    </div>
  );
};

export default MeetingFooter;
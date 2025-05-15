import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { userApiWithAuth } from "../../lib/api/axios";
import { toast } from "react-hot-toast";
import axios from "axios";

interface Recording {
  recordingId: string;
  roomId: string;
  createdAt: string;
  url: string;
}

interface RecordingsProps {
  onSectionChanges: Dispatch<SetStateAction<string>>;
}

const Recordings: React.FC<RecordingsProps> = ({ onSectionChanges }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await userApiWithAuth.get("/recordings");
        setRecordings(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    const checkingSubscriptionStatus = async () => {
      try {
        const res = await userApiWithAuth.get("/users/isPremium");
        if (res.data.data.isPremiumUser) {
          setIsPremium(true);
          fetchRecordings();
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkingSubscriptionStatus();
  }, []);

  const handleCreatePlan = () => {
    onSectionChanges("upgrade");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading recordings...</p>
      </div>
    );
  }

  if (!loading && !isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Available only for Premium users.
          </p>
          <button
            onClick={handleCreatePlan}
            className="px-6 py-3 rounded-lg bg-gradient-to-r raleway from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <p>No recordings found.</p>;
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {recordings.map((recording) => (
        <div
          key={recording.recordingId}
          className="bg-white p-4 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold">
            Recording<span className="font-medium ml-2">{recording.recordingId}</span>
          </h3>
          <p className="text-sm text-gray-600">Room: {recording.roomId}</p>
          <p className="text-sm text-gray-600">
            Recorded: {new Date(recording.createdAt).toLocaleString()}
          </p>
          <video controls src={recording.url} className="w-full mt-2 rounded" />
        </div>
      ))}
    </div>
  );
};

export default Recordings;

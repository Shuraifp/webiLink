"use client";

import { UserData } from "@/types/type";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Users,
  Video,
  Download,
  Eye,
  ChevronDown,
  X
} from "lucide-react";

interface HistoryProps {
  user: UserData;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

interface MeetingHistory {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  participants: number;
  type: 'hosted' | 'attended';
  status: 'completed' | 'ongoing' | 'cancelled';
  hostName?: string; // for attended meetings
  hasRecording: boolean;
  recordingUrl?: string;
  participantsList?: string[];
}

type FilterType = 'all' | 'hosted' | 'attended';
type StatusFilter = 'all' | 'completed' | 'ongoing' | 'cancelled';

export default function History({
  user,
  onSectionChange,
  selectedSection,
  setPrevSection,
}: HistoryProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [meetings, setMeetings] = useState<MeetingHistory[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistory | null>(null);

  useEffect(() => {
    const fetchMeetingHistory = async () => {
      setLoading(true);
      try {
       
        setTimeout(() => {
          const mockMeetings: MeetingHistory[] = [
            {
              id: "1",
              roomName: "Team Standup",
              date: "2024-12-15",
              startTime: "09:00",
              endTime: "09:30",
              duration: 30,
              participants: 6,
              type: "hosted",
              status: "completed",
              hasRecording: true,
              recordingUrl: "/recordings/1",
              participantsList: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown"]
            },
            {
              id: "2",
              roomName: "Project Review",
              date: "2024-12-14",
              startTime: "14:00",
              endTime: "14:45",
              duration: 45,
              participants: 4,
              type: "attended",
              status: "completed",
              hostName: "John Smith",
              hasRecording: false,
              participantsList: ["John Smith", "You", "Alice Cooper", "Bob Wilson"]
            },
            {
              id: "3",
              roomName: "Client Presentation",
              date: "2024-12-13",
              startTime: "16:00",
              endTime: "17:30",
              duration: 90,
              participants: 3,
              type: "hosted",
              status: "completed",
              hasRecording: true,
              recordingUrl: "/recordings/3",
              participantsList: ["Client A", "Client B", "You"]
            },
            {
              id: "4",
              roomName: "Weekly Sync",
              date: "2024-12-12",
              startTime: "10:00",
              endTime: "10:25",
              duration: 25,
              participants: 8,
              type: "attended",
              status: "completed",
              hostName: "Sarah Johnson",
              hasRecording: false,
              participantsList: ["Sarah Johnson", "Team Member 1", "Team Member 2", "You", "Others..."]
            },
            {
              id: "5",
              roomName: "1-on-1 Meeting",
              date: "2024-12-11",
              startTime: "11:00",
              endTime: "11:45",
              duration: 45,
              participants: 2,
              type: "hosted",
              status: "completed",
              hasRecording: false,
              participantsList: ["Manager", "You"]
            },
            {
              id: "6",
              roomName: "Training Session",
              date: "2024-12-10",
              startTime: "13:00",
              endTime: "14:30",
              duration: 90,
              participants: 12,
              type: "attended",
              status: "completed",
              hostName: "Training Team",
              hasRecording: true,
              recordingUrl: "/recordings/6",
              participantsList: ["Training Team", "You", "10 Others..."]
            }
          ];
          
          setMeetings(mockMeetings);
          setFilteredMeetings(mockMeetings);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching meeting history: ", err);
        setLoading(false);
      }
    };

    fetchMeetingHistory();
  }, []);

  // Filter meetings based on search and filters
  useEffect(() => {
    let filtered = meetings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.hostName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    setFilteredMeetings(filtered);
  }, [searchTerm, typeFilter, statusFilter, meetings]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'hosted' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const handleViewDetails = (meeting: MeetingHistory) => {
    setSelectedMeeting(meeting);
  };

  const handleDownloadRecording = (recordingUrl: string) => {
    // TODO: Implement download logic
    console.log('Downloading recording:', recordingUrl);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading meeting history...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl raleway font-semibold ml-1 text-gray-600">
          Meeting History
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition cursor-pointer ${
              showFilters ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Meetings</option>
                <option value="hosted">Hosted by Me</option>
                <option value="attended">Attended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Meeting List */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
        {filteredMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(meeting.type)}`}>
                    {meeting.type === 'hosted' ? 'HOSTED' : 'ATTENDED'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{meeting.roomName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.startTime} - {meeting.endTime} ({formatDuration(meeting.duration)})
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {meeting.participants} participants
                    </div>
                  </div>
                  {meeting.type === 'attended' && meeting.hostName && (
                    <p className="text-sm text-gray-400 mt-1">Hosted by {meeting.hostName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {meeting.hasRecording && (
                  <button
                    onClick={() => handleDownloadRecording(meeting.recordingUrl!)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                    title="Download Recording"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(meeting)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMeetings.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No meetings found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Your meeting history will appear here once you start hosting or joining meetings"}
            </p>
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 z-20 min-h-screen flex justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white w-full max-w-2xl mx-4 py-6 px-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl raleway font-semibold text-gray-700">
                Meeting Details
              </h2>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="bg-white focus:outline-none rounded-sm text-red-700 hover:text-red-800 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{selectedMeeting.roomName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(selectedMeeting.type)}`}>
                    {selectedMeeting.type === 'hosted' ? 'HOSTED' : 'ATTENDED'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedMeeting.status)}`}>
                    {selectedMeeting.status.toUpperCase()}
                  </span>
                  {selectedMeeting.hasRecording && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      RECORDED
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date & Time
                  </h4>
                  <p className="text-gray-600">{new Date(selectedMeeting.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{selectedMeeting.startTime} - {selectedMeeting.endTime}</p>
                  <p className="text-sm text-gray-500">Duration: {formatDuration(selectedMeeting.duration)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participants ({selectedMeeting.participants})
                  </h4>
                  {selectedMeeting.type === 'attended' && selectedMeeting.hostName && (
                    <p className="text-sm text-gray-600 mb-2">Host: {selectedMeeting.hostName}</p>
                  )}
                  <div className="space-y-1">
                    {selectedMeeting.participantsList?.map((participant, index) => (
                      <p key={index} className="text-sm text-gray-600">• {participant}</p>
                    ))}
                  </div>
                </div>
              </div>

              {selectedMeeting.hasRecording && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Recording Available
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    This meeting was recorded and is available for download.
                  </p>
                  <button
                    onClick={() => handleDownloadRecording(selectedMeeting.recordingUrl!)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Recording
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
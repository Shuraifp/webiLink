"use client";

import { useState, useEffect } from "react";
import { Download, X, Trash2, Image } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { getMeetings } from "@/lib/api/user/meetings";
import toast from "react-hot-toast";
import { MeetingActionType } from "@/context/MeetingContext";
import jsPDF from "jspdf";

interface MeetingHistory {
  id: string;
  roomName: string;
  date: string;
  hostName?: string;
}

export default function NotesPanel({ roomId }: { roomId: string }) {
  const { state, dispatch } = useReducedState();
  const [meeting, setMeeting] = useState<MeetingHistory | null>(null);

  // Initialize notes from MeetingContext
  const notesBlocks = state.notes;

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const res = await getMeetings(1, 10);
        console.log(res);
        const meetingData = res.data.meetings.find(
          (m: MeetingHistory) => m.roomName === roomId
        );
        if (meetingData) {
          setMeeting(meetingData);
        } else {
          toast.error("Meeting details not found.");
        }
      } catch (err) {
        console.error("Error fetching meeting details: ", err);
        toast.error("Failed to fetch meeting details.");
      }
    };

    if (roomId) {
      fetchMeetingDetails();
    }
  }, [roomId]);

  const handleTextChange = (index: number, value: string) => {
    const updatedBlocks = [...notesBlocks];
    updatedBlocks[index] = { type: "text", content: value };
    dispatch({
      type: MeetingActionType.SET_NOTES,
      payload: updatedBlocks,
    });
  };

  const handleImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const updatedBlocks = [...notesBlocks];
        updatedBlocks.splice(index + 1, 0, {
          type: "image",
          src: base64Image,
        });
        updatedBlocks.splice(index + 2, 0, { type: "text", content: "" });
        dispatch({
          type: MeetingActionType.SET_NOTES,
          payload: updatedBlocks,
        });
        toast.success("Image added to notes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiscard = () => {
    dispatch({ type: MeetingActionType.CLEAR_NOTES });
    toast.success("Notes discarded.");
  };

  const isEmpty = () => {
    return notesBlocks.every(
      (block) =>
        (block.type === "text" && !block.content.trim()) ||
        (block.type === "image" && !block.src)
    );
  };

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.setTextColor(234, 179, 8);
      doc.text("w", 85, 20);
      doc.setTextColor(0, 0, 0);
      doc.text("ebiLink", 93, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.text("WebiLink Meeting Note", 105, 50, { align: "center" });
      doc.setFontSize(10);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })} at ${new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        })}`,
        105,
        60,
        { align: "center" }
      );

      doc.setFontSize(12);
      let yPos = 80;
      if (meeting) {
        doc.text(`Meeting Name: ${meeting.roomName}`, 20, yPos);
        yPos += 10;
        doc.text(
          `Date: ${new Date(meeting.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          20,
          yPos
        );
        yPos += 10;
        doc.text(`Host: ${meeting.hostName || "Unknown"}`, 20, yPos);
        yPos += 20;
      } else {
        doc.text("Meeting Details: Not available", 20, yPos);
        yPos += 20;
      }

      doc.setFontSize(14);
      doc.text("Notes", 20, yPos);
      yPos += 10;

      for (const block of notesBlocks) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        if (block.type === "text" && block.content.trim()) {
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(block.content, 170);
          doc.text(splitText, 20, yPos);
          yPos += splitText.length * 7; // Approx 7 units per line
        } else if (block.type === "image") {
          const imgProps = doc.getImageProperties(block.src);
          const imgWidth = 50;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          doc.addImage(block.src, "PNG", 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 5;

          yPos += 5;
        }
      }

      if (yPos === 90) {
        doc.setFontSize(12);
        doc.text("No notes taken.", 20, yPos);
      }

      doc.save(`WebiLink_Notes_${roomId}.pdf`);
      toast.success("Notes downloaded as PDF.");
    } catch (err) {
      console.error("Error generating PDF: ", err);
      toast.error("Failed to download notes as PDF.");
    }
  };

  return (
    <div className="p-4 flex h-full flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>
        <button
          className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
          onClick={() => dispatch({ type: MeetingActionType.CLOSE_SIDEBAR })}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
        {notesBlocks.map((block, index) => (
          <div key={index} className="space-y-2">
            {block.type === "text" ? (
              <>
                <textarea
                  placeholder="Write your notes here..."
                  value={block.content}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="w-full p-2 bg-gray-900 text-white rounded-sm no-scrollbar focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                  rows={4}
                />
                {notesBlocks.length - 1 === index && (
                  <label className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white px-4 py-2 rounded-sm flex justify-center items-center">
                    <Image size={16} className="mt-2" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(index, e)}
                    />
                  </label>
                )}
              </>
            ) : (
              <img
                src={block.src}
                alt={`Uploaded image ${index}`}
                className="w-32 h-32 object-cover rounded-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center pt-2 justify-end space-x-3">
        <button
          onClick={handleDiscard}
          className="bg-red-800 hover:bg-red-900 cursor-pointer text-white px-4 py-2 rounded-sm flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isEmpty()}
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={downloadPDF}
          className="bg-gray-950 hover:bg-yellow-600 cursor-pointer text-white px-4 py-2 rounded-sm flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isEmpty()}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  ThumbsUp,
  Send,
  Lock,
  CheckCircle,
  Trash2,
  X,
  MessageSquare,
  Mic,
} from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { Question, QuestionStatus, Role } from "@/types/chatRoom";
import toast from "react-hot-toast";

interface Props {
  socketRef: Socket | null;
}

export default function QAPanel({ socketRef }: Props) {
  const { state } = useReducedState();
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAnswerPopup, setShowAnswerPopup] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    if (!socketRef) return;
    socketRef.emit("fetch-questions", { roomId: state.roomId });
  }, [socketRef, state.roomId]);

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    const question: Question = {
      id: Date.now(),
      text: newQuestion,
      userId: state.currentUserId,
      username: state.currentUsername,
      timestamp: Date.now(),
      status: QuestionStatus.OPEN,
      isAnonymous,
      upvotes: [],
      isVisible: false,
      isAnswered: false,
    };

    socketRef?.emit("ask-question", { roomId: state.roomId, question });
    setNewQuestion("");
    setIsAnonymous(false);
  };

  const handleUpvoteQuestion = (questionId: number) => {
    socketRef?.emit("upvote-question", {
      roomId: state.roomId,
      questionId,
      userId: state.currentUserId,
    });
  };

  const handlePublishQuestion = (questionId: number) => {
    socketRef?.emit("publish-question", { roomId: state.roomId, questionId });
  };

  const handleDismissQuestion = (questionId: number) => {
    socketRef?.emit("dismiss-question", { roomId: state.roomId, questionId });
  };

  const openAnswerPopup = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowAnswerPopup(true);
    setAnswerText("");
  };

  const closeAnswerPopup = () => {
    setShowAnswerPopup(false);
    setSelectedQuestionId(null);
    setAnswerText("");
  };

  const handleSubmitAnswer = () => {
    if (selectedQuestionId && answerText.trim()) {
      socketRef?.emit("answer-question", {
        roomId: state.roomId,
        questionId: selectedQuestionId,
        answer: answerText.trim(),
        answeredBy: state.currentUserId,
      });
      closeAnswerPopup();
    }
  };

  const handleAnswerVerbally = () => {
    if (selectedQuestionId) {
      socketRef?.emit("answer-question", {
        roomId: state.roomId,
        questionId: selectedQuestionId,
        answer: undefined,
        answeredBy: state.currentUserId,
      });
      closeAnswerPopup();
    }
  };

  const handleCloseQuestion = (questionId: number) => {
    socketRef?.emit("close-question", { roomId: state.roomId, questionId });
  };

  const sortedQuestions = [...state.questions].sort(
    (a, b) => b.upvotes.length - a.upvotes.length
  );

  const visibleQuestions =
    state.currentUserRole === Role.HOST
      ? sortedQuestions
      : sortedQuestions.filter(
          (q) => q.isVisible || q.userId === state.currentUserId
        );

  return (
    <>
      {state.isQAEnabled ? (
        <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {state.currentUserRole === Role.JOINEE && (
            <div className="mb-4">
              <textarea
                placeholder="Ask a question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full p-2 bg-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
              <label className="flex items-center mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="appearance-none h-5 w-5 border-2 border-gray-600 rounded-sm bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                />
                <span className="ml-2 text-sm text-gray-300">Ask anonymously</span>
              </label>
              <button
                onClick={handleAskQuestion}
                className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 mt-2 rounded-sm cursor-pointer w-full flex items-center justify-center gap-2"
              >
                <Send size={16} /> Ask Question
              </button>
            </div>
          )}
          {visibleQuestions.map((question) => (
            <div key={question.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  {question.userId === state.currentUserId && !question.isAnonymous
                    ? "You"
                    : question.userId === state.currentUserId &&
                      question.isAnonymous
                    ? "You (Anonymous)"
                    : question.isAnonymous
                    ? "Anonymous"
                    : question.username}{" "}
                  • {new Date(question.timestamp).toLocaleTimeString()}
                </p>
                <div className="flex items-center gap-2">
                  {question.isAnswered && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {question.isVisible && (
                    <p
                      className={`text-sm ${
                        question.status === QuestionStatus.OPEN
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {question.status}
                    </p>
                  )}
                </div>
                {question.userId === state.currentUserId && !question.isVisible && (
                  <Trash2
                    onClick={() => {
                      socketRef?.emit("delete-question", {
                        roomId: state.roomId,
                        questionId: question.id,
                      });
                    }}
                    className="w-5 h-5 text-gray-400 cursor-pointer"
                  />
                )}
              </div>
              <p className="text-md font-medium text-gray-300 mt-1">
                {question.text}
              </p>
              <div className="flex items-center justify-between mt-2">
                {(question.isVisible || state.currentUserRole === Role.HOST) && (
                  <button
                    onClick={() => handleUpvoteQuestion(question.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      question.upvotes.includes(state.currentUserId)
                        ? "bg-green-800 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                    disabled={
                      state.currentUserId === question.userId ||
                      question.isAnswered ||
                      question.status === QuestionStatus.CLOSED
                    }
                  >
                    <ThumbsUp size={16} />
                    {question.upvotes.length}
                  </button>
                )}
                {state.currentUserRole === Role.HOST && !question.isVisible && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePublishQuestion(question.id)}
                      className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded-sm flex items-center gap-1"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleDismissQuestion(question.id)}
                      className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded-sm flex items-center gap-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              {question.answer && (
                <div className="mt-2 p-2 bg-gray-600 rounded">
                  <p className="text-sm text-gray-400">
                    Answered by {state.users.find(u => u.userId === question.answeredBy)?.username} (Host)
                  </p>
                  <p className="text-gray-300">{question.answer}</p>
                </div>
              )}
              {state.currentUserRole === Role.HOST &&
                question.isVisible &&
                question.status === QuestionStatus.OPEN && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => openAnswerPopup(question.id)}
                      className="bg-green-800 hover:bg-green-900 text-white px-3 py-1 rounded-sm flex items-center gap-1"
                    >
                      <MessageSquare size={16} /> Answer Question
                    </button>
                    <button
                      onClick={() => handleCloseQuestion(question.id)}
                      className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded-sm flex items-center gap-1"
                    >
                      <Lock size={16} /> Close
                    </button>
                  </div>
                )}
            </div>
          ))}
          {visibleQuestions.length === 0 && (
            <p className="text-gray-400 text-center">No questions yet.</p>
          )}
          {state.currentUserRole === Role.HOST && (
            <div
              onClick={() => {
                socketRef?.emit("disable-QA", { roomId: state.roomId });
              }}
              className="bg-gray-900 hover:bg-gray-950 text-center text-white w-ful px-4 py-2 rounded-sm cursor-pointer m-4"
            >
              Disable QA
            </div>
          )}
        </div>
      ) : state.currentUserRole === Role.JOINEE ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-400 text-center">
            QA has been disabled by HOST.
            <br />
            Ask him to enable.
          </p>
        </div>
      ) : (
        <button
          onClick={() => {
            socketRef?.emit("enable-QA", { roomId: state.roomId });
          }}
          className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 rounded-sm cursor-pointer m-4"
        >
          Enable QA
        </button>
      )}

      {/* Answer Popup Modal */}
      {showAnswerPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Answer Question</h3>
              <button
                onClick={closeAnswerPopup}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                {selectedQuestionId && 
                  visibleQuestions.find(q => q.id === selectedQuestionId)?.text
                }
              </p>
            </div>

            <textarea
              placeholder="Type your answer here... (optional)"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4"
              rows={4}
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubmitAnswer}
                disabled={!answerText.trim()}
                className="bg-green-800 hover:bg-green-900 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-sm flex items-center justify-center gap-2"
              >
                <Send size={16} /> Submit Answer
              </button>
              
              <button
                onClick={handleAnswerVerbally}
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-sm flex items-center justify-center gap-2"
              >
                <Mic size={16} /> Answer Verbally
              </button>
              
              <button
                onClick={closeAnswerPopup}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm flex items-center justify-center gap-2"
              >
                <X size={16} /> Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Clock, Image as ImageIcon } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { Poll, PollStatus, Role } from "@/types/chatRoom";
import toast from "react-hot-toast";

interface Props {
  socketRef: Socket | null;
}

export default function PollPanel({ socketRef }: Props) {
  const { state } = useReducedState();
  const [newPoll, setNewPoll] = useState<Poll>({
    id: Date.now(),
    question: "",
    options: [
      { text: "", image: "" },
      { text: "", image: "" },
    ],
    allowMultiple: false,
    anonymous: false,
    showResults: false,
    duration: 60,
    status: PollStatus.UPCOMING,
    responses: {},
    image: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    [pollId: number]: string[];
  }>({});
  const [timer, setTimer] = useState<{ [pollId: number]: number }>({});
  const pollImageInputRef = useRef<HTMLInputElement>(null);
  const optionImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // const debouncedSetNewPoll = useCallback(
  //   debounce((newPoll: Poll) => {
  //     setNewPoll(newPoll);
  //   }, 300),
  //   [setNewPoll]
  // );

  useEffect(() => {
    if (!socketRef) return;

    socketRef.emit("fetch-polls", { roomId: state.roomId });

    socketRef.on("poll-timer-start", ({ pollId }: { pollId: number }) => {
      startTimer(pollId);
    });

    return () => {
      socketRef.off("poll-timer-start");
    };
  }, [socketRef, state.roomId]);

  const startTimer = (pollId: number) => {
    const poll = state.polls.find((p) => p.id === pollId);
    if (poll && poll.duration > 0) {
      const timeLeft = poll.duration;
      setTimer((prev) => ({ ...prev, [pollId]: timeLeft }));
      const interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = { ...prev, [pollId]: prev[pollId] - 1 };
          if (newTimer[pollId] <= 0) {
            clearInterval(interval);
            socketRef?.emit("end-poll", { roomId: state.roomId, pollId });
            return { ...newTimer, [pollId]: 0 };
          }
          return newTimer;
        });
      }, 1000);
    }
  };

  const handleCreatePoll = () => {
    if (!newPoll.question) {
      toast.error("Please enter a question.");
      return;
    }
    if (newPoll.options.length < 2) {
      toast.error("Please add at least two options.");
      return;
    }
    if (newPoll.options.some((opt) => opt.text.trim() === "")) {
      toast.error("Please fill in all option texts.");
      return;
    }
    if (newPoll.options.length > 10) {
      toast.error("You can only add up to 10 options.");
      return;
    }

    const validPoll = {
      ...newPoll,
      options: newPoll.options.filter((opt) => opt.text.trim() !== ""),
    };
    socketRef?.emit("create-poll", { roomId: state.roomId, poll: validPoll });
    setIsCreating(false);
    setNewPoll({
      id: Date.now(),
      question: "",
      options: [
        { text: "", image: "" },
        { text: "", image: "" },
      ],
      allowMultiple: false,
      anonymous: false,
      showResults: false,
      duration: 60,
      status: PollStatus.UPCOMING,
      responses: {},
      image: "",
    });
  };

  const handleLaunchPoll = (pollId: number) => {
    socketRef?.emit("launch-poll", { roomId: state.roomId, pollId });
  };

  const handleSubmitVote = (pollId: number) => {
    const selected = selectedOptions[pollId] || [];
    if (selected.length === 0) {
      toast.error("Please select an option.");
      return;
    }
    socketRef?.emit("submit-poll-response", {
      roomId: state.roomId,
      pollId,
      userId: state.currentUserId,
      response: selected,
    });
  };

  const handleEndPoll = (pollId: number) => {
    socketRef?.emit("end-poll", { roomId: state.roomId, pollId });
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPoll((prev) => {
          if (index === -1) {
            return { ...prev, image: reader.result as string };
          } else {
            const newOptions = [...prev.options];
            newOptions[index] = {
              ...newOptions[index],
              image: reader.result as string,
            };
            return { ...prev, options: newOptions };
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar">
      {!isCreating && state.currentUserRole === Role.HOST && (
        <button
          className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 rounded-sm cursor-pointer w-full"
          onClick={() => setIsCreating(true)}
        >
          Create New Poll
        </button>
      )}
      {isCreating && state.currentUserRole === Role.HOST && (
        <div className="p-4">
          <input
            type="text"
            placeholder="Enter your question"
            value={newPoll.question}
            onChange={(e) =>
              setNewPoll({ ...newPoll, question: e.target.value })
            }
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {newPoll.options.map((opt, index) => (
            <div key={index} className="mb-2 flex items-center gap-2">
              {opt.image && (
                <div className="relative">
                  <img
                    src={opt.image}
                    alt={`Option ${index + 1}`}
                    className="w-10 h-10 object-cover rounded relative"
                  />
                  <button
                    onClick={() => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = {
                        ...newOptions[index],
                        image: "",
                      };
                      setNewPoll({ ...newPoll, options: newOptions });
                      if (optionImageInputRefs.current[index]) {
                        optionImageInputRefs.current[index].value = "";
                      }
                    }}
                    className="absolute top-1/2 right-1/2 cursor-pointer transform translate-x-1/2 -translate-y-1/2"
                  >
                    <X size={20} className="text-lg bg-amber-600 rounded" />
                  </button>
                </div>
              )}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt.text}
                  onChange={(e) => {
                    const newOptions = [...newPoll.options];
                    newOptions[index] = {
                      ...newOptions[index],
                      text: e.target.value,
                    };
                    setNewPoll({ ...newPoll, options: newOptions });
                  }}
                  className="w-full p-2 text-white bg-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                />
                {newPoll.options.length > 2 && (
                  <button
                    onClick={() => {
                      const newOptions = newPoll.options.filter(
                        (_, i) => i !== index
                      );
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={(el) => {
                  optionImageInputRefs.current[index] = el;
                }}
                onChange={(e) => handleImageUpload(e, index)}
                className="hidden"
              />
              {!opt.image && (
                <button
                  onClick={() => optionImageInputRefs.current[index]?.click()}
                  className="text-gray-300 hover:text-white cursor-pointer"
                >
                  <ImageIcon size={20} />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-center items-center w-full">
            <button
              onClick={() =>
                setNewPoll({
                  ...newPoll,
                  options: [...newPoll.options, { text: "", image: "" }],
                })
              }
              className="bg-green-800 inline cursor-pointer w-full hover:bg-green-900 text-white px-4 py-1.5 rounded-md mt-1"
              disabled={newPoll.options.length >= 10}
            >
              Add Option
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newPoll.allowMultiple}
                onChange={(e) =>
                  setNewPoll({ ...newPoll, allowMultiple: e.target.checked })
                }
                className="appearance-none h-5 w-5 border-2 border-gray-600 rounded-sm bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              <span className="ml-2 text-sm text-gray-300">
                Allow Multiple Answers
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newPoll.anonymous}
                onChange={(e) =>
                  setNewPoll({ ...newPoll, anonymous: e.target.checked })
                }
                className="appearance-none h-5 w-5 border-2 border-gray-600 rounded-sm bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              <span className="ml-2 text-sm text-gray-300">
                Anonymous Voting
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newPoll.showResults}
                onChange={(e) =>
                  setNewPoll({ ...newPoll, showResults: e.target.checked })
                }
                className="appearance-none h-5 w-5 border-2 border-gray-600 rounded-sm bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              <span className="ml-2 text-sm text-gray-300">Show Results</span>{" "}
            </label>
            {/* <label className="flex items-center">
                <span className="text-sm text-gray-300">
                  Duration (seconds):
                </span>
                <input
                  type="number"
                  value={newPoll.duration}
                  onChange={(e) =>
                    setNewPoll({
                      ...newPoll,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  className="ml-2 p-2 text-sm bg-gray-600 text-gray-300 focus:outline-none rounded-lg w-20"
                  min="10"
                  max="300"
                />
              </label> */}
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, -1)}
              className="hidden"
              ref={pollImageInputRef}
            />
            <button
              onClick={() => pollImageInputRef.current?.click()}
              className="text-gray-300 hover:text-white flex items-center cursor-pointer mt-4"
            >
              <ImageIcon size={20} className="mr-2" />{" "}
              {newPoll.image === ""
                ? "Add Poll Image (optional)"
                : "Change Poll Image"}
            </button>
            {newPoll.image && (
              <div className="flex flex-col items-center mt-2">
                <span className="text-sm text-gray-300">Preview:</span>
                <div className="relative">
                  <img
                    src={newPoll.image}
                    alt="Poll"
                    className="w-24 h-24 object-cover rounded mt-2"
                  />
                  <button
                    onClick={() => {
                      setNewPoll({ ...newPoll, image: "" });
                    }}
                    className="absolute top-1/2 right-1/2 cursor-pointer transform translate-x-1/2 -translate-y-1/2"
                  >
                    <X size={30} className="text-lg bg-amber-600 rounded" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCreatePoll}
            className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 mt-4 rounded-sm cursor-pointer w-full"
          >
            Create Poll
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm mt-2 w-full"
          >
            Cancel
          </button>
        </div>
      )}
      {state.polls.map((poll) => (
        <div key={poll.id} className="bg-gray-700 p-4 rounded-lg">
          {state.currentUserRole === Role.JOINEE && (
            <div className="flex justify-end text-center mt-1">
              <p className="bg-gray-800 px-4 py-1.5 text-sm rounded-2xl text-amber-500">
                {poll.status === PollStatus.ENDED
                  ? "Ended"
                  : poll.status === PollStatus.UPCOMING
                  ? "Upcoming"
                  : poll.status === PollStatus.ACTIVE &&
                    poll.responses[state.currentUserId]
                  ? "Responded"
                  : "Active"}
              </p>
            </div>
          )}
          <h3 className="text-md font-medium text-gray-300">
            <span className="text-2xl raleway text-gray-300">Q. </span>
            {poll.question}
          </h3>
          {poll.image && (
            <img
              src={poll.image}
              alt="Poll"
              className="w-full object-cover rounded mt-2"
            />
          )}
          {state.currentUserRole === Role.HOST &&
            poll.status !== PollStatus.ACTIVE && (
              <button
                onClick={() => {
                  if (poll.status === PollStatus.ENDED) {
                    socketRef?.emit("delete-poll", {
                      roomId: state.roomId,
                      pollId: poll.id,
                    });
                  } else {
                    handleLaunchPoll(poll.id);
                  }
                }}
                className={`${
                  poll.status === PollStatus.ENDED
                    ? "bg-amber-800 hover:bg-amber-900"
                    : "bg-green-700 w-full hover:bg-green-800"
                } cursor-pointer text-white px-4 py-1.5 rounded-md mt-2`}
              >
                {poll.status === PollStatus.ENDED
                  ? "Delete Poll"
                  : "Launch Poll"}
              </button>
            )}
         {poll.status !== PollStatus.UPCOMING && (
            <div>
              {!poll.responses[state.currentUserId] && poll.status === PollStatus.ACTIVE && (
                <div className="mt-2">
                  {poll.options.map((opt, index) => (
                    <label
                      key={index}
                      className="flex border-gray-600 border-1 items-center cursor-pointer rounded-md gap-2 transform hover:scale-105 bg-gray-800 py-2 px-3"
                    >
                      <input
                        type={poll.allowMultiple ? "checkbox" : "radio"}
                        name={`poll-${poll.id}`}
                        value={opt.text}
                        checked={(selectedOptions[poll.id] || []).includes(
                          opt.text
                        )}
                        onChange={() => {
                          const newSelected = poll.allowMultiple
                            ? selectedOptions[poll.id]?.includes(opt.text)
                              ? (selectedOptions[poll.id] || []).filter(
                                  (o) => o !== opt.text
                                )
                              : [...(selectedOptions[poll.id] || []), opt.text]
                            : [opt.text];
                          setSelectedOptions({
                            ...selectedOptions,
                            [poll.id]: newSelected,
                          });
                        }}
                        className="mr-2 mt-1.5 appearance-none h-4 w-4 border-2 border-gray-600 rounded-xl bg-gray-700 checked:bg-green-600 checked:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200"
                      />
                      {opt.image && (
                        <img
                          src={opt.image}
                          alt={`Option ${index + 1}`}
                          className="w-10 mt-1.5 h-10 object-cover rounded"
                        />
                      )}
                      {opt.text}
                    </label>
                  ))}
                  {poll.anonymous && state.currentUserRole === Role.JOINEE && (
                    <p className="text-sm text-gray-400 mt-2">
                      Your response will be anonymous.
                    </p>
                  )}
                  {state.currentUserRole === Role.HOST && (
                    <p className="text-sm text-yellow-500 text-center mt-2">
                      Captain, your vote is needed on the poll deck! 🚀
                    </p>
                  )}
                  <button
                    onClick={() => handleSubmitVote(poll.id)}
                    className="bg-green-800 hover:bg-green-900 w-full cursor-pointer text-white px-4 py-2 rounded-lg mt-2"
                    disabled={!(selectedOptions[poll.id]?.length > 0)}
                  >
                    SEND
                  </button>
                </div>
              )}
              {/* {(poll.responses[state.currentUserId] ||
                state.currentUserRole === Role.HOST) && ( */}
                <div className="mt-6">
                  {(poll.showResults ||
                    state.currentUserRole === Role.HOST) && (
                    <div className="pt-6 border-2 border-gray-600 rounded-lg p-4 flex flex-col gap-2">
                      {poll.options.map((opt, index) => {
                        const responseCount = Object.values(
                          poll.responses
                        ).filter((res) => res.includes(opt.text)).length;
                        const totalResponses = Object.keys(
                          poll.responses
                        ).length;
                        const percentage = totalResponses
                          ? (responseCount / totalResponses) * 100
                          : 0;
                        return (
                          <div key={index} className="mb-2">
                            {opt.image && (
                              <img
                                src={opt.image}
                                alt={`Option ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="mb-1 flex gap-2 items-center">
                              <div className="w-3 h-3 bg-gray-800 rounded-2xl"></div>
                              {opt.text}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-600 h-4 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 mt-1 flex justify-between">
                              <span>{percentage.toFixed(1)}%</span>{" "}
                              <span>({responseCount} votes)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {state.currentUserRole === Role.HOST &&
                    poll.status === PollStatus.ACTIVE && (
                      <button
                        onClick={() => handleEndPoll(poll.id)}
                        className="bg-red-800 hover:bg-red-900 cursor-pointer text-white px-4 py-2 rounded-lg mt-3"
                      >
                        End Poll
                      </button>
                    )}
                  {timer[poll.id] > 0 && (
                    <div className="text-sm text-gray-400 mt-2">
                      <Clock size={16} className="inline mr-1" /> Time Left:{" "}
                      {timer[poll.id]}s
                    </div>
                  )}
                </div>
               {/* )} */}
            </div>
         )}
        </div>
      ))}
      {state.polls.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400 text-center">No polls available.</p>
      </div>
      )}
    </div>
  );
}

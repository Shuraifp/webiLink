"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType } from "@/lib/MeetingContext";
import Whiteboard from "./Whiteboard";
import { createPortal } from "react-dom";
import { Socket } from "socket.io-client";
import useRecording from "@/hooks/useRecording";
import toast from "react-hot-toast";

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface ShowCaption {
  id: number;
  text: string;
  username: string;
  expiresAt: number;
}

export default function MeetingComponent({
  navbarHeight,
  meetingContainerRef,
  socketRef,
}: {
  navbarHeight: string;
  meetingContainerRef: React.RefObject<HTMLDivElement>;
  socketRef: React.RefObject<Socket>;
}) {
  const router = useRouter();
  const { state, dispatch } = useReducedState();
  const whiteboardPlaceholderRef = useRef<HTMLDivElement>(null);
  const whiteboardButtonRef = useRef<HTMLButtonElement>(null);
  const raiseHandButtonRef = useRef<HTMLButtonElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const captionButtonRef = useRef<HTMLButtonElement>(null);
  const dropUpButtonRef = useRef<HTMLButtonElement>(null);
  const captionPanelRef = useRef<HTMLDivElement>(null);
  const lastWhiteboardVisibleState = useRef<boolean>(true);
  const lastHandRaisedState = useRef<boolean>(true);
  const lastRecordingState = useRef<boolean>(true);
  const lastCaptionState = useRef<boolean>(true);
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    formatTime,
  } = useRecording({
    socketRef,
    roomId: state.roomId,
    currentUserId: state.currentUserId,
    currentUsername: state.currentUsername,
  });

  const [isCaptioning, setIsCaptioning] = useState(false);
  const [areCaptionsVisible, setAreCaptionsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActive = useRef(false);
  const [visibleCaptions, setVisibleCaptions] = useState<ShowCaption[]>([]);
  const [isDropUpOpen, setIsDropUpOpen] = useState(false);
  const captionIdCounter = useRef(0);
  const dropUpMenuRef = useRef<HTMLDivElement>(null);

  const socket = useMemo(() => socketRef.current, [socketRef]);

  // const isUserMuted = useCallback(() => {
  //   if (!meetingContainerRef.current) return false;

  //   const footerMiddle = meetingContainerRef.current.querySelector(
  //     "#ZegoRoomFooterMiddle"
  //   ) as HTMLElement | null;
  //   if (!footerMiddle) {
  //     console.log("ZegoRoomFooterMiddle not found");
  //     return false;
  //   }

  //   const micButton = footerMiddle.querySelector("#zegoMicButton") as HTMLButtonElement | null;
  //   if (!micButton) {
  //     console.log("zegoMicButton not found");
  //     return false;
  //   }
  //   const classes = micButton.className.split(" ");
  //   console.log(classes)
  //   if (classes.length < 2) {
  //     console.log("zegoMicButton does not have expected number of classes");
  //     return false;
  //   }

  //   const secondClass = classes[1];
  //   const isMuted = secondClass !== "false";
  //   console.log(`User mute status: ${isMuted} (second class: ${secondClass})`);
  //   return isMuted;
  // }, [meetingContainerRef]);

  const handleSpeechResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        if (transcript) {
          const caption = {
            username: state.currentUsername,
            text: transcript,
            timestamp: Date.now(),
          };
          socket?.emit("caption", {
            roomId: state.roomId,
            caption,
          });
        }
      }
    },
    [state.currentUsername, state.roomId, socket]
  );

  const stopCaptioning = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error("Failed to stop speech recognition:", error);
      }
    }
    isRecognitionActive.current = false;
    setIsCaptioning(false);
    setVisibleCaptions([]);
    setAreCaptionsVisible(false);
    setIsDropUpOpen(false);
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const startCaptioning = useCallback(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser.");
      return;
    }

    if (recognitionRef.current || isRecognitionActive.current) {
      return;
    }

    // if (isUserMuted()) {
    //   toast.error("You are muted. Please unmute your microphone to enable captioning.");
    //   return;
    // }

    const startNewRecognition = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.continuous = true;

      recognitionRef.current.onresult = handleSpeechResult;

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isRecognitionActive.current = false;
        if (
          event.error === "no-speech" ||
          event.error === "aborted"
        ) {
          setTimeout(() => {
            if (!isRecognitionActive.current && isCaptioning) {
              try {
                recognitionRef.current?.start();
                isRecognitionActive.current = true;
              } catch (error) {
                console.error("Failed to restart recognition:", error);
              }
            }
          }, 1000);
        } else if (event.error === "not-allowed") {
          alert(
            "Microphone access denied. Please allow microphone access and try again."
          );
          stopCaptioning();
        }
      };

      recognitionRef.current.onend = () => {
        isRecognitionActive.current = false;
        setTimeout(() => {
          if (!isRecognitionActive.current && isCaptioning) {
            try {
              recognitionRef.current?.start();
              isRecognitionActive.current = true;
            } catch (error) {
              console.error("Failed to restart recognition:", error);
            }
          }
        }, 500);
      };

      try {
        recognitionRef.current.start();
        isRecognitionActive.current = true;
        setIsCaptioning(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        isRecognitionActive.current = false;
        setIsCaptioning(false);
        alert("Failed to start speech recognition. Please try again.");
      }
    };

    startNewRecognition();
  }, [selectedLanguage, handleSpeechResult, stopCaptioning, isCaptioning]);

//   useEffect(() => {
//     console.log('in observer effect')
//     if (!isCaptioning) return;
// console.log(meetingContainerRef)
//     const footer = meetingContainerRef.current?.querySelector(
//       "#ZegoRoomFooter"
//     ) as HTMLElement | null;
//     console.log(footer)
//     const footerMiddle = meetingContainerRef.current?.querySelector(
//       "#ZegoRoomFooterMiddle"
//     ) as HTMLElement | null;
//     console.log(footerMiddle)
//     if (!footerMiddle) return;
//     const micButton = footerMiddle.querySelector("#zegoMicButton") as HTMLButtonElement | null;
//     console.log(micButton)
//     if (!micButton) return;

//     const observer = new MutationObserver(() => {
//       if (isUserMuted()) {
//         console.error("You have muted your microphone. Captioning has been stopped.");
//         stopCaptioning();
//       }
//     });

//     observer.observe(micButton, { attributes: true, attributeFilter: ["class"] });

//     return () => observer.disconnect();
//   }, [isCaptioning, isUserMuted, stopCaptioning, meetingContainerRef]);

  useEffect(() => {
    // if (!state.isPremiumUser) {
    //   console.log('not premium')
    //   stopCaptioning();
    //   return;
    // }
    startCaptioning();
    return () => {
      stopCaptioning();
    };
  }, [startCaptioning, stopCaptioning]);

  const downloadCaptions = useCallback(() => {
    if(!state.isPremiumUser){
      toast.error("This feature is available for premium users only.");
      return;
    }
    const text = state.captions
      .map(
        (c) =>
          `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.username}: ${
            c.text
          }`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captions_${state.roomId}_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.captions, state.roomId, state.isPremiumUser]);

  const debounce = useCallback(<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | undefined;
    return (...args: Parameters<T>): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const toggleHandRef = useRef(() => {
    const currentIsHandRaised = state.raisedHands.some(
      (hand) => hand.userId === state.currentUserId
    );
    if (currentIsHandRaised) {
      socket?.emit("lower-hand", {
        roomId: state.roomId,
        userId: state.currentUserId,
        username: state.currentUsername,
      });
    } else {
      socket?.emit("raise-hand", {
        roomId: state.roomId,
        userId: state.currentUserId,
        username: state.currentUsername,
      });
    }
  });

  useEffect(() => {
    toggleHandRef.current = () => {
      const currentIsHandRaised = state.raisedHands.some(
        (hand) => hand.userId === state.currentUserId
      );
      if (currentIsHandRaised) {
        socket?.emit("lower-hand", {
          roomId: state.roomId,
          userId: state.currentUserId,
          username: state.currentUsername,
        });
      } else {
        socket?.emit("raise-hand", {
          roomId: state.roomId,
          userId: state.currentUserId,
          username: state.currentUsername,
        });
      }
    };
  }, [
    state.raisedHands,
    state.currentUserId,
    state.roomId,
    socket,
    state.currentUsername,
  ]);

  useEffect(() => {
    const injectLayout = () => {
      if (!meetingContainerRef.current) return;

      const streamParent = meetingContainerRef.current.querySelector(
        ".lRNsiz_pTf7YmA5QMh4z "
      ) as HTMLElement | null;
      if (streamParent) {
        dispatch({
          type: MeetingActionType.SET_LEFT_MEETING,
          payload: false,
        });
        const footer = meetingContainerRef.current.querySelector(
          "#ZegoRoomFooter"
        ) as HTMLElement | null;
        const footerMiddle = footer?.querySelector(
          "#ZegoRoomFooterMiddle"
        ) as HTMLElement | null;
        if (!footer || !footerMiddle) {
          console.log(
            "Footer or footerMiddle not found, waiting for MutationObserver..."
          );
          return;
        }

        if (
          !whiteboardButtonRef.current ||
          !footerMiddle.contains(whiteboardButtonRef.current)
        ) {
          if (whiteboardButtonRef.current) {
            whiteboardButtonRef.current.removeEventListener("click", () => {});
          }
          whiteboardButtonRef.current = document.createElement("button");
          whiteboardButtonRef.current.id = "zegoRoomWhiteboardButton";
          whiteboardButtonRef.current.style.backgroundColor = "#333445";
          whiteboardButtonRef.current.style.border = "none";
          whiteboardButtonRef.current.style.borderRadius = "20%";
          whiteboardButtonRef.current.style.width = "40px";
          whiteboardButtonRef.current.style.height = "40px";
          whiteboardButtonRef.current.style.margin = "0 10px";
          whiteboardButtonRef.current.style.cursor = "pointer";
          whiteboardButtonRef.current.style.display = "flex";
          whiteboardButtonRef.current.style.alignItems = "center";
          whiteboardButtonRef.current.style.justifyContent = "center";

          const initialWhiteboardSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${
                state.isWhiteboardVisible
                  ? `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                     <line x1="3" y1="9" x2="21" y2="9"></line>
                     <line x1="9" y1="21" x2="9" y2="9"></line>`
                  : `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                     <line x1="3" y1="9" x2="21" y2="9"></line>
                     <line x1="9" y1="21" x2="9" y2="9"></line>
                     <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="2"></line>`
              }
            </svg>
          `;
          whiteboardButtonRef.current.innerHTML = initialWhiteboardSvg;

          whiteboardButtonRef.current.addEventListener("click", () => {
            whiteboardButtonRef.current?.classList.toggle("active");
            dispatch({
              type: MeetingActionType.TOGGLE_WHITEBOARD,
            });
          });
          footerMiddle.insertBefore(
            whiteboardButtonRef.current,
            footerMiddle.children[2]
          );
        }

        if (
          !raiseHandButtonRef.current ||
          !footerMiddle.contains(raiseHandButtonRef.current)
        ) {
          if (raiseHandButtonRef.current) {
            const oldButton = raiseHandButtonRef.current;
            const newButton = oldButton.cloneNode(true) as HTMLButtonElement;
            if (oldButton.parentNode) {
              oldButton.parentNode.replaceChild(newButton, oldButton);
            }
            raiseHandButtonRef.current = newButton;
          } else {
            raiseHandButtonRef.current = document.createElement("button");
          }

          raiseHandButtonRef.current.id = "zegoRoomRaiseHandButton";
          raiseHandButtonRef.current.style.backgroundColor = state.raisedHands.some(
            (hand) => hand.userId === state.currentUserId
          )
            ? "#555566"
            : "#333445";
          raiseHandButtonRef.current.style.border = "none";
          raiseHandButtonRef.current.style.borderRadius = "20%";
          raiseHandButtonRef.current.style.width = "40px";
          raiseHandButtonRef.current.style.height = "40px";
          raiseHandButtonRef.current.style.margin = "0 10px";
          raiseHandButtonRef.current.style.cursor = "pointer";
          raiseHandButtonRef.current.style.display = "flex";
          raiseHandButtonRef.current.style.alignItems = "center";
          raiseHandButtonRef.current.style.justifyContent = "center";

          const initialHandSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${
              state.raisedHands.some((hand) => hand.userId === state.currentUserId)
                ? "#FFD700"
                : "white"
            }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 11.5V6.5a2 2 0 0 0-4 0v5"></path>
              <path d="M13 11.5V4.5a2 2 0 0 0-4 0v7"></path>
              <path d="M9 11.5v-1a2 2 0 0 0-4 0v1"></path>
              <path d="M19 11v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2"></path>
              <path d="M9 17v1"></path>
              <path d="M12 17v2"></path>
              <path d="M15 17v3"></path>
            </svg>
          `;
          raiseHandButtonRef.current.innerHTML = initialHandSvg;

          raiseHandButtonRef.current.addEventListener("click", () => {
            toggleHandRef.current();
          });

          footerMiddle.insertBefore(
            raiseHandButtonRef.current,
            footerMiddle.children[3]
          );
        }

        if (
          (!recordButtonRef.current ||
            !footerMiddle.contains(recordButtonRef.current)) &&
          state.isPremiumUser
        ) {
          if (recordButtonRef.current) {
            recordButtonRef.current.removeEventListener("click", () => {});
          }
          recordButtonRef.current = document.createElement("button");
          recordButtonRef.current.id = "zegoRoomRecordButton";
          recordButtonRef.current.style.backgroundColor = "#333445";
          recordButtonRef.current.style.border = "none";
          recordButtonRef.current.style.borderRadius = "20%";
          recordButtonRef.current.style.width = "40px";
          recordButtonRef.current.style.height = "40px";
          recordButtonRef.current.style.margin = "0 10px";
          recordButtonRef.current.style.cursor = "pointer";
          recordButtonRef.current.style.display = "flex";
          recordButtonRef.current.style.alignItems = "center";
          recordButtonRef.current.style.justifyContent = "center";
          recordButtonRef.current.style.position = "relative";

          const initialRecordSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
          `;
          recordButtonRef.current.innerHTML = initialRecordSvg;

          recordButtonRef.current.addEventListener("click", () => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          });

          footerMiddle.insertBefore(
            recordButtonRef.current,
            footerMiddle.children[4] || footerMiddle.lastChild
          );
        }

        if (
          !captionButtonRef.current ||
          !footerMiddle.contains(captionButtonRef.current)
        ) {
          if (captionButtonRef.current) {
            captionButtonRef.current.remove();
          }

          captionButtonRef.current = document.createElement("button");
          captionButtonRef.current.id = "zegoRoomCaptionButton";
          captionButtonRef.current.style.backgroundColor = "#333445";
          captionButtonRef.current.style.border = "none";
          captionButtonRef.current.style.borderTopLeftRadius = "20%";
          captionButtonRef.current.style.borderBottomLeftRadius = "20%";
          captionButtonRef.current.style.width = "40px";
          captionButtonRef.current.style.height = "40px";
          captionButtonRef.current.style.margin = "0 1px 0 10px";
          captionButtonRef.current.style.cursor = "pointer";
          captionButtonRef.current.style.display = "flex";
          captionButtonRef.current.style.alignItems = "center";
          captionButtonRef.current.style.justifyContent = "center";
          captionButtonRef.current.style.position = "relative";
          captionButtonRef.current.style.zIndex = "1000";

          const initialCaptionSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="18" height="12" rx="2"/>
              <path d="M7 10h4M13 10h4"/>
              <path d="M7 14h2M11 14h6"/>
            </svg>
          `;
          captionButtonRef.current.innerHTML = initialCaptionSvg;

          const handleCaptionClick = (e: MouseEvent) => {
            e.stopPropagation();
            setAreCaptionsVisible((prev) => {
              const newState = !prev;
              console.log(`Caption visibility toggled: ${newState}`);
              return newState;
            });
          };

          captionButtonRef.current.addEventListener("click", handleCaptionClick);

          footerMiddle.insertBefore(
            captionButtonRef.current,
            footerMiddle.lastChild
          );
        }

        if (
          !dropUpButtonRef.current ||
          !footerMiddle.contains(dropUpButtonRef.current)
        ) {
          if (dropUpButtonRef.current) {
            dropUpButtonRef.current.remove();
          }

          dropUpButtonRef.current = document.createElement("button");
          dropUpButtonRef.current.id = "zegoRoomDropUpButton";
          dropUpButtonRef.current.style.backgroundColor = "#333445";
          dropUpButtonRef.current.style.border = "none";
          dropUpButtonRef.current.style.borderTopRightRadius = "20%";
          dropUpButtonRef.current.style.borderBottomRightRadius = "20%";
          dropUpButtonRef.current.style.width = "25px";
          dropUpButtonRef.current.style.height = "40px";
          dropUpButtonRef.current.style.margin = "0 5px 0 0";
          dropUpButtonRef.current.style.cursor = "pointer";
          dropUpButtonRef.current.style.display = "flex";
          dropUpButtonRef.current.style.alignItems = "center";
          dropUpButtonRef.current.style.justifyContent = "center";
          dropUpButtonRef.current.style.position = "relative";
          dropUpButtonRef.current.style.zIndex = "1000";

          const initialDropUpSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2" y1="3" x2="10" y2="3"/>
              <line x1="2" y1="6" x2="10" y2="6"/>
              <line x1="2" y1="9" x2="10" y2="9"/>
            </svg>
          `;
          dropUpButtonRef.current.innerHTML = initialDropUpSvg;

          const handleDropUpClick = (e: MouseEvent) => {
            e.stopPropagation();
            setIsDropUpOpen((prev) => !prev);
          };

          dropUpButtonRef.current.addEventListener("click", handleDropUpClick);

          footerMiddle.insertBefore(
            dropUpButtonRef.current,
            footerMiddle.lastChild
          );
        }

        if (!whiteboardPlaceholderRef.current) {
          whiteboardPlaceholderRef.current = document.createElement("div");
          whiteboardPlaceholderRef.current.className = "whiteboard-placeholder";
          whiteboardPlaceholderRef.current.style.flex = "0 0 100%";
          whiteboardPlaceholderRef.current.style.height = "100%";
          whiteboardPlaceholderRef.current.style.width = "100%";
          whiteboardPlaceholderRef.current.style.backgroundColor = "#ffffff";
          whiteboardPlaceholderRef.current.style.borderRight = "2px solid #ccc";
          whiteboardPlaceholderRef.current.style.display =
            state.isWhiteboardVisible ? "flex" : "none";
          whiteboardPlaceholderRef.current.style.alignItems = "center";
          whiteboardPlaceholderRef.current.style.justifyContent = "center";
          whiteboardPlaceholderRef.current.style.fontSize = "18px";
          whiteboardPlaceholderRef.current.style.color = "#666";
          whiteboardPlaceholderRef.current.style.position = "relative";
          whiteboardPlaceholderRef.current.style.zIndex = "30";
          whiteboardPlaceholderRef.current.style.marginRight = "10px";
        }

        (streamParent as HTMLElement).style.paddingBottom = "30px";

        const meetingContainer = meetingContainerRef.current as HTMLElement;
        meetingContainer.style.display = "flex";
        meetingContainer.style.flexDirection = "row";
        meetingContainer.style.height = `calc(100vh - ${navbarHeight})`;
        meetingContainer.style.width = "100%";
      } else {
        dispatch({
          type: MeetingActionType.SET_LEFT_MEETING,
          payload: true,
        });
        const buttons = Array.from(
          meetingContainerRef.current.querySelectorAll("div button")
        );
        const rejoinButton = buttons.find((button) =>
          button.className.includes("IughcowXVrJ5wcOf6vH9")
        ) as HTMLButtonElement | null;

        if (
          rejoinButton &&
          !meetingContainerRef.current.querySelector(".back-to-dashboard")
        ) {
          const parentContainer = rejoinButton.parentElement;
          rejoinButton.style.marginBottom = "14px";

          const backButton = document.createElement("button");
          backButton.innerText = "Back to Dashboard";
          backButton.className = "back-to-dashboard";
          backButton.style.marginLeft = "1px";
          backButton.style.padding = "10px 28px";
          backButton.style.backgroundColor = "#4a4a4a";
          backButton.style.color = "#fff";
          backButton.style.border = "none";
          backButton.style.borderRadius = "10px";
          backButton.style.cursor = "pointer";

          backButton.addEventListener("click", () => {
            router.replace("/host");
          });
          backButton.addEventListener("mouseover", () => {
            backButton.style.backgroundColor = "#3a3a3a";
          });
          parentContainer!.insertBefore(backButton, rejoinButton.nextSibling);
        }
      }
    };

    const debouncedInjectLayout = debounce(injectLayout, 100);
    const observer = new MutationObserver(() => {
      debouncedInjectLayout();
    });

    if (meetingContainerRef.current) {
      observer.observe(meetingContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    debouncedInjectLayout();

    return () => {
      observer.disconnect();
    };
  }, [
    meetingContainerRef,
    navbarHeight,
    state.isPremiumUser,
    state.isWhiteboardVisible,
    state.raisedHands,
    state.currentUserId,
    dispatch,
    router,
    debounce,
  ]);

  useEffect(() => {
    if (whiteboardPlaceholderRef.current && meetingContainerRef.current) {
      const streamParent = meetingContainerRef.current.querySelector(
        ".lRNsiz_pTf7YmA5QMh4z "
      ) as HTMLElement | null;
      if (!streamParent) return;

      if (
        state.isWhiteboardVisible &&
        !streamParent.contains(whiteboardPlaceholderRef.current)
      ) {
        streamParent.insertBefore(
          whiteboardPlaceholderRef.current,
          streamParent.firstChild
        );
        whiteboardPlaceholderRef.current.style.display = "flex";
      } else if (
        !state.isWhiteboardVisible &&
        streamParent.contains(whiteboardPlaceholderRef.current)
      ) {
        whiteboardPlaceholderRef.current.style.display = "none";
      } else {
        whiteboardPlaceholderRef.current.style.display = "flex";
      }

      if (
        whiteboardButtonRef.current &&
        lastWhiteboardVisibleState.current !== state.isWhiteboardVisible
      ) {
        const baseSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${
              state.isWhiteboardVisible
                ? `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                   <line x1="3" y1="9" x2="21" y2="9"></line>
                   <line x1="9" y1="21" x2="9" y2="9"></line>`
                : `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                   <line x1="3" y1="9" x2="21" y2="9"></line>
                   <line x1="9" y1="21" x2="9" y2="9"></line>
                   <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="2"></line>`
            }
          </svg>
        `;
        whiteboardButtonRef.current.innerHTML = baseSvg;
        lastWhiteboardVisibleState.current = state.isWhiteboardVisible;
      }
    }
  }, [state.isWhiteboardVisible, meetingContainerRef]);

  useEffect(() => {
    if (
      raiseHandButtonRef.current &&
      lastHandRaisedState.current !==
        state.raisedHands.some((hand) => hand.userId === state.currentUserId)
    ) {
      const handSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${
          state.raisedHands.some((hand) => hand.userId === state.currentUserId)
            ? "#FFD700"
            : "white"
        }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 11.5V6.5a2 2 0 0 0-4 0v5"></path>
          <path d="M13 11.5V4.5a2 2 0 0 0-4 0v7"></path>
          <path d="M9 11.5v-1a2 2 0 0 0-4 0v1"></path>
          <path d="M19 11v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2"></path>
          <path d="M9 17v1"></path>
          <path d="M12 17v2"></path>
          <path d="M15 17v3"></path>
        </svg>
      `;
      raiseHandButtonRef.current.innerHTML = handSvg;
      raiseHandButtonRef.current.style.backgroundColor = state.raisedHands.some(
        (hand) => hand.userId === state.currentUserId
      )
        ? "#555566"
        : "#333445";
      lastHandRaisedState.current = state.raisedHands.some(
        (hand) => hand.userId === state.currentUserId
      );
    }
  }, [state.raisedHands, state.currentUserId]);

  useEffect(() => {
    if (
      recordButtonRef.current &&
      lastRecordingState.current !== isRecording
    ) {
      const recordSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${
          isRecording ? "#FF0000" : "white"
        }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${
            isRecording
              ? `<rect x="6" y="6" width="12" height="12" />`
              : `<circle cx="12" cy="12" r="10" />`
          }
        </svg>
      `;
      recordButtonRef.current.innerHTML = recordSvg;
      recordButtonRef.current.style.backgroundColor = isRecording
        ? "#555566"
        : "#333445";

      if (isRecording) {
        const indicator = document.createElement("div");
        indicator.className = "recording-indicator";
        indicator.style.position = "absolute";
        indicator.style.top = "-5px";
        indicator.style.right = "-5px";
        indicator.style.width = "10px";
        indicator.style.height = "10px";
        indicator.style.backgroundColor = "#FF0000";
        indicator.style.borderRadius = "50%";
        indicator.style.animation = "pulse 1s infinite";

        const timer = document.createElement("span");
        timer.className = "recording-timer";
        timer.style.position = "absolute";
        timer.style.bottom = "-20px";
        timer.style.fontSize = "12px";
        timer.style.color = "#FF0000";
        timer.textContent = formatTime(recordingTime);

        recordButtonRef.current.appendChild(indicator);
        recordButtonRef.current.appendChild(timer);
      } else {
        const indicator = recordButtonRef.current.querySelector(
          ".recording-indicator"
        );
        const timer = recordButtonRef.current.querySelector(
          ".recording-timer"
        );
        if (indicator) indicator.remove();
        if (timer) timer.remove();
      }

      lastRecordingState.current = isRecording;
    }
  }, [isRecording, recordingTime, formatTime]);

  useEffect(() => {
    if (isRecording && recordButtonRef.current) {
      const timer = recordButtonRef.current.querySelector(
        ".recording-timer"
      ) as HTMLSpanElement;
      if (timer) {
        timer.textContent = formatTime(recordingTime);
      }
    }
  }, [isRecording, recordingTime, formatTime]);

  useEffect(() => {
    if (captionButtonRef.current) {
      const captionSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${
          areCaptionsVisible ? "#FFD700" : "white"
        }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2"/>
          <path d="M7 10h4M13 10h4"/>
          <path d="M7 14h2M11 14h6"/>
        </svg>
      `;
      captionButtonRef.current.innerHTML = captionSvg;
      captionButtonRef.current.style.backgroundColor = areCaptionsVisible
        ? "#555566"
        : "#333445";
      console.log(`Caption button updated: areCaptionsVisible=${areCaptionsVisible}`);
      lastCaptionState.current = areCaptionsVisible;
    }
  }, [areCaptionsVisible]);

  useEffect(() => {
    if (dropUpButtonRef.current) {
      const dropUpSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="${
          isDropUpOpen ? "#FFD700" : "white"
        }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="2" y1="3" x2="10" y2="3"/>
          <line x1="2" y1="6" x2="10" y2="6"/>
          <line x1="2" y1="9" x2="10" y2="9"/>
        </svg>
      `;
      dropUpButtonRef.current.innerHTML = dropUpSvg;
      dropUpButtonRef.current.style.backgroundColor = isDropUpOpen
        ? "#555566"
        : "#333445";

      let dropUpMenu = dropUpButtonRef.current.querySelector(
        ".drop-up-menu"
      ) as HTMLElement;
      if (!dropUpMenu) {
        dropUpMenu = document.createElement("div");
        dropUpMenu.className = "drop-up-menu";
        dropUpMenu.style.position = "absolute";
        dropUpMenu.style.left = "50px";
        dropUpMenu.style.bottom = "0";
        dropUpMenu.style.marginRight = "10px";
        dropUpMenu.style.backgroundColor = "#444";
        dropUpMenu.style.borderRadius = "8px";
        dropUpMenu.style.padding = "10px";
        dropUpMenu.style.zIndex = "1001";
        dropUpMenu.style.boxShadow = "2px 0 10px rgba(0, 0, 0, 0.3)";
        dropUpMenu.style.width = "150px";

        dropUpMenuRef.current = dropUpMenu;

        const langSelect = document.createElement("select");
        langSelect.style.padding = "5px";
        langSelect.style.marginBottom = "5px";
        langSelect.style.width = "100%";
        langSelect.style.backgroundColor = "#555";
        langSelect.style.color = "white";
        langSelect.style.border = "none";
        langSelect.style.borderRadius = "4px";
        const languages = [
          { code: "en-US", name: "English (US)" },
          { code: "es-ES", name: "Spanish" },
          { code: "fr-FR", name: "French" },
          { code: "de-DE", name: "German" },
          { code: "zh-CN", name: "Chinese (Simplified)" },
        ];

        languages.forEach((lang) => {
          const option = document.createElement("option");
          option.value = lang.code;
          option.textContent = lang.name;
          if (lang.code === selectedLanguage) option.selected = true;
          langSelect.appendChild(option);
        });

        langSelect.addEventListener("change", (e) => {
          e.stopPropagation();
          const newLang = (e.target as HTMLSelectElement).value;
          setSelectedLanguage(newLang);
          if (isCaptioning) {
            stopCaptioning();
            setTimeout(() => {
              startCaptioning();
            }, 500);
          }
        });

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download Captions";
        downloadBtn.style.padding = "5px";
        downloadBtn.style.width = "100%";
        downloadBtn.style.backgroundColor = "#4a4a4a";
        downloadBtn.style.color = "white";
        downloadBtn.style.border = "none";
        downloadBtn.style.borderRadius = "4px";
        downloadBtn.style.cursor = "pointer";

        downloadBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          downloadCaptions();
          setIsDropUpOpen(false);
        });

        dropUpMenu.appendChild(langSelect);
        dropUpMenu.appendChild(downloadBtn);
        dropUpButtonRef.current.appendChild(dropUpMenu);
      }

      dropUpMenu.style.display = isDropUpOpen && isCaptioning ? "block" : "none";
      console.log(
        `Drop-up menu visibility: isDropUpOpen=${isDropUpOpen}, isCaptioning=${isCaptioning}, display=${dropUpMenu.style.display}`
      );
    }
  }, [
    isCaptioning,
    isDropUpOpen,
    selectedLanguage,
    stopCaptioning,
    startCaptioning,
    downloadCaptions,
  ]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropUpButtonRef.current &&
      dropUpMenuRef.current &&
      !dropUpButtonRef.current.contains(e.target as Node) &&
      !dropUpMenuRef.current.contains(e.target as Node)
    ) {
      console.log("Click outside detected, closing drop-up menu");
      setIsDropUpOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (state.captions.length > 0) {
      const latestCaption = state.captions[state.captions.length - 1];
      const captionId = captionIdCounter.current++;
      const newCaption: ShowCaption = {
        id: captionId,
        text: latestCaption.text,
        username: latestCaption.username,
        expiresAt: Date.now() + 3000,
      };

      setVisibleCaptions((prev) => [...prev, newCaption]);

      const timeout = setTimeout(() => {
        setVisibleCaptions((prev) =>
          prev.filter((caption) => caption.id !== captionId)
        );
        timeoutsRef.current.delete(captionId);
      }, 3000);

      timeoutsRef.current.set(captionId, timeout);
    }
  }, [state.captions]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
      stopCaptioning();
    };
  }, [stopCaptioning]);

  useEffect(() => {
    const getStreamBoxes = (streamParent: HTMLElement) => {
      const wrapper = streamParent.querySelector(".IOc1l1j0UQkG1pNh5vE");
      if (wrapper) {
        return Array.from(
          wrapper.querySelectorAll(".Xfk1RtGH65gHx0iQ5uPA")
        ) as HTMLElement[];
      }
      return Array.from(
        streamParent.querySelectorAll(".Xfk1RtGH65gHx0iQ5uPA")
      ) as HTMLElement[];
    };

    const getUserNameFromStreamBox = (streamBox: HTMLElement) => {
      const nameElement = streamBox.querySelector("#ZegoVideoPlayerName p");
      return nameElement?.textContent?.trim() || null;
    };

    const getUserIdFromName = (userName: string) => {
      const user = state.users?.find((u) => u.username === userName);
      return user?.userId || null;
    };

    const updateStreamBoxes = () => {
      if (!meetingContainerRef.current) return;

      const streamParent = meetingContainerRef.current.querySelector(
        ".lRNsiz_pTf7YmA5QMh4z "
      ) as HTMLElement | null;
      if (!streamParent) return;

      const streamBoxes = getStreamBoxes(streamParent);

      streamBoxes.forEach((streamBox) => {
        const userName = getUserNameFromStreamBox(streamBox);
        if (!userName) {
          console.log(
            "Could not determine user name for stream box:",
            streamBox
          );
          return;
        }

        const userId = getUserIdFromName(userName);
        if (!userId) {
          console.log(`Could not map user name "${userName}" to a user ID`);
          return;
        }

        const isHandRaised = state.raisedHands.some(
          (hand) => hand.userId === userId
        );
        if (isHandRaised) {
          streamBox.style.border = "3px solid #FFD700";
          streamBox.style.position = "relative";
          streamBox.style.animation = "pulse 2s infinite";

          if (!streamBox.querySelector(".hand-raised-indicator")) {
            const indicator = document.createElement("div");
            indicator.className = "hand-raised-indicator";
            indicator.style.position = "absolute";
            indicator.style.top = "10px";
            indicator.style.left = "10px";
            indicator.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 11.5V6.5a2 2 0 0 0-4 0v5"></path>
                <path d="M13 11.5V4.5a2 2 0 0 0-4 0v7"></path>
                <path d="M9 11.5v-1a2 2 0 0 0-4 0v1"></path>
                <path d="M19 11v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2"></path>
                <path d="M9 17v1"></path>
                <path d="M12 17v2"></path>
                <path d="M15 17v3"></path>
              </svg>
            `;
            streamBox.appendChild(indicator);
          }
        } else {
          streamBox.style.border = "none";
          const indicator = streamBox.querySelector(".hand-raised-indicator");
          if (indicator) {
            indicator.remove();
          }
        }
      });
    };

    const debouncedUpdateStreamBoxes = debounce(updateStreamBoxes, 100);

    const observer = new MutationObserver(() => {
      debouncedUpdateStreamBoxes();
    });

    if (meetingContainerRef.current) {
      observer.observe(meetingContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    debouncedUpdateStreamBoxes();

    return () => observer.disconnect();
  }, [state.raisedHands, state.users, meetingContainerRef, debounce]);

  return (
    <div
      className={`flex-1 transition-all bg-gray-800 duration-300 w-full ${
        state.isSidebarOpen ? "pr-[320px]" : "pr-0"
      }`}
      style={{ position: "relative" }}
    >
      <div
        ref={meetingContainerRef}
        className={`my-container-for-zego w-full relative ${
          state.isLeftMeeting ? "h-full" : `h-[100vh - ${navbarHeight}]`
        }`}
      />
      {whiteboardPlaceholderRef.current &&
        state.isWhiteboardVisible &&
        createPortal(
          <Whiteboard
            containerRef={whiteboardPlaceholderRef}
            socketRef={socketRef}
          />,
          whiteboardPlaceholderRef.current
        )}
      {areCaptionsVisible && visibleCaptions.length > 0 && (
        <div
          ref={captionPanelRef}
          className="caption-panel"
          style={{
            position: "absolute",
            bottom: "80px",
            left: "10px",
            // right: "50%",
            maxHeight: "150px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            overflowY: "auto",
            zIndex: 100,
            fontSize: "14px",
            pointerEvents: "none",
          }}
        >
          {visibleCaptions.map((caption) => (
            <p key={caption.id}>
              {caption.username === state.currentUsername? "You":caption.username} : {caption.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
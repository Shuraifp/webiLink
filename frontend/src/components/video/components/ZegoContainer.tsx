"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType } from "@/lib/MeetingContext";
import Whiteboard from "./Whiteboard";
import { createPortal } from "react-dom";
import { Socket } from "socket.io-client";

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
  const lastWhiteboardVisibleState = useRef(true);
  const lastHandRaisedState = useRef(true);

  const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | undefined;

    return (...args: Parameters<T>): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const toggleHandRef = useRef(() => {
    const currentIsHandRaised = state.raisedHands.some(
      (hand) => hand.userId === state.currentUserId
    );
    if (currentIsHandRaised) {
      socketRef.current?.emit("lower-hand", {
        roomId: state.roomId,
        userId: state.currentUserId,
        username: state.currentUsername,
      });
    } else {
      socketRef.current?.emit("raise-hand", {
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
        socketRef.current?.emit("lower-hand", {
          roomId: state.roomId,
          userId: state.currentUserId,
          username: state.currentUsername,
        });
      } else {
        socketRef.current?.emit("raise-hand", {
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
    socketRef,
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
          whiteboardButtonRef.current = document.createElement(
            "button"
          ) as HTMLButtonElement;
          whiteboardButtonRef.current.id = "zegoRoomWhiteboardButton";
          whiteboardButtonRef.current.style.backgroundColor = "#333445";
          whiteboardButtonRef.current.style.border = "none";
          whiteboardButtonRef.current.style.borderRadius = "20%";
          whiteboardButtonRef.current.style.width = "40px";
          whiteboardButtonRef.current.style.height = "40px";
          whiteboardButtonRef.current.style.margin = "0 5px";
          whiteboardButtonRef.current.style.cursor = "pointer";
          whiteboardButtonRef.current.style.display = "flex";
          whiteboardButtonRef.current.style.alignItems = "center";
          whiteboardButtonRef.current.style.justifyContent = "center";
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
            raiseHandButtonRef.current = document.createElement(
              "button"
            ) as HTMLButtonElement;
          }

          raiseHandButtonRef.current.id = "zegoRoomRaiseHandButton";
          raiseHandButtonRef.current.style.backgroundColor = "#333445";
          raiseHandButtonRef.current.style.border = "none";
          raiseHandButtonRef.current.style.borderRadius = "20%";
          raiseHandButtonRef.current.style.width = "40px";
          raiseHandButtonRef.current.style.height = "40px";
          raiseHandButtonRef.current.style.margin = "0 5px 0 10px";
          raiseHandButtonRef.current.style.cursor = "pointer";
          raiseHandButtonRef.current.style.display = "flex";
          raiseHandButtonRef.current.style.alignItems = "center";
          raiseHandButtonRef.current.style.justifyContent = "center";

          raiseHandButtonRef.current.addEventListener("click", () => {
            toggleHandRef.current();
          });

          footerMiddle.insertBefore(
            raiseHandButtonRef.current,
            footerMiddle.children[3]
          );
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
        if (
          raiseHandButtonRef.current &&
          lastHandRaisedState.current !==
            state.raisedHands.some(
              (hand) => hand.userId === state.currentUserId
            )
        ) {
          const handSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${
              state.raisedHands.some(
                (hand) => hand.userId === state.currentUserId
              )
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
          raiseHandButtonRef.current.style.backgroundColor =
            state.raisedHands.some(
              (hand) => hand.userId === state.currentUserId
            )
              ? "#555566"
              : "#333445";
          lastHandRaisedState.current = state.raisedHands.some(
            (hand) => hand.userId === state.currentUserId
          );
        }

        if (!whiteboardPlaceholderRef.current) {
          whiteboardPlaceholderRef.current = document.createElement(
            "div"
          ) as HTMLDivElement;
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

          const backButton = document.createElement(
            "button"
          ) as HTMLButtonElement;
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

    const debouncedInjectLayout = debounce(injectLayout, 50);
    const observer = new MutationObserver(() => {
      console.log("MutationObserver triggered, re-injecting layout");
      debouncedInjectLayout();
    });

    if (meetingContainerRef.current) {
      observer.observe(meetingContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    debouncedInjectLayout();

    return () => observer.disconnect();
  }, [
    router,
    navbarHeight,
    meetingContainerRef,
    state.isWhiteboardVisible,
    dispatch,
    state.raisedHands,
    socketRef,
    state.currentUserId,
    state.roomId,
  ]);


  useEffect(() => {
    const getStreamBoxes = (streamParent: HTMLElement) => {
      const wrapper = streamParent.querySelector(".IOc1l1j0UQkG1pNh5vE");
      if (wrapper) {
        return Array.from(wrapper.querySelectorAll(".Xfk1RtGH65gHx0iQ5uPA")) as HTMLElement[];
      }
      return Array.from(streamParent.querySelectorAll(".Xfk1RtGH65gHx0iQ5uPA")) as HTMLElement[];
    };

    const getUserNameFromStreamBox = (streamBox: HTMLElement) => {
      const nameElement = streamBox.querySelector(
        "#ZegoVideoPlayerName p"
      );
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
          console.log("Could not determine user name for stream box:", streamBox);
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

    const debouncedUpdateStreamBoxes = debounce(updateStreamBoxes, 50);

    const observer = new MutationObserver(() => {
      console.log("MutationObserver triggered, updating stream boxes");
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
  }, [state.raisedHands, state.users, meetingContainerRef]);


  return (
    <div
      className={`flex-1 transition-all bg-gray-800 duration-300 w-full ${
        state.isSidebarOpen ? "pr-[320px]" : "pr-0"
      }`}
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
    </div>
  );
}

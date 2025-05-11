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
  const lastWhiteboardVisibleState = useRef(true);

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

  useEffect(() => {
    const injectLayout = () => {
      if (!meetingContainerRef.current) return;

      const streamParent = meetingContainerRef.current.querySelector(
        ".lRNsiz_pTf7YmA5QMh4z "
      ) as HTMLElement | null;
      if (streamParent) {
        dispatch({
          type: MeetingActionType.SET_LEFT_MEETING,
          payload: false
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
          whiteboardButtonRef.current &&
          lastWhiteboardVisibleState.current !== state.isWhiteboardVisible
        ) {
          const baseSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
            ${
              !state.isWhiteboardVisible
                ? '<line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="2"/>'
                : ""
            }
          </svg>
        `;
          whiteboardButtonRef.current.innerHTML = baseSvg;
          lastWhiteboardVisibleState.current = state.isWhiteboardVisible;
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
          payload: true
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

    // injectLayout();
    debouncedInjectLayout();

    return () => observer.disconnect();
  }, [
    router,
    navbarHeight,
    meetingContainerRef,
    state.isWhiteboardVisible,
    dispatch,
  ]);

  return (
    <div
      className={`flex-1 transition-all bg-gray-800 duration-300 w-full ${
        state.isSidebarOpen ? "pr-[320px]" : "pr-0"
      }`}
    >
      <div
        ref={meetingContainerRef}
        className={`my-container-for-zego w-full relative ${state.isLeftMeeting ? "h-full" : `h-[100vh - ${navbarHeight}]`}`}
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

"use client"

import { useContext } from "react";
import { MeetingContext } from "@/lib/MeetingContext";

export const useReducedState = () => {
  const context = useContext(MeetingContext);

  if (!context) {
    throw new Error("useReducedState hook must be used within a MeetingProvider");
  }

  const { state, dispatch } = context;
  return { state, dispatch };
};
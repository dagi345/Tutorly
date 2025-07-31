"use client";
import { useCallback } from "react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useMeetingActions = () => {
  const client = useStreamVideoClient();

  const createMeeting = useCallback(
    async (callId: string) => {
      if (!client) throw new Error("No client");
      const call = client.call("default", callId);
      await call.getOrCreate(); // creates if first time
      return call;
    },
    [client]
  );

  const joinMeeting = useCallback(
    async (callId: string) => {
      if (!client) throw new Error("No client");
      const call = client.call("default", callId);
      await call.join();
      return call;
    },
    [client]
  );

  return { createMeeting, joinMeeting };
};
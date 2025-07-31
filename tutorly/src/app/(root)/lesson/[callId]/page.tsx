"use client";
import { useParams, useSearchParams } from "next/navigation";
import { StreamVideo, StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useStreamClient } from "@/hooks/useStreamClient";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";
import { useState } from "react";
import LoaderUI from "@/components/Loader";
import useGetCallByID from "@/hooks/useGetCallByID";
import Stream from "stream";

type Role = "host" | "student";

export default function LessonRoomPage() {
  const { callId } = useParams();
  const search = useSearchParams();
  const role: Role = search.get("role") === "host" ? "host" : "student";
  const { user } = useUser();
  const client = useStreamClient();
  const [setupDone, setSetupDone] = useState(false);
  const {call}= useGetCallByID(callId as string);

  if (!callId || !user || !client) return <LoaderUI />;

  return (
    <StreamVideo client={client}>
      <StreamTheme>

      <StreamCall call={call}>
        {!setupDone ? (
          <MeetingSetup onSetupComplete={() => setSetupDone(true)} role={role} />
        ) : (
          <MeetingRoom role={role} />
        )}
      </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}


"use client";
import {
  SpeakerLayout,
  PaginatedGridLayout,
  CallControls,
  CallParticipantsList,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { EndCallButton } from "./EndCallButton";
import { Users, Layout, Grid } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  role: "host" | "student";
}

type LayoutType = "speaker-left" | "grid" | "speaker-right";

export default function MeetingRoom({ role }: Props) {

  const [layout, setlayout] = useState<LayoutType>('speaker-left')
  const [showParticipants, setShowParticipants] = useState(false)

 

  const CallLayout = () => {
    switch (layout) {
     
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right"/>;
    }
  }



  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative-flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
            <CallLayout />
        </div>
        <div className={cn("h-calc(100vh-86px) hidden", {'showBlock' : showParticipants})} >
          <CallParticipantsList onClose={() => setShowParticipants(false)}/>
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls />
        <EndCallButton  />
        <Button onClick={() => setShowParticipants(!showParticipants)}>
          {showParticipants ? "Hide Participants" : "Show Participants"}
        </Button>
      </div>
    </section>
  )

  
}
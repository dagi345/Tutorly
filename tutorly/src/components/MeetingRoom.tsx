"use client";
import {
  SpeakerLayout,
  PaginatedGridLayout,
  CallControls,
  CallParticipantsList,
  useCall,
} from "@stream-io/video-react-sdk";
import { EndCallButton } from "./EndCallButton";
import { Users, PanelLeft, PanelRight, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  role: "host" | "student";
  lessonId: string; // current lesson ID
}

type LayoutType = "speaker-left" | "grid" | "speaker-right";

export default function MeetingRoom({ role, lessonId }: Props) {
  const call = useCall();

  const [layout, setLayout] = useState<LayoutType>("speaker-left");

  const [showParticipants, setShowParticipants] = useState(false);

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };




  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            
          </div>

          {/* Layout toggles */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={layout === "speaker-left" ? "secondary" : "outline"}
              size="sm"
              aria-pressed={layout === "speaker-left"}
              onClick={() => setLayout("speaker-left")}
            >
              <PanelLeft className="size-4" />
              Left
            </Button>
            <Button
              variant={layout === "grid" ? "secondary" : "outline"}
              size="sm"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
            >
              <LayoutGrid className="size-4" />
              Grid
            </Button>
            <Button
              variant={layout === "speaker-right" ? "secondary" : "outline"}
              size="sm"
              aria-pressed={layout === "speaker-right"}
              onClick={() => setLayout("speaker-right")}
            >
              <PanelRight className="size-4" />
              Right
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showParticipants ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowParticipants((v) => !v)}
            >
              <Users className="size-4" />
              {showParticipants ? "Hide" : "People"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stage + Participants Drawer */}
      <div className="  flex h-[calc(100vh-56px)] gap-0 px-4">
        {/* Stage */}
        <div className="relative flex-1 items-center justify-center overflow-hidden rounded-xl border bg-black/80 shadow-xl m-8 p-8 pt-[120px] ">
          
            <CallLayout />
        </div>

        {/* Participants Drawer */}
        
        <div
          className={cn(
            "p-6 my-4  overflow-hidden rounded-xl border  shadow-xl transition-transform duration-300 md:static  md:translate-x-0",
            showParticipants && "translate-x-0"
          )}
        >

          <CallParticipantsList onClose={() => setShowParticipants(false)} />

        </div>

      </div>

      {/* Bottom Controls Dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex w-full items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-background/70 px-4 py-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <CallControls />

          <EndCallButton lessonId={lessonId} />
        </div>
      </div>

    </section>
  );
}


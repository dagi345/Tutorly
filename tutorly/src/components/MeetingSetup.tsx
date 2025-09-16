"use client";
import { useEffect, useState } from "react";
import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk";
import { CameraIcon, MicIcon, Settings2Icon, SettingsIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Props {
  onSetupComplete: () => void;
  role: "host" | "student";
}

export default function MeetingSetup({ onSetupComplete, role }: Props) {
  const call = useCall();
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [joining, setJoining] = useState(false);

  /* ---------- Hooks (top-level, no early return) ---------- */
  
  useEffect(() => {
    if (!call) return;
    call.camera.enable();
    call.microphone.enable();
  }, [call]);

  useEffect(() => {
    if (!call) return;
    cameraOn ? call.camera.enable() : call.camera.disable();
  }, [cameraOn, call]);

  useEffect(() => {
    if (!call) return;
    micOn ? call.microphone.enable() : call.microphone.disable();
  }, [micOn, call]);

 const handleJoin = async () => {
  if (!call || joining) return;
  setJoining(true);
  try {
    await call.join();
    onSetupComplete();
  } catch (e) {
    console.error(e);
  } finally {
    setJoining(false);
  }
};

  /* ---------- Render ---------- */
  if (!call) return <p className="p-4 text-center">No active call</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VIDEO PREVIEW CONTAINER */}
          <Card className="md:col-span-1 p-6 flex flex-col">
            <div>
              <h1 className="text-xl font-semibold mb-1">Camera Preview</h1>
              <p className="text-sm text-muted-foreground">Make sure you look good!</p>
            </div>

            {/* VIDEO PREVIEW */}
            <div className="mt-4 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-muted/50 border relative">
              <div className="absolute inset-0">
                <VideoPreview className="h-full w-full" />
              </div>
            </div>
          </Card>

          {/* CARD CONTROLS */}
          <Card className="md:col-span-1 p-6">
            <div className="h-full flex flex-col justify-between">
              {/* MEETING DETAILS */}
              <div>
                <h2 className="text-xl font-semibold mb-1">Meeting Details</h2>
                <p className="text-sm text-muted-foreground break-all">{call.id}</p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6 mt-8">
                  {/* CAM CONTROL */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CameraIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Camera</p>
                        <p className="text-sm text-muted-foreground">
                          {cameraOn ? "On" : "Off"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={cameraOn}
                      onCheckedChange={(checked) => setCameraOn(checked)}
                    />
                  </div>

                  {/* MIC CONTROL */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MicIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Microphone</p>
                        <p className="text-sm text-muted-foreground">
                          {micOn ? "On" : "Off"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={micOn}
                      onCheckedChange={(checked) => setMicOn(checked)}
                    />
                  </div>

                  {/* DEVICE SETTINGS */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ">
                        <SettingsIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Settings</p>
                        <p className="text-sm text-muted-foreground">Configure devices</p>
                      </div>
                    </div>


                    <DeviceSettings /> 

                  </div>

                </div>

                {/* JOIN BTN */}
                <div className="space-y-3 mt-8">
                  <Button
  size="lg"
  className="w-full"
  onClick={handleJoin}
  disabled={joining}
>
  {role === "host" ? "Start Meeting" : "Join Meeting"}
</Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Enjoy your meeting! Make sure to check your audio and video settings.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useCall } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  const handleEnd = async () => {
    await call?.leave();
    router.replace("/");
  };

  return (
    <Button variant="destructive" onClick={handleEnd}>
      End Call
    </Button>
  );
};
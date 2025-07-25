"use client";
import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";

export default function StreamProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const videoClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_KEY!,
      user: {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        image: user.imageUrl,
      },
      token: user.id, // simple mode for dev; production → server token
    });
    setClient(videoClient);
    return () => {
      videoClient.disconnectUser();
      return undefined;
    };
  }, [user, isLoaded]);

  if (!client) return <p className="p-8 text-center">Loading video…</p>;

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
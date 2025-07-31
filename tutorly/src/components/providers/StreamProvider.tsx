"use client"

import { useUser } from "@clerk/nextjs";
import {
  
  StreamVideo,
  StreamVideoClient,
  
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { tokenProvider } from "../../../actions/stream.actions";
import LoaderUI from "../Loader";


const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;






const StreamVideoProvider = ({children}: {children: React.ReactNode}) => {
  const [videoClient, setvideoClient] = useState<StreamVideoClient>();
  const {user , isLoaded} = useUser();


  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!apiKey) {
      throw new Error("Stream API key is not set");
    }

    const client = new StreamVideoClient ({ 
      apiKey: apiKey!, 
      user:{
        id:user?.id,
        name: user?.username || user?.id,
        image: user?.imageUrl
      },
      tokenProvider: tokenProvider,
    });

   
    setvideoClient(client);

  }, [user, isLoaded]);


  if (!videoClient) {
    return <LoaderUI />;
  }
  
  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};


export default StreamVideoProvider;
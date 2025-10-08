"use client";
import { useCall } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/userRole";
import { useState } from "react";
import ReviewModal from "./ReviewModal";

export const EndCallButton = ({ lessonId }: { lessonId: string }) => {
  const call = useCall();
  const router = useRouter();
  const role = useRole();

  if (!call) return null;

  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleEnd = async () => {
    
    await call?.leave();
    setShowReviewModal(true);
  };

  return (
    <div className="">

    <Button variant="destructive" onClick={handleEnd}>
      End Call
    </Button>

     <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        lessonId={lessonId} // dynamically pass the lesson id
     />
     
    </div>
    
  );
};




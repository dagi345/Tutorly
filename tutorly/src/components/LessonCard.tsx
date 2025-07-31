"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export default function LessonCard({ lesson, role }: any) {
  const router = useRouter();
  const client = useStreamVideoClient();
  const updateStatus = useMutation(api.lessons.updateStatus);
  const setCallId = useMutation(api.lessons.setCallId);

  const canStart = new Date() >= new Date(lesson.datetime);

const createMeeting = async () => {
  const id = crypto.randomUUID();
  const call = client?.call("default", id);
  if (!call) throw new Error("Stream client not ready");

  const createdCall = await call.getOrCreate({
    data: { starts_at: new Date(lesson.datetime).toISOString() },
  });

  // store for everyone
  await setCallId({ lessonId: lesson._id, callId: createdCall.call.id });

  // update status to started
  await updateStatus({ lessonId: lesson._id, status: "started" });

  router.push(`/lesson/${createdCall.call.id}?role=host`);
};

const joinMeeting = () => {
  if (!lesson.callId) {
    console.error("Tutor has not started the meeting yet");
    return;
  }
  router.push(`/lesson/${lesson.callId}?role=student`);
};

  const disabled =
    role === "tutor"
      ? !canStart
      : !lesson.callId || lesson.status !== "started";

  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="font-semibold">{format(new Date(lesson.datetime), "PPpp")}</p>
        <p className="text-sm text-slate-600">
          {role === "tutor" ? `Student: ${lesson.student.name}` : `Tutor: ${lesson.tutor.name}`}
        </p>
        <p>status : {lesson.status}</p>
      </div>
      <Button onClick={role === "tutor" ? createMeeting : joinMeeting}  className="ml-4">

            {role === "tutor" ? "Start meeting" : "Join meeting"}
            
      </Button>
    </div>
  );
}


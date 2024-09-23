import React from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();
  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };
  const onFeedback = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };
  return (
    <div className="border shadow-sm rounded-lg p-3">
      <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-gray-700">
        {interview?.jobExperience} Years of experience{" "}
      </h2>
      <h2 className="text-xs text-gray-400">
        Created At:{interview?.createdAt}
      </h2>
      <div className="mt-2 flex justify-between gap-5 ">
        <Button
          onClick={onFeedback}
          size="sm"
          variant="outline"
          className="w-full"
        >
          Feedback
        </Button>
        <Button onClick={onStart} className="w-full" size="sm">
          Start
        </Button>
      </div>
    </div>
  );
};

export default InterviewItemCard;

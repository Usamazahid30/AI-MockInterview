import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "../../../../../../components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "../../../../../../utils/GeminiAIModal";
import { db } from "../../../../../../utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { UserAnswer } from "../../../../../../utils/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../components/ui/dialog";
import { Textarea } from "../../../../../../components/ui/textarea";
import { Keyboard } from "lucide-react";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    const newTranscript = results.map((result) => result.transcript).join(" ");
    setUserAnswer((prevAnswer) => prevAnswer + " " + newTranscript);
  }, [results]);

  const parseAIResponse = (response) => {
    let cleanedResponse = response.replace(/```json\s?|\s?```/g, "");

    try {
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);

      const ratingMatch = cleanedResponse.match(
        /["']?rating["']?\s*:\s*["']?([^"'\s,}]+)/i
      );
      const feedbackMatch = cleanedResponse.match(
        /["']?feedback["']?\s*:\s*["']?([^"'\n]+)/i
      );

      return {
        rating: ratingMatch ? ratingMatch[1] : "N/A",
        feedback: feedbackMatch
          ? feedbackMatch[1].replace(/["']+$/, "")
          : "Unable to extract feedback",
      };
    }
  };

  const saveUserAnswer = useCallback(
    async (answerToSubmit) => {
      if (answerToSubmit.trim().length <= 10) {
        toast.error("Answer must be longer than 10 characters");
        return;
      }

      console.log("User Answer:", answerToSubmit);
      setLoading(true);
      try {
        const feedBackPrompt = `
        Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}
        User Answer: ${answerToSubmit}
        Based on the question and user answer, please provide a rating for the answer and feedback for areas of improvement in 3 to 5 lines. Respond in JSON format with 'rating' and 'feedback' fields.
      `;

        const result = await chatSession.sendMessage(feedBackPrompt);
        const mockJsonResp = await result.response.text();
        console.log("AI Response:", mockJsonResp);

        const jsonFeedbackResp = parseAIResponse(mockJsonResp);
        console.log("Parsed Feedback:", jsonFeedbackResp);

        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.Question,
          correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
          userAns: answerToSubmit.trim(),
          feedback: jsonFeedbackResp.feedback,
          rating: jsonFeedbackResp.rating,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        });

        if (resp) {
          toast.success("User Answer recorded successfully");
          setUserAnswer("");
          setTypedAnswer("");
          setResults([]);
        }
      } catch (error) {
        console.error("Error updating user answer:", error);
        toast.error("Failed to record user answer: " + error.message);
      } finally {
        setResults([]);
        setLoading(false);
        setIsDialogOpen(false);
      }
    },
    [
      mockInterviewQuestion,
      activeQuestionIndex,
      interviewData,
      user,
      setResults,
    ]
  );

  useEffect(() => {
    if (!isRecording && userAnswer.trim().length > 10) {
      saveUserAnswer(userAnswer);
    }
  }, [isRecording, userAnswer, saveUserAnswer]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
      console.log("Final User Answer:", userAnswer);
    } else {
      setUserAnswer(""); // Clear previous answer when starting new recording
      startSpeechToText();
    }
  };

  const handleTypedSubmit = () => {
    saveUserAnswer(typedAnswer);
  };

  if (error) {
    return <p>Web Speech API is not available in this browser 🔴</p>;
  }

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="flex flex-col justify-center items-center rounded-lg p-5 my-2">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          className="absolute"
          alt="Webcam overlay"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <div className="flex gap-2 my-4">
        <Button
          disabled={loading}
          variant="outline"
          className="text-blue-800"
          onClick={StartStopRecording}
        >
          {isRecording ? (
            <h2 className="text-red-600 flex gap-2">
              <Mic />
              Stop Recording...
            </h2>
          ) : (
            <span className="flex gap-2">
              <Mic /> Record Answer
            </span>
          )}
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-green-900">
              <span className="flex gap-2">
                <Keyboard /> Type Answer
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Type Your Answer</DialogTitle>
            </DialogHeader>
            <Textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
            />
            <Button onClick={handleTypedSubmit} disabled={loading}>
              Submit Answer
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      {loading && <p>Processing your answer...</p>}
      {interimResult && <p>Interim: {interimResult}</p>}
    </div>
  );
};

export default RecordAnswerSection;

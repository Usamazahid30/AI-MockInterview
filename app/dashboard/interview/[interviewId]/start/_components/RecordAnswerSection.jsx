// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import Webcam from "react-webcam";
// import { Button } from "../../../../../../components/ui/button";
// import useSpeechToText from "react-hook-speech-to-text";
// import { Mic } from "lucide-react";
// import { toast } from "sonner";
// import { chatSession } from "../../../../../../utils/GeminiAIModal";
// import { db } from "../../../../../../utils/db";
// import { useUser } from "@clerk/nextjs";
// import moment from "moment";
// import { UserAnswer } from "../../../../../../utils/schema";

// const RecordAnswerSection = ({
//   mockInterviewQuestion,
//   activeQuestionIndex,
//   interviewData,
// }) => {
//   const [userAnswer, setUserAnswer] = useState("");
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);
//   const {
//     error,
//     interimResult,
//     isRecording,
//     results,
//     startSpeechToText,
//     stopSpeechToText,
//   } = useSpeechToText({
//     continuous: true,
//     useLegacyResults: false,
//   });
//   useEffect(() => {
//     results.map((result) =>
//       setUserAnswer((prevAns) => prevAns + result?.transcript)
//     );
//   }, [results]);
//   useEffect(() => {
//     if (!isRecording && userAnswer.length > 10) {
//       UpdateUserAnswer();
//     }
//   }, [userAnswer]);

//   const StartStopRecording = async () => {
//     if (isRecording) {
//       stopSpeechToText();
//       console.log(userAnswer);
//       if (userAnswer?.length < 10) {
//         setLoading(false);
//         toast("Error while saving your answer,please record again");
//       }
//     } else {
//       startSpeechToText();
//     }
//   };
//   const UpdateUserAnswer = async () => {
//     console.log(userAnswer);
//     setLoading(true);
//     const feedbackPrompt =
//       "Question" +
//       mockInterviewQuestion[activeQuestionIndex]?.Question +
//       ", User Answer:" +
//       userAnswer +
//       ",Depends on question and user answer for give interview question " +
//       "please give us rating for answer and feedback area of improvement if any" +
//       "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

//     const result = await chatSession.sendMessage(feedbackPrompt);
//     const mockJsonResp = result.response
//       .text()
//       .replace("```json", "")
//       .replace("```", "");
//     console.log(mockJsonResp);
//     const jsonFeedbackResp = JSON.parse(mockJsonResp);

//     const resp = await db.insert(UserAnswer).values({
//       mockIdRef: interviewData?.mockId,
//       question: mockInterviewQuestion[activeQuestionIndex]?.Question,
//       correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
//       userAns: userAnswer,
//       feedback: jsonFeedbackResp?.feedback,
//       rating: jsonFeedbackResp?.rating,
//       userEmail: user?.primaryEmailAddress?.emailAddress,
//       createdAt: moment().format("YYYY-MM-DD"),
//     });

//     if (resp) {
//       toast("User Answer recorded sucessfully");
//     }
//     setUserAnswer("");
//     setLoading(false);
//   };

//   return (
//     <div className="flex justtify-center items-center flex-col">
//       <div className="flex flex-col justify-center items-center  rounded-lg p-5 my-2">
//         <Image
//           src={"/webcam.png"}
//           width={200}
//           height={200}
//           className="absolute"
//         />
//         <Webcam
//           mirrored={true}
//           style={{
//             height: 300,
//             width: "100%",
//             zIndex: 10,
//           }}
//         />
//       </div>
//       <Button
//         disabled={loading}
//         variant="Outline"
//         className="my-4 text-blue-800"
//         onClick={StartStopRecording}
//       >
//         {isRecording ? (
//           <h2 className="text-red-600 flex gap-2">
//             <Mic />
//             Stop Recording...
//           </h2>
//         ) : (
//           "Record Answer"
//         )}
//       </Button>
//       <Button className="mb-5" onClick={() => console.log(userAnswer)}>
//         Show User Answer
//       </Button>
//     </div>
//   );
// };

// export default RecordAnswerSection;

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
import { UserAnswer } from "../../../../../../utils/schema"; // Make sure this import path is correct

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
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

  const UpdateUserAnswer = useCallback(async () => {
    if (userAnswer.trim().length <= 10) return;

    console.log("User Answer:", userAnswer);
    setLoading(true);
    try {
      const feedBackPrompt = `
        Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}
        User Answer: ${userAnswer}
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
        userAns: userAnswer.trim(),
        feedback: jsonFeedbackResp.feedback,
        rating: jsonFeedbackResp.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      });

      if (resp) {
        toast.success("User Answer recorded successfully");
        setUserAnswer("");
        setResults([]);
      }
    } catch (error) {
      console.error("Error updating user answer:", error);
      toast.error("Failed to record user answer: " + error.message);
    } finally {
      setResults([]);
      setLoading(false);
    }
  }, [
    userAnswer,
    mockInterviewQuestion,
    activeQuestionIndex,
    interviewData,
    user,
  ]);

  useEffect(() => {
    if (!isRecording && userAnswer.trim().length > 10) {
      UpdateUserAnswer();
    }
  }, [isRecording, userAnswer, UpdateUserAnswer]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
      console.log("Final User Answer:", userAnswer);
    } else {
      setUserAnswer(""); // Clear previous answer when starting new recording
      startSpeechToText();
    }
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
      <Button
        disabled={loading}
        variant="outline"
        className="my-4 text-blue-800"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            <Mic />
            Stop Recording...
          </h2>
        ) : (
          "Start Recording"
        )}
      </Button>
      {loading && <p>Processing your answer...</p>}
      {interimResult && <p>Interim: {interimResult}</p>}
      <Button
        className="mb-5"
        onClick={() => console.log("Current User Answer:", userAnswer)}
      >
        Show User Answer
      </Button>
    </div>
  );
};

export default RecordAnswerSection;

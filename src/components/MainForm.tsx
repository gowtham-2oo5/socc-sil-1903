"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  Loader2,
  MessageSquare,
  Linkedin,
  Instagram,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the question types
type QuestionType =
  | "text"
  | "email"
  | "textarea"
  | "radio"
  | "select"
  | "leetcode"
  | "review";

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  difficulty?: "Easy" | "Medium" | "Hard";
  leetcodeProblem?: string;
  validation?: (value: string) => string | null;
}

// Validation functions
const validateIdNumber = (value: string): string | null => {
  if (!value) return "ID Number is required";
  if (!/^\d{10}$/.test(value)) return "ID Number must be exactly 10 digits";
  return null;
};

const validateUrl = (value: string): string | null => {
  if (!value) return "Solution link is required";

  try {
    const url = new URL(value);
    if (!url.protocol.startsWith("http")) {
      return "URL must start with http:// or https://";
    }
    return null;
  } catch (e) {
    console.log(e);
    return "Please enter a valid URL";
  }
};

// Reduced questions (1 Easy, 2 Medium)
const questions: Question[] = [
  {
    id: "name",
    type: "text",
    question: "What's your name?",
    required: true,
    validation: (value) => (!value ? "Name is required" : null),
  },
  {
    id: "idNumber",
    type: "text",
    question: "What's your ID Number?",
    required: true,
    validation: validateIdNumber,
  },
  {
    id: "department",
    type: "text",
    question: "What's your Department?",
    required: true,
    validation: (value) => (!value ? "Department is required" : null),
  },
  {
    id: "batch",
    type: "select",
    question: "What's your Batch?",
    options: ["Y24", "Y23", "Y22", "Y21", "Other"],
    required: true,
    validation: (value) => (!value ? "Batch selection is required" : null),
  },
  {
    id: "problem1",
    type: "leetcode",
    question: "Stock Buy and Sell",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.",
    difficulty: "Easy",
    leetcodeProblem:
      "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    required: true,
    validation: validateUrl,
  },
  {
    id: "problem2",
    type: "leetcode",
    question: "Move Zeroes",
    description:
      "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.",
    difficulty: "Easy",
    leetcodeProblem: "https://leetcode.com/problems/move-zeroes/",
    required: true,
    validation: validateUrl,
  },
  {
    id: "review",
    type: "review",
    question: "Review your submission",
    required: false,
  },
];

export default function TypeformUI() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const [firstTime, setfirstTime] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSubmitted(localStorage.getItem("submitted") === "true");
    }
  }, []);
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Validate current input
  const validateCurrentInput = (): boolean => {
    if (!currentQuestion.validation) return true;

    const error = currentQuestion.validation(answers[currentQuestion.id] || "");
    setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }));
    return error === null;
  };

  // Mock API call
  async function submitForm() {
    console.log(answers);
    const apiUrl =
      "https://9ojwkihuf2.execute-api.us-east-1.amazonaws.com/prod";

    // Construct request body from answers state
    const requestBody = {
      name: answers.name || "-",
      id: answers.idNumber || "-",
      dept: answers.department || "-",
      batch: answers.batch || "-",
      q1_link: answers.problem1 || "-",
      q2_link: answers.problem2 || "-",
      feedback: answers.finalComments || "-",
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      setShowSuccess(true);
      setSubmitted(true);
      localStorage.setItem("submitted", String(true));
      setfirstTime(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNext = () => {
    setAttemptedSubmit(true);

    // For review page, we don't need validation
    if (currentQuestion.type === "review") {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAttemptedSubmit(false);
      } else {
        submitForm();
      }
      return;
    }

    // Validate current input
    const isValid = validateCurrentInput();

    if (isValid) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAttemptedSubmit(false);
      } else {
        submitForm();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAttemptedSubmit(false);
    }
  };

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear error when user types
    setErrors((prev) => ({ ...prev, [questionId]: null }));

    // If user has attempted to submit, validate on change
    if (attemptedSubmit && currentQuestion.validation) {
      const error = currentQuestion.validation(value);
      setErrors((prev) => ({ ...prev, [questionId]: error }));
    }
  };

  const currentError = errors[currentQuestion.id];
  const canProceed = currentQuestion.type === "review" || !currentError;

  // Function to render required asterisk
  const renderRequired = (isRequired?: boolean) => {
    return isRequired ? <span className="text-red-500 ml-1">*</span> : null;
  };

  // Function to render error message
  const renderError = (error: string | null) => {
    if (!error) return null;

    return (
      <div className="flex items-center mt-1 text-red-500 text-sm">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span>{error}</span>
      </div>
    );
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case "text":
      case "email":
        return (
          <div className="space-y-2 w-full max-w-xl">
            <Label
              htmlFor={currentQuestion.id}
              className="font-mono flex items-center"
            >
              {currentQuestion.question}{" "}
              {renderRequired(currentQuestion.required)}
            </Label>
            <Input
              id={currentQuestion.id}
              type={currentQuestion.type}
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleInputChange(currentQuestion.id, e.target.value)
              }
              className={`w-full text-lg font-mono ${
                currentError ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Type your answer here..."
              autoFocus
            />
            {renderError(currentError)}
          </div>
        );
      case "textarea":
        return (
          <div className="space-y-2 w-full max-w-xl">
            <Label
              htmlFor={currentQuestion.id}
              className="font-mono flex items-center"
            >
              {currentQuestion.question}{" "}
              {renderRequired(currentQuestion.required)}
            </Label>
            <Textarea
              id={currentQuestion.id}
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleInputChange(currentQuestion.id, e.target.value)
              }
              className={`w-full text-lg font-mono min-h-[150px] ${
                currentError ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Type your answer here..."
              autoFocus
            />
            {renderError(currentError)}
          </div>
        );
      case "select":
        return (
          <div className="space-y-2 w-full max-w-xl">
            <Label
              htmlFor={currentQuestion.id}
              className="font-mono flex items-center"
            >
              {currentQuestion.question}{" "}
              {renderRequired(currentQuestion.required)}
            </Label>
            <Select
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value: string) =>
                handleInputChange(currentQuestion.id, value)
              }
            >
              <SelectTrigger
                id={currentQuestion.id}
                className={`w-full font-mono ${
                  currentError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion.options?.map((option) => (
                  <SelectItem key={option} value={option} className="font-mono">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError(currentError)}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            <div className="font-mono flex items-center mb-2">
              {currentQuestion.question}{" "}
              {renderRequired(currentQuestion.required)}
            </div>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) =>
                handleInputChange(currentQuestion.id, value)
              }
              className="space-y-3 max-w-md"
            >
              {currentQuestion.options?.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleInputChange(currentQuestion.id, option)}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label
                    htmlFor={option}
                    className="flex-grow cursor-pointer font-mono"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {renderError(currentError)}
          </div>
        );
      case "leetcode":
        return (
          <div className="space-y-6 w-full max-w-xl">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full font-mono ${
                  currentQuestion.difficulty === "Easy"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : currentQuestion.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <a
                href={`${currentQuestion.leetcodeProblem}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center font-mono"
              >
                View on LeetCode <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>

            <p className="text-sm text-muted-foreground font-mono mb-4">
              {currentQuestion.description}
            </p>

            <div className="space-y-2">
              <Label
                htmlFor={currentQuestion.id}
                className="font-mono flex items-center"
              >
                Your solution link {renderRequired(currentQuestion.required)}
              </Label>
              <Input
                id={currentQuestion.id}
                type="url"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleInputChange(currentQuestion.id, e.target.value)
                }
                className={`w-full font-mono ${
                  currentError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="https://leetcode.com/problems/..."
                autoFocus
              />
              {renderError(currentError)}
            </div>
          </div>
        );
      case "review":
        return (
          <div className="space-y-6 w-full max-w-2xl">
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-bold font-mono">Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-mono">Name:</div>
                <div className="font-mono">{answers.name || "-"}</div>

                <div className="font-mono">ID Number:</div>
                <div className="font-mono">{answers.idNumber || "-"}</div>

                <div className="font-mono">Department:</div>
                <div className="font-mono">{answers.department || "-"}</div>

                <div className="font-mono">Batch:</div>
                <div className="font-mono">{answers.batch || "-"}</div>
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-bold font-mono">Problem Solutions</h3>
              {questions
                .filter((q) => q.type === "leetcode")
                .map((problem, index) => (
                  <div
                    key={problem.id}
                    className="border-t pt-2 first:border-t-0 first:pt-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-mono font-medium">
                        {index + 1}. {problem.question}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-mono ${
                          problem.difficulty === "Easy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="font-mono text-sm mt-1 break-all">
                      {answers[problem.id] || (
                        <span className="text-red-500">
                          No solution provided
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalComments" className="font-mono">
                Any final comments?
              </Label>
              <Textarea
                id="finalComments"
                value={answers.finalComments || ""}
                onChange={(e) =>
                  handleInputChange("finalComments", e.target.value)
                }
                className="w-full font-mono min-h-[100px]"
                placeholder="Add any additional comments here..."
              />
              <p className="text-xs text-muted-foreground">
                This field is optional
              </p>
            </div>

            {isSubmitting && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 font-mono">
                  Submitting your solutions...
                </span>
              </div>
            )}

            {showSuccess && (
              <div
                ref={successRef}
                className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mb-2" />
                </motion.div>
                <motion.h3
                  className="text-xl font-bold font-mono mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Submission Successful!
                </motion.h3>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (submitted) {
    console.log("FORM SUBMITTED RAH");
    return (
      <div className="flex flex-col border rounded-lg border-6 items-center justify-center min-h-[500px] text-center font-mono">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <h2 className="text-3xl font-bold mb-4">Thank you!</h2>
          <p className="text-muted-foreground mb-8">
            Your SOCC - Leetcode Live Arrays edition solutions have been
            submitted successfully.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            <h3 className="text-xl font-semibold">Stay Connected with SOCC</h3>

            <a
              href="https://t.me/socctechclub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              Join our Telegram Group (SOCC-KLEF)
            </a>

            <div className="flex gap-4">
              <a
                href="https://linkedin.com/company/socc-klef"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </a>

              <a
                href="https://instagram.com/socc_klef"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[500px] relative font-mono">
      {firstTime ? (
        <div className="flex flex-col border rounded-lg border-6 items-center justify-center min-h-[500px] text-center font-mono">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <h2 className="text-3xl font-bold mb-4">Thank you!</h2>
            <p className="text-muted-foreground mb-8">
              Your SOCC - Leetcode Live Arrays edition solutions have been
              submitted successfully.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <h3 className="text-xl font-semibold">
                Stay Connected with SOCC
              </h3>

              <a
                href="https://t.me/socctechclub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                Join our Telegram Group (SOCC-KLEF)
              </a>

              <div className="flex gap-4">
                <a
                  href="https://linkedin.com/company/socc-klef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </a>

                <a
                  href="https://instagram.com/socc_klef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full h-1 bg-muted mb-8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex-grow flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-grow"
              >
                <h2 className="text-2xl font-bold mb-6">
                  {currentQuestion.question}
                </h2>
                {renderQuestionInput()}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center font-mono"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground font-mono">
              {currentQuestionIndex + 1} of {questions.length}
            </div>
            <Button
              onClick={handleNext}
              disabled={isSubmitting || !canProceed}
              className="flex items-center font-mono"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
          {/* Required fields note */}
          <div className="mt-4 text-xs text-muted-foreground">
            <span className="text-red-500">*</span> indicates required fields
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import QuizCard, { Question } from "./QuizCard";

// Types matching the user request payload
interface GeneratePayload {
  text: string;
  n_questions: number;
  topic: string;
  include_explanations: boolean;
}

// API Types
interface ApiChoice {
  label: string;
  text: string;
}

interface ApiQuestionItem {
  id: string;
  question: string;
  choices: ApiChoice[];
  correct_label: string;
  explanation: string;
}

interface ApiResponse {
  model: string;
  items: ApiQuestionItem[];
}

// Service to call the API
const generateQuestionsFromApi = async (payload: GeneratePayload): Promise<Question[]> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081";
  
  const response = await fetch(`${API_URL}/api/agent/mcq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      
    },
    body: JSON.stringify(payload),
  }); 

  if (!response.ok) {
    throw new Error("Failed to generate questions");
  }

  const data: ApiResponse = await response.json();

  return data.items.map((item) => {
    // Find the text of the correct answer using the label
    const correctAnswerText = item.choices.find(
      (c) => c.label === item.correct_label
    )?.text || "";

    return {
      id: item.id || Math.random().toString(36).substr(2, 9),
      question: item.question,
      options: item.choices.map((c) => c.text),
      correctAnswer: correctAnswerText,
      explanation: item.explanation,
    };
  });
};

export default function FlashcardDemo() {
  const [step, setStep] = useState<"input" | "loading" | "quiz" | "summary">("input");
  
  // Input State
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [nQuestions, setNQuestions] = useState(3);
  const includeExplanations = true;

  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({}); // track correct/incorrect by question ID

  const handleGenerate = async () => {
    if (!text || !topic) return;
    setStep("loading");
    try {
      const qs = await generateQuestionsFromApi({
        text,
        topic,
        n_questions: nQuestions,
        include_explanations: includeExplanations,
      });
      setQuestions(qs);
      setStep("quiz");
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnswers({});
    } catch (e) {
      console.error(e);
      setStep("input"); // Handle error gracefully in real app
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const currentQ = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: isCorrect }));
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setStep("summary");
    }
  };

  const reset = () => {
    setStep("input");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setText("");
    setTopic("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Klariti Flashcards
        </h1>
        <p className="text-zinc-400">
          Quiz yourself on some class topics rather than being distracted
        </p>
      </div>

      {/* Input Stage */}
      {step === "input" && (
        <div className="p-6 bg-[#18181B]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Add something you would like to be quizzed on
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
                placeholder="Paste your notes or text here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  placeholder="e.g. Basic Electricity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNQuestions(n)}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-all ${
                        nQuestions === n
                          ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20"
                          : "bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!text || !topic}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Generate Cards
            </button>
          </div>
        </div>
      )}

      {/* Loading Stage */}
      {step === "loading" && (
        <div className="text-center py-20 animate-in fade-in duration-500">
          <div className="inline-block w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-1">Generating Quiz</h3>
          <p className="text-sm text-zinc-500">analyzing content...</p>
        </div>
      )}

      {/* Quiz Stage */}
      {step === "quiz" && questions.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between text-zinc-400 text-sm font-mono uppercase tracking-widest">
            <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
            <span>{topic}</span>
          </div>
          
          <QuizCard
            key={questions[currentQuestionIndex].id} // Force re-render on change
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
          />

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={answers[questions[currentQuestionIndex].id] === undefined}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                answers[questions[currentQuestionIndex].id] !== undefined
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/25 translate-y-0"
                  : "bg-white/5 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Summary Stage */}
      {step === "summary" && (
        <div className="p-8 bg-[#18181B]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl text-center animate-in zoom-in-95 duration-500">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-zinc-400 mb-8">
            You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{questions.length}</span> correct.
          </p>

          <button
            onClick={reset}
            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

export default function QuizCard({ question, onAnswer, className = "" }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    setIsSubmitted(true);
    const isCorrect = option === question.correctAnswer;
    onAnswer(isCorrect);
  };

  const getOptionStyle = (option: string) => {
    if (!isSubmitted) {
      return "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300";
    }
    if (option === question.correctAnswer) {
      return "bg-green-500/20 border-green-500/50 text-green-200";
    }
    if (option === selectedOption && option !== question.correctAnswer) {
      return "bg-red-500/20 border-red-500/50 text-red-200";
    }
    return "bg-white/5 border-white/5 text-zinc-500 opacity-50";
  };

  return (
    <div className={`p-6 bg-[#18181B]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">{question.question}</h3>
      
      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={isSubmitted}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${getOptionStyle(
              option
            )}`}
          >
            <span className="font-mono text-sm mr-4 opacity-70">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1 font-medium">{option}</span>
            
            {isSubmitted && option === question.correctAnswer && (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            
            {isSubmitted && option === selectedOption && option !== question.correctAnswer && (
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {isSubmitted && question.explanation && (
        <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Explanation</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

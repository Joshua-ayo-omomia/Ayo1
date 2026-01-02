'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Flag, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Container, Header } from '@/components/layout';
import { Card, Button, Body, Caption } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getRandomQuestions, calculateResults, type Question } from '@/lib/questions';

const TOTAL_TIME = 30 * 60; // 30 minutes in seconds

export default function PracticeTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initialize questions
  useEffect(() => {
    setQuestions(getRandomQuestions(20));
  }, []);

  // Timer
  useEffect(() => {
    if (!timerEnabled || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    if (questions.length === 0) return;

    setIsSubmitting(true);
    const results = calculateResults(answers, questions);

    // Store results in sessionStorage for results page
    sessionStorage.setItem(
      'testResults',
      JSON.stringify({
        ...results,
        answers,
        questions,
        timeSpent: TOTAL_TIME - timeRemaining,
        type: 'practice',
      })
    );

    router.push('/test/regulations/results');
  }, [answers, questions, timeRemaining, router]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading questions...</div>
      </div>
    );
  }

  return (
    <>
      <Header currentPath="/test" />

      <div className="min-h-screen bg-surface py-8">
        <Container size="narrow">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-text-muted">Practice Test</p>
              <p className="text-lg font-semibold text-primary">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                {timerEnabled ? 'Pause' : 'Resume'}
              </button>
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full',
                  timeRemaining <= 300
                    ? 'bg-error/10 text-error'
                    : 'bg-surface text-text-secondary'
                )}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-border rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-6">
            {/* Question Text */}
            <p className="text-lg font-medium text-primary mb-8">
              {currentQuestion.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={cn(
                      'w-full p-4 text-left rounded-[6px] border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-text-muted hover:bg-surface'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-secondary'
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span
                        className={cn(
                          'text-sm',
                          isSelected ? 'text-primary' : 'text-text-secondary'
                        )}
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Flag for Review */}
            <div className="mt-8 pt-6 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagged.has(currentQuestion.id)}
                  onChange={handleFlag}
                  className="w-4 h-4 rounded border-border text-warning focus:ring-warning"
                />
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Flag className="w-4 h-4" />
                  Flag for review
                </div>
              </label>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-8 h-8 rounded-full text-xs font-medium transition-colors',
                    index === currentIndex
                      ? 'bg-primary text-white'
                      : answers[q.id] !== undefined
                      ? 'bg-accent/20 text-accent'
                      : 'bg-surface text-text-muted hover:bg-border',
                    flagged.has(q.id) && 'ring-2 ring-warning ring-offset-1'
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => setShowConfirmSubmit(true)}>
                Submit Test
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Question Navigator Summary */}
          <div className="mt-8 p-4 bg-white rounded-[6px] border border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                Answered: {answeredCount}/{questions.length}
              </span>
              <span className="text-text-muted">
                Flagged: {flagged.size}
              </span>
              {unansweredCount > 0 && (
                <span className="text-warning">
                  {unansweredCount} unanswered
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Submit Test?
              </h2>
              <Body className="mb-6">
                {unansweredCount > 0 ? (
                  <>
                    You have <strong>{unansweredCount} unanswered</strong>{' '}
                    question{unansweredCount > 1 ? 's' : ''}. Are you sure you
                    want to submit?
                  </>
                ) : (
                  'Are you sure you want to submit your test?'
                )}
              </Body>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Review Answers
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Submit Test
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

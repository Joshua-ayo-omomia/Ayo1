'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Card, Button, Badge, Heading, Subheading, Body, Caption } from '@/components/ui';
import { cn } from '@/lib/utils';
import { categoryLabels, type Question, type QuestionCategory } from '@/lib/questions';

interface TestResults {
  score: number;
  passed: boolean;
  total: number;
  correct: number;
  categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }>;
  incorrectQuestions: Question[];
  answers: Record<string, number>;
  questions: Question[];
  timeSpent: number;
  type: 'practice' | 'official';
}

export default function ResultsPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('testResults');
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Heading className="mb-4">No Results Found</Heading>
          <Body className="mb-6">
            It looks like you haven't completed a test yet.
          </Body>
          <Link href="/test/regulations">
            <Button>Go to Test Center</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const categories = Object.entries(results.categoryBreakdown).filter(
    ([, data]) => data.total > 0
  );

  return (
    <>
      <Header currentPath="/test" />

      <div className="min-h-screen bg-surface py-16">
        <Container size="narrow">
          {/* Score Card */}
          <Card className="p-12 text-center mb-8">
            <div
              className={cn(
                'w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center',
                results.passed ? 'bg-success/10' : 'bg-error/10'
              )}
            >
              {results.passed ? (
                <CheckCircle className="w-16 h-16 text-success" />
              ) : (
                <XCircle className="w-16 h-16 text-error" />
              )}
            </div>

            <div className="mb-4">
              <Badge variant={results.passed ? 'success' : 'error'} className="text-base px-4 py-1">
                {results.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>

            <p className="text-7xl font-bold text-primary mb-2">
              {results.score}%
            </p>
            <Caption className="text-lg">
              {results.correct} of {results.total} questions correct
            </Caption>

            <div className="mt-8 pt-8 border-t border-border flex justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
                  <Clock className="w-4 h-4" />
                  <Caption>Time Spent</Caption>
                </div>
                <p className="text-lg font-semibold text-primary">
                  {formatTime(results.timeSpent)}
                </p>
              </div>
              <div className="text-center">
                <Caption className="block mb-1">Pass Mark</Caption>
                <p className="text-lg font-semibold text-primary">70%</p>
              </div>
              <div className="text-center">
                <Caption className="block mb-1">Test Type</Caption>
                <p className="text-lg font-semibold text-primary capitalize">
                  {results.type}
                </p>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-8 mb-8">
            <Subheading className="mb-6">Performance by Category</Subheading>
            <div className="space-y-4">
              {categories.map(([category, data]) => {
                const percentage = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">
                        {categoryLabels[category as QuestionCategory]}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {data.correct}/{data.total}
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          percentage >= 70 ? 'bg-success' : 'bg-error'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Incorrect Answers */}
          {results.incorrectQuestions.length > 0 && (
            <Card className="p-8 mb-8">
              <button
                onClick={() => setShowIncorrect(!showIncorrect)}
                className="w-full flex items-center justify-between"
              >
                <Subheading>
                  Review Incorrect Answers ({results.incorrectQuestions.length})
                </Subheading>
                <span className="text-sm text-accent">
                  {showIncorrect ? 'Hide' : 'Show'}
                </span>
              </button>

              {showIncorrect && (
                <div className="mt-6 space-y-6">
                  {results.incorrectQuestions.map((question, index) => {
                    const userAnswer = results.answers[question.id];
                    return (
                      <div
                        key={question.id}
                        className="p-6 bg-surface rounded-[6px]"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-6 h-6 rounded-full bg-error/10 text-error text-xs font-medium flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-primary">
                            {question.question}
                          </p>
                        </div>

                        <div className="ml-9 space-y-2">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                            <div>
                              <Caption className="block mb-1">Your answer:</Caption>
                              <p className="text-sm text-error">
                                {question.options[userAnswer] || 'No answer'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <div>
                              <Caption className="block mb-1">Correct answer:</Caption>
                              <p className="text-sm text-success">
                                {question.options[question.correctAnswer]}
                              </p>
                            </div>
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-white rounded border border-border">
                              <Caption className="block mb-1">Explanation:</Caption>
                              <p className="text-sm text-text-secondary">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/test/regulations/practice">
              <Button variant="secondary" className="w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Test
              </Button>
            </Link>
            {results.passed && results.type === 'official' ? (
              <Link href="/apply/driver-licence">
                <Button className="w-full sm:w-auto">
                  Continue to Licence Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto">
                  Back to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </Container>
      </div>

      <Footer />
    </>
  );
}

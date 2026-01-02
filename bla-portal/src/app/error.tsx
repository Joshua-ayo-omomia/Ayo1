'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Button, Heading, Body } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px-200px)] bg-surface flex items-center justify-center py-16">
        <Container size="narrow">
          <div className="text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-error" />
            </div>

            <Heading className="mb-4">Something went wrong</Heading>
            <Body className="mb-8 max-w-md mx-auto">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </Body>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-surface rounded-[6px] text-left max-w-lg mx-auto">
                <p className="text-xs font-mono text-error break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="secondary">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}

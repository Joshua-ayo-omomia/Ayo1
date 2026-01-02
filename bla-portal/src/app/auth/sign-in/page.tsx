'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heading, Body, Button, Input, Card } from '@/components/ui';
import { signIn } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-primary">
            BLA
          </Link>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <Heading as="h1" className="text-2xl mb-2">
              Welcome back
            </Heading>
            <Body className="text-sm">
              Sign in to manage your applications
            </Body>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-error bg-error/10 rounded">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="text-accent hover:text-primary font-medium transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

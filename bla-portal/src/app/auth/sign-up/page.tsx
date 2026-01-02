'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heading, Body, Button, Input, Card } from '@/components/ui';
import { signUp } from '@/lib/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nationalId: '',
    dateOfBirth: '',
    phone: '',
    password: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    const result = await signUp(formData);

    if (result.success) {
      router.push('/auth/sign-in?registered=true');
    } else {
      setError(result.error || 'Failed to create account');
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
              Create your account
            </Heading>
            <Body className="text-sm">
              Get started with your driver licensing journey
            </Body>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-error bg-error/10 rounded">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="National ID"
              name="nationalId"
              type="text"
              placeholder="Enter your national ID"
              value={formData.nationalId}
              onChange={handleChange}
              required
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone (optional)"
              name="phone"
              type="tel"
              placeholder="+1 246 XXX XXXX"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-accent hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-accent hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            href="/auth/sign-in"
            className="text-accent hover:text-primary font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

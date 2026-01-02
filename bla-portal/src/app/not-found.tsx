import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Button, Heading, Body } from '@/components/ui';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px-200px)] bg-surface flex items-center justify-center py-16">
        <Container size="narrow">
          <div className="text-center">
            {/* 404 Visual */}
            <div className="mb-8">
              <span className="text-[120px] md:text-[180px] font-bold text-border leading-none">
                404
              </span>
            </div>

            <Heading className="mb-4">Page Not Found</Heading>
            <Body className="mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </Body>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button>
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="secondary">
                  <Search className="w-4 h-4 mr-2" />
                  Track Application
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-text-muted mb-4">Quick Links</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/apply/learners-permit" className="text-accent hover:underline">
                  Apply for Learner's Permit
                </Link>
                <span className="text-border">•</span>
                <Link href="/apply/drivers-licence" className="text-accent hover:underline">
                  Apply for Driver's Licence
                </Link>
                <span className="text-border">•</span>
                <Link href="/apply/renewal" className="text-accent hover:underline">
                  Renew Licence
                </Link>
                <span className="text-border">•</span>
                <Link href="/test/regulations" className="text-accent hover:underline">
                  Practice Test
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}

import Link from 'next/link';
import { FileText, Lock, Clock, CheckCircle, HelpCircle, BookOpen } from 'lucide-react';
import { Container, Header, Footer, PageHeader } from '@/components/layout';
import { Card, Button, Heading, Subheading, Body, Caption, Badge } from '@/components/ui';
import { getUser, createServerClient } from '@/lib/supabase';

async function getApplicationStatus(userId: string) {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', userId)
    .eq('type', 'learner_permit')
    .in('status', ['documents_verified', 'test_scheduled', 'approved'])
    .single();

  return data?.status || null;
}

export default async function RegulationsTestPage() {
  const user = await getUser();
  const applicationStatus = user ? await getApplicationStatus(user.id) : null;
  const canTakeOfficialTest = !!applicationStatus;

  return (
    <>
      <Header currentPath="/test" />

      <div className="bg-surface min-h-screen pb-16">
        <PageHeader
          title="Regulations Test"
          description="Test your knowledge of Barbados road regulations before your official examination."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Test Center', href: '/test' },
            { label: 'Regulations Test' },
          ]}
        />

        <Container>
          {/* Test Info */}
          <Card className="p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-accent" />
                </div>
                <p className="text-2xl font-semibold text-primary">20</p>
                <Caption>Questions</Caption>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <p className="text-2xl font-semibold text-primary">30</p>
                <Caption>Minutes</Caption>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <p className="text-2xl font-semibold text-primary">70%</p>
                <Caption>To Pass</Caption>
              </div>
            </div>
          </Card>

          {/* Test Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Practice Test */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <Subheading className="mb-1">Practice Test</Subheading>
                  <Body className="text-sm">
                    Prepare for your official test with unlimited practice attempts.
                    No time pressure.
                  </Body>
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Unlimited attempts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  See explanations for each answer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Track your progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Optional timer
                </li>
              </ul>

              <Link href="/test/regulations/practice">
                <Button className="w-full">Start Practice Test</Button>
              </Link>
            </Card>

            {/* Official Test */}
            <Card className={`p-8 ${!canTakeOfficialTest ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-golden/10 flex items-center justify-center flex-shrink-0">
                  {canTakeOfficialTest ? (
                    <FileText className="w-6 h-6 text-golden" />
                  ) : (
                    <Lock className="w-6 h-6 text-text-muted" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Subheading>Official Test</Subheading>
                    {!canTakeOfficialTest && (
                      <Badge variant="default">Locked</Badge>
                    )}
                  </div>
                  <Body className="text-sm">
                    Take your official regulations test to proceed with your
                    learner's permit application.
                  </Body>
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Timed examination (30 minutes)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Results saved to your application
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Official certificate on passing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Up to 3 attempts allowed
                </li>
              </ul>

              {canTakeOfficialTest ? (
                <Link href="/test/regulations/official">
                  <Button variant="accent" className="w-full">
                    Start Official Test
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full" disabled>
                    Start Official Test
                  </Button>
                  <Caption className="block text-center">
                    Complete your application and document verification to unlock
                  </Caption>
                </div>
              )}
            </Card>
          </div>

          {/* Topics Covered */}
          <Card className="p-8">
            <Subheading className="mb-6">Topics Covered</Subheading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Road Signs',
                'Right of Way',
                'Speed Limits',
                'Roundabouts',
                'Alcohol & Drug Laws',
                'Safety Equipment',
                'School Zones',
                'Driving Rules',
              ].map((topic) => (
                <div
                  key={topic}
                  className="p-4 bg-surface rounded-[6px] text-center"
                >
                  <p className="text-sm font-medium text-primary">{topic}</p>
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </div>

      <Footer />
    </>
  );
}

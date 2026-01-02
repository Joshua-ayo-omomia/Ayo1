import Link from 'next/link';
import { FileText, Car, RefreshCw } from 'lucide-react';
import {
  Hero,
  Heading,
  Body,
  SectionLabel,
  Card,
  Button,
} from '@/components/ui';
import { Header, Footer, Container } from '@/components/layout';

const services = [
  {
    icon: FileText,
    title: "Learner's Permit",
    description:
      'Start your driving journey. Apply for your learner's permit online and book your written test.',
  },
  {
    icon: Car,
    title: "Driver's Licence",
    description:
      'Ready for the road. Schedule your practical test and get your full driver's licence.',
  },
  {
    icon: RefreshCw,
    title: 'Licence Renewal',
    description:
      'Keep driving legally. Renew your licence online in minutes, no office visit required.',
  },
];

const stats = [
  { value: '50,000+', label: 'Licences Issued' },
  { value: '24hr', label: 'Average Processing' },
  { value: '99.9%', label: 'System Uptime' },
];

export default function Home() {
  return (
    <>
      <Header currentPath="/" />

      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Hero as="h1" className="mb-6">
              Driver Licensing. Simplified.
            </Hero>
            <p className="text-xl text-text-secondary max-w-[600px] mx-auto mb-10 leading-relaxed">
              Apply for permits, book tests, and renew your licence online.
              Fast, secure, and paperless.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg">Get Started</Button>
              <Button variant="ghost" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-surface">
        <Container>
          <div className="text-center mb-16">
            <SectionLabel className="mb-4 block">Services</SectionLabel>
            <Heading>Everything you need, online</Heading>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                hoverable
                className="text-center p-8"
              >
                <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-surface">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {service.title}
                </h3>
                <Body className="text-sm">{service.description}</Body>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-semibold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-[15px] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-border">
        <Container>
          <div className="text-center">
            <h2 className="text-[32px] font-semibold text-primary mb-8">
              Ready to get started?
            </h2>
            <Link href="/apply">
              <Button variant="accent" size="lg">
                Apply Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}

import { FileText, Car, RefreshCw } from 'lucide-react';
import { Footer } from '@/components/layout';

// Hero Section
function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-white px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-[56px] leading-[1.1] font-semibold tracking-tight text-[#0a2540] mb-6">
          Driver Licensing. Simplified.
        </h1>
        <p className="text-xl text-[#425466] max-w-[600px] mx-auto mb-10 leading-relaxed">
          Apply for permits, book tests, and renew your licence online. Fast, secure, and paperless.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center justify-center h-12 px-8 bg-[#0a2540] text-white font-medium rounded-lg hover:bg-[#1a3a5c] transition-colors"
          >
            Get Started
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center h-12 px-8 bg-transparent text-[#0a2540] font-medium rounded-lg border border-[#e6ebf1] hover:border-[#0a2540] transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

// Service Card Component
function ServiceCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e6ebf1] p-8 hover:shadow-lg hover:border-[#d4a012]/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-[#f6f9fc] flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-[#0a2540]" />
      </div>
      <h3 className="text-lg font-semibold text-[#0a2540] mb-3">{title}</h3>
      <p className="text-[#425466] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Services Section
function ServicesSection() {
  const services = [
    {
      icon: FileText,
      title: "Learner's Permit",
      description:
        'Start your driving journey. Apply for your learner\'s permit online and book your written test in minutes.',
    },
    {
      icon: Car,
      title: "Driver's Licence",
      description:
        'Ready to hit the road? Schedule your practical driving test and get your full licence.',
    },
    {
      icon: RefreshCw,
      title: 'Licence Renewal',
      description:
        'Keep your licence current. Renew online before expiry and receive your new card by mail.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#f6f9fc] px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#d4a012] uppercase mb-4">
            Services
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0a2540]">
            Everything you need, online
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Stat Item Component
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl font-semibold text-[#0a2540] mb-2">{value}</div>
      <div className="text-[15px] text-[#8898aa]">{label}</div>
    </div>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { value: '50,000+', label: 'Licences Issued' },
    { value: '24hr', label: 'Average Processing' },
    { value: '99.9%', label: 'System Uptime' },
  ];

  return (
    <section className="py-16 md:py-24 bg-white px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-white px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-[32px] font-semibold text-[#0a2540] mb-8">
          Ready to get started?
        </h2>
        <a
          href="#"
          className="inline-flex items-center justify-center h-12 px-8 bg-[#d4a012] text-white font-medium rounded-lg hover:bg-[#c4920a] transition-colors"
        >
          Apply Now
        </a>
      </div>
    </section>
  );
}

// Main Page
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

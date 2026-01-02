'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Car,
  Bike,
  Truck,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Card, Button, Badge, Heading, Body, Caption, Mono } from '@/components/ui';
import { cn } from '@/lib/utils';

type VerificationStatus = 'valid' | 'expired' | 'invalid' | 'loading';

interface LicenceData {
  licenceNumber: string;
  holderName: string;
  holderPhoto: string | null;
  dateOfBirth: string;
  classes: string[];
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
}

const classIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  class_1: { icon: <Car className="w-5 h-5" />, label: 'Private Vehicle (Class 1)' },
  class_2: { icon: <Bike className="w-5 h-5" />, label: 'Motorcycle (Class 2)' },
  class_3: { icon: <Truck className="w-5 h-5" />, label: 'Commercial (Class 3)' },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  active: {
    label: 'Valid',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <CheckCircle className="w-8 h-8" />,
  },
  expired: {
    label: 'Expired',
    color: 'text-error',
    bgColor: 'bg-error/10',
    icon: <AlertTriangle className="w-8 h-8" />,
  },
  suspended: {
    label: 'Suspended',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: <AlertTriangle className="w-8 h-8" />,
  },
  revoked: {
    label: 'Revoked',
    color: 'text-error',
    bgColor: 'bg-error/10',
    icon: <XCircle className="w-8 h-8" />,
  },
};

export default function VerifyPage() {
  const params = useParams();
  const code = params.code as string;
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [licence, setLicence] = useState<LicenceData | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);

  useEffect(() => {
    async function verifyLicence() {
      setStatus('loading');

      // Simulate API verification
      await new Promise((r) => setTimeout(r, 1500));

      // Mock verification based on code format
      if (code.startsWith('VRF-')) {
        // Valid verification code
        const isExpired = code.includes('EXP');

        setLicence({
          licenceNumber: 'BL-A1B2C3D4',
          holderName: 'Sarah Marie Johnson',
          holderPhoto: null,
          dateOfBirth: '1998-06-15',
          classes: ['class_1', 'class_2'],
          issueDate: '2025-01-02',
          expiryDate: isExpired ? '2024-01-02' : '2030-01-02',
          status: isExpired ? 'expired' : 'active',
        });
        setStatus(isExpired ? 'expired' : 'valid');
        setVerifiedAt(new Date());
      } else {
        // Invalid code
        setStatus('invalid');
        setVerifiedAt(new Date());
      }
    }

    verifyLicence();
  }, [code]);

  const handleRefresh = () => {
    setStatus('loading');
    setLicence(null);
    // Re-trigger verification
    setTimeout(() => {
      if (code.startsWith('VRF-')) {
        const isExpired = code.includes('EXP');
        setLicence({
          licenceNumber: 'BL-A1B2C3D4',
          holderName: 'Sarah Marie Johnson',
          holderPhoto: null,
          dateOfBirth: '1998-06-15',
          classes: ['class_1', 'class_2'],
          issueDate: '2025-01-02',
          expiryDate: isExpired ? '2024-01-02' : '2030-01-02',
          status: isExpired ? 'expired' : 'active',
        });
        setStatus(isExpired ? 'expired' : 'valid');
      } else {
        setStatus('invalid');
      }
      setVerifiedAt(new Date());
    }, 1500);
  };

  return (
    <>
      <Header currentPath="" />

      <div className="min-h-screen bg-surface py-12">
        <Container size="narrow">
          {/* Official Banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Official Verification Portal
              </span>
            </div>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <Heading className="mb-2">Verifying Licence</Heading>
              <Body className="mb-6">
                Please wait while we verify this licence...
              </Body>
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Invalid State */}
          {status === 'invalid' && (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-error" />
              </div>
              <Heading className="mb-2">Invalid Verification Code</Heading>
              <Body className="mb-6 max-w-md mx-auto">
                The verification code provided is not valid. Please check the code and try again, or contact the licence holder for a valid verification link.
              </Body>

              <div className="p-4 bg-surface rounded-[6px] mb-8 inline-block">
                <Caption className="block mb-1">Verification Attempted</Caption>
                {verifiedAt && (
                  <p className="text-sm font-medium text-primary">
                    {format(verifiedAt, 'MMMM d, yyyy h:mm:ss a')}
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/">
                  <Button variant="ghost">Go to Homepage</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Valid/Expired State */}
          {(status === 'valid' || status === 'expired') && licence && (
            <>
              {/* Status Card */}
              <Card
                className={cn(
                  'p-8 mb-6 text-center border-2',
                  licence.status === 'active'
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                )}
              >
                <div
                  className={cn(
                    'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
                    statusConfig[licence.status].bgColor,
                    statusConfig[licence.status].color
                  )}
                >
                  {statusConfig[licence.status].icon}
                </div>

                <div className="mb-6">
                  <Badge
                    variant={licence.status === 'active' ? 'success' : 'error'}
                    className="text-lg px-6 py-2 mb-4"
                  >
                    {statusConfig[licence.status].label}
                  </Badge>
                  <Heading className="mb-2">
                    {licence.status === 'active'
                      ? 'Licence Verified'
                      : 'Licence Expired'}
                  </Heading>
                  <Body>
                    {licence.status === 'active'
                      ? 'This driver\'s licence is valid and active.'
                      : 'This driver\'s licence has expired and is no longer valid.'}
                  </Body>
                </div>

                {/* Verification Timestamp */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">
                    Verified: {verifiedAt && format(verifiedAt, 'MMM d, yyyy h:mm:ss a')}
                  </span>
                </div>
              </Card>

              {/* Licence Details */}
              <Card className="p-6 mb-6">
                <div className="flex items-start gap-6">
                  {/* Photo */}
                  <div className="w-24 h-28 rounded-[6px] bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    {licence.holderPhoto ? (
                      <img
                        src={licence.holderPhoto}
                        alt="Licence holder"
                        className="w-full h-full object-cover rounded-[6px]"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-accent/10 mx-auto mb-1 flex items-center justify-center">
                          <span className="text-base font-semibold text-accent">
                            {licence.holderName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted">PHOTO</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-primary mb-4">
                      {licence.holderName}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Caption className="block mb-1">Licence Number</Caption>
                        <Mono className="text-primary font-medium">
                          {licence.licenceNumber}
                        </Mono>
                      </div>
                      <div>
                        <Caption className="block mb-1">Date of Birth</Caption>
                        <p className="text-primary font-medium">
                          {format(new Date(licence.dateOfBirth), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <Caption className="block mb-1">Issue Date</Caption>
                        <p className="text-primary font-medium">
                          {format(new Date(licence.issueDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <Caption className="block mb-1">Expiry Date</Caption>
                        <p
                          className={cn(
                            'font-medium',
                            licence.status === 'active' ? 'text-primary' : 'text-error'
                          )}
                        >
                          {format(new Date(licence.expiryDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Licence Classes */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Licence Classes
                </h3>
                <div className="space-y-3">
                  {licence.classes.map((cls) => (
                    <div
                      key={cls}
                      className="flex items-center gap-3 p-3 bg-surface rounded-[6px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        {classIcons[cls]?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {classIcons[cls]?.label}
                        </p>
                        <Caption>Authorized to operate</Caption>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success ml-auto" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Official Notice */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-[6px] text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    For Official Verification Only
                  </span>
                </div>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  This verification is provided by the Barbados Licensing Authority.
                  For any discrepancies or concerns, please contact our office directly.
                </p>
              </div>

              {/* Refresh Button */}
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Verification
                </Button>
              </div>
            </>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
}

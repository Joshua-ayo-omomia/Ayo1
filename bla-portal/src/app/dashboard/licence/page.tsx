'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Car,
  Bike,
  Truck,
  Download,
  Share2,
  Wallet,
  Smartphone,
  RotateCcw,
  Shield,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Card, Button, Badge, Heading, Subheading, Body, Caption, Label, Mono } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock licence data
const mockLicence = {
  id: 'lic-001',
  licenceNumber: 'BL-A1B2C3D4',
  verificationCode: 'VRF-2025-ABCD1234',
  status: 'active' as const,
  holder: {
    fullName: 'Sarah Marie Johnson',
    dateOfBirth: '1998-06-15',
    nationalId: '123456789',
    photo: null, // Would be actual photo URL
    address: '45 Palm Beach Drive, Christ Church, Barbados',
    emergencyContact: 'John Johnson (+1 246 555 0456)',
  },
  classes: ['class_1', 'class_2'], // Car and motorcycle
  restrictions: ['Corrective lenses required'],
  issueDate: '2025-01-02',
  expiryDate: '2030-01-02',
};

const classIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  class_1: { icon: <Car className="w-5 h-5" />, label: 'Private Vehicle' },
  class_2: { icon: <Bike className="w-5 h-5" />, label: 'Motorcycle' },
  class_3: { icon: <Truck className="w-5 h-5" />, label: 'Commercial' },
};

// Simple QR Code generator component (creates SVG-based QR pattern)
function QRCode({ data, size = 120 }: { data: string; size?: number }) {
  // Generate a deterministic pattern based on data string
  const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gridSize = 21;
  const cellSize = size / gridSize;

  const cells: boolean[][] = [];
  for (let i = 0; i < gridSize; i++) {
    cells[i] = [];
    for (let j = 0; j < gridSize; j++) {
      // Fixed patterns for QR corners
      const isCorner =
        (i < 7 && j < 7) ||
        (i < 7 && j >= gridSize - 7) ||
        (i >= gridSize - 7 && j < 7);

      if (isCorner) {
        // Corner patterns
        const inOuter = i < 7 && j < 7 ? (i === 0 || i === 6 || j === 0 || j === 6) :
                       i < 7 && j >= gridSize - 7 ? (i === 0 || i === 6 || j === gridSize - 7 || j === gridSize - 1) :
                       (i === gridSize - 7 || i === gridSize - 1 || j === 0 || j === 6);
        const inInner = i < 7 && j < 7 ? (i >= 2 && i <= 4 && j >= 2 && j <= 4) :
                       i < 7 && j >= gridSize - 7 ? (i >= 2 && i <= 4 && j >= gridSize - 5 && j <= gridSize - 3) :
                       (i >= gridSize - 5 && i <= gridSize - 3 && j >= 2 && j <= 4);
        cells[i][j] = inOuter || inInner;
      } else {
        // Data pattern (pseudo-random based on hash)
        cells[i][j] = ((hash * (i + 1) * (j + 1)) % 3) === 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {cells.map((row, i) =>
        row.map((cell, j) =>
          cell ? (
            <rect
              key={`${i}-${j}`}
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0a2540"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// Barcode component
function Barcode({ data, width = 200, height = 40 }: { data: string; width?: number; height?: number }) {
  const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bars = 40;
  const barWidth = width / bars;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const isBar = ((hash * (i + 1)) % 3) !== 2;
        const barHeight = isBar ? height : height * 0.3;
        return (
          <rect
            key={i}
            x={i * barWidth}
            y={(height - barHeight) / 2}
            width={barWidth * 0.6}
            height={barHeight}
            fill="#0a2540"
          />
        );
      })}
    </svg>
  );
}

export default function DigitalLicencePage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const licence = mockLicence;
  const isExpired = new Date(licence.expiryDate) < new Date();
  const isExpiringSoon = !isExpired &&
    (new Date(licence.expiryDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate download
    await new Promise((r) => setTimeout(r, 1500));
    setIsDownloading(false);
    alert('Licence image downloaded! (This would trigger actual download)');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Digital Licence',
          text: `Verify my licence: ${licence.licenceNumber}`,
          url: `/verify/${licence.verificationCode}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/verify/${licence.verificationCode}`
      );
      alert('Verification link copied to clipboard!');
    }
  };

  return (
    <>
      <Header currentPath="/dashboard" />

      <div className="min-h-screen bg-surface py-12">
        <Container size="narrow">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-golden/10 rounded-full mb-6">
              <Shield className="w-4 h-4 text-golden" />
              <span className="text-sm font-medium text-golden">Digital Licence</span>
            </div>
            <Heading className="mb-2">Your Digital Driver's Licence</Heading>
            <Body className="max-w-md mx-auto">
              Your official digital licence card. Tap to flip and reveal the QR code for verification.
            </Body>
          </div>

          {/* Status Banner */}
          {isExpired && (
            <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-[6px] flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <div>
                <p className="font-medium text-error">Licence Expired</p>
                <p className="text-sm text-error/80">
                  Your licence expired on {format(new Date(licence.expiryDate), 'MMMM d, yyyy')}.{' '}
                  <Link href="/apply/renewal" className="underline">Renew now</Link>
                </p>
              </div>
            </div>
          )}

          {isExpiringSoon && (
            <div className="mb-8 p-4 bg-warning/10 border border-warning/20 rounded-[6px] flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Expiring Soon</p>
                <p className="text-sm text-text-secondary">
                  Your licence expires on {format(new Date(licence.expiryDate), 'MMMM d, yyyy')}.{' '}
                  <Link href="/apply/renewal" className="text-warning underline">Renew now</Link>
                </p>
              </div>
            </div>
          )}

          {/* Licence Card Container */}
          <div className="flex justify-center mb-12">
            <div
              ref={cardRef}
              className="relative cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Card Wrapper - Credit card aspect ratio 3.375:2.125 */}
              <div
                className={cn(
                  'relative w-[340px] h-[214px] md:w-[420px] md:h-[264px] transition-transform duration-700',
                  isFlipped && '[transform:rotateY(180deg)]'
                )}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-[12px] overflow-hidden',
                    'bg-white border-2 border-primary shadow-lg',
                    '[backface-visibility:hidden]'
                  )}
                >
                  {/* Watermark - Trident silhouette */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]"
                  >
                    <svg viewBox="0 0 100 120" className="w-32 h-40 md:w-40 md:h-48">
                      <path
                        fill="#0a2540"
                        d="M50 0 L50 80 M50 80 L30 100 M50 80 L70 100 M50 20 L35 35 M50 20 L65 35 M35 35 L35 50 M65 35 L65 50 M40 10 L40 30 M60 10 L60 30 M50 100 L50 120 M45 115 L55 115"
                        strokeWidth="4"
                        stroke="#0a2540"
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-4 md:p-5 flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-3 md:mb-4">
                      <p className="text-[10px] md:text-xs font-semibold tracking-wider text-primary uppercase">
                        Barbados Licensing Authority
                      </p>
                      <p className="text-[9px] md:text-[10px] font-medium tracking-wide text-accent uppercase">
                        Driver's Licence
                      </p>
                    </div>

                    {/* Main Content */}
                    <div className="flex gap-3 md:gap-4 flex-1">
                      {/* Photo */}
                      <div className="w-20 h-24 md:w-24 md:h-28 rounded-[6px] bg-surface border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {licence.holder.photo ? (
                          <img
                            src={licence.holder.photo}
                            alt="Licence photo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 mx-auto mb-1 flex items-center justify-center">
                              <span className="text-sm md:text-base font-semibold text-accent">
                                {licence.holder.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-[8px] text-text-muted">PHOTO</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-primary truncate mb-2">
                          {licence.holder.fullName}
                        </p>

                        <div className="space-y-1 text-[10px] md:text-xs">
                          <div className="flex justify-between">
                            <span className="text-text-muted">DOB</span>
                            <span className="text-primary font-medium">
                              {format(new Date(licence.holder.dateOfBirth), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">ID</span>
                            <span className="text-primary font-medium">{licence.holder.nationalId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Licence No.</span>
                            <Mono className="text-primary font-medium text-[10px] md:text-xs">
                              {licence.licenceNumber}
                            </Mono>
                          </div>
                        </div>

                        {/* Classes */}
                        <div className="flex gap-2 mt-2 md:mt-3">
                          {licence.classes.map((cls) => (
                            <div
                              key={cls}
                              className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded text-accent"
                              title={classIcons[cls]?.label}
                            >
                              <span className="[&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4">
                                {classIcons[cls]?.icon}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-[9px] md:text-[10px]">
                        <span className="text-text-muted">Issue: </span>
                        <span className="text-primary font-medium">
                          {format(new Date(licence.issueDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="text-[9px] md:text-[10px]">
                        <span className="text-text-muted">Expiry: </span>
                        <span className={cn(
                          'font-medium',
                          isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : 'text-primary'
                        )}>
                          {format(new Date(licence.expiryDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Golden accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-golden" />
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-[12px] overflow-hidden',
                    'bg-white border-2 border-primary shadow-lg',
                    '[backface-visibility:hidden] [transform:rotateY(180deg)]'
                  )}
                >
                  {/* Content */}
                  <div className="relative h-full p-4 md:p-5 flex flex-col">
                    {/* QR Code - Center */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="p-2 bg-white rounded-[6px] border border-border shadow-sm mb-2">
                        <QRCode
                          data={`${licence.verificationCode}-${licence.licenceNumber}`}
                          size={80}
                        />
                      </div>
                      <p className="text-[9px] md:text-[10px] text-text-muted text-center">
                        Scan to verify
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-[9px] md:text-[10px] mb-3">
                      <div>
                        <span className="text-text-muted">Address: </span>
                        <span className="text-primary">{licence.holder.address}</span>
                      </div>
                      {licence.restrictions.length > 0 && (
                        <div>
                          <span className="text-text-muted">Restrictions: </span>
                          <span className="text-warning">{licence.restrictions.join(', ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-text-muted">Emergency: </span>
                        <span className="text-primary">{licence.holder.emergencyContact}</span>
                      </div>
                    </div>

                    {/* Barcode */}
                    <div className="flex justify-center">
                      <Barcode data={licence.licenceNumber} width={160} height={30} />
                    </div>
                    <p className="text-center text-[8px] text-text-muted mt-1">
                      {licence.licenceNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flip indicator */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-muted">
                <RotateCcw className="w-3 h-3" />
                <span className="text-xs">Tap to flip</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 pt-4">
            <Button
              variant="secondary"
              onClick={handleDownload}
              loading={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download as Image
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Add to Wallet Section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-5 h-5 text-accent" />
              <Subheading>Add to Digital Wallet</Subheading>
            </div>
            <Body className="mb-6">
              Add your licence to your phone's digital wallet for quick access.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-[8px] hover:bg-black/90 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <span className="font-medium">Add to Apple Wallet</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-border rounded-[8px] hover:bg-surface transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-primary">Add to Google Wallet</span>
              </button>
            </div>
          </Card>

          {/* Verification Link */}
          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <Subheading className="mb-2">Verification Link</Subheading>
                <Body className="mb-4">
                  Share this link for official verification of your licence status.
                </Body>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-3 py-2 bg-white rounded-[6px] text-sm font-mono text-text-secondary overflow-x-auto">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/verify/{licence.verificationCode}
                  </code>
                  <Link href={`/verify/${licence.verificationCode}`} target="_blank">
                    <Button size="sm" variant="secondary">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </div>

      <Footer />
    </>
  );
}


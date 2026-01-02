'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FileText,
  Clock,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';
import { Card, Button, Badge, Heading, Subheading, Body, Caption, Mono } from '@/components/ui';
import { cn } from '@/lib/utils';

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, trend, icon, iconBg }: StatCardProps) {
  const isPositive = trend >= 0;
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-[6px] flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-success' : 'text-error'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {isPositive ? '+' : ''}{trend}%
        </div>
      </div>
      <p className="text-3xl font-semibold text-primary mb-1">{value}</p>
      <Caption>{title}</Caption>
    </Card>
  );
}

// Simple Line Chart Component
interface LineChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

function LineChart({ data, labels, height = 200 }: LineChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-text-muted py-2">
        <span>{max}</span>
        <span>{Math.round((max + min) / 2)}</span>
        <span>{min}</span>
      </div>

      {/* Chart area */}
      <div className="ml-12 h-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-border" />
          ))}
        </div>

        {/* SVG Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#635bff"
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          {/* Area fill */}
          <polygon
            fill="url(#gradient)"
            points={`0,100 ${points} 100,100`}
            opacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#635bff" />
              <stop offset="100%" stopColor="#635bff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-muted transform translate-y-5">
          {labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0).map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end justify-around gap-4" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / max) * 100;
        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-sm font-medium text-primary">{item.value}</span>
            <div
              className="w-full max-w-[60px] rounded-t-[4px] transition-all"
              style={{
                height: `${barHeight}%`,
                backgroundColor: item.color,
                minHeight: 4,
              }}
            />
            <span className="text-xs text-text-muted text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Mock data
const stats = [
  {
    title: "Today's Applications",
    value: 47,
    trend: 12,
    icon: <FileText className="w-6 h-6 text-accent" />,
    iconBg: 'bg-accent/10',
  },
  {
    title: 'Pending Reviews',
    value: 23,
    trend: -5,
    icon: <Clock className="w-6 h-6 text-warning" />,
    iconBg: 'bg-warning/10',
  },
  {
    title: "Today's Tests",
    value: 18,
    trend: 8,
    icon: <ClipboardCheck className="w-6 h-6 text-success" />,
    iconBg: 'bg-success/10',
  },
  {
    title: 'Revenue Today',
    value: 'BDS $12,450',
    trend: 15,
    icon: <DollarSign className="w-6 h-6 text-golden" />,
    iconBg: 'bg-golden/10',
  },
];

const applicationTrend = [
  32, 45, 38, 52, 48, 55, 42, 58, 62, 55, 48, 52, 58, 65, 72,
  68, 75, 82, 78, 85, 92, 88, 95, 102, 98, 105, 112, 108, 115, 47,
];

const applicationLabels = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return format(date, 'MMM d');
});

const applicationsByType = [
  { label: "Learner's Permit", value: 156, color: '#635bff' },
  { label: "Driver's Licence", value: 89, color: '#0a2540' },
  { label: 'Renewal', value: 234, color: '#d4a012' },
  { label: 'Replacement', value: 45, color: '#00a67e' },
];

const recentApplications = [
  {
    id: '1',
    reference: 'BLA-2025-00147',
    applicant: 'Sarah Johnson',
    type: 'learner_permit',
    status: 'pending',
    submitted: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    reference: 'BLA-2025-00146',
    applicant: 'Michael Brown',
    type: 'driver_licence',
    status: 'under_review',
    submitted: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '3',
    reference: 'BLA-2025-00145',
    applicant: 'Emily Davis',
    type: 'renewal',
    status: 'approved',
    submitted: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '4',
    reference: 'BLA-2025-00144',
    applicant: 'James Wilson',
    type: 'learner_permit',
    status: 'documents_pending',
    submitted: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '5',
    reference: 'BLA-2025-00143',
    applicant: 'Lisa Anderson',
    type: 'driver_licence',
    status: 'pending',
    submitted: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },
];

const todaysSchedule = [
  {
    id: '1',
    time: '09:00',
    applicant: 'Robert Thompson',
    testType: 'Written Test',
    location: 'Room A',
    status: 'completed',
    result: 'passed',
  },
  {
    id: '2',
    time: '10:30',
    applicant: 'Amanda Clarke',
    testType: 'Driving Test',
    location: 'Course B',
    status: 'completed',
    result: 'passed',
  },
  {
    id: '3',
    time: '11:00',
    applicant: 'David Miller',
    testType: 'Written Test',
    location: 'Room A',
    status: 'in_progress',
  },
  {
    id: '4',
    time: '14:00',
    applicant: 'Jennifer White',
    testType: 'Driving Test',
    location: 'Course A',
    status: 'scheduled',
  },
  {
    id: '5',
    time: '15:30',
    applicant: 'Christopher Lee',
    testType: 'Driving Test',
    location: 'Course B',
    status: 'scheduled',
  },
];

const typeLabels: Record<string, string> = {
  learner_permit: "Learner's Permit",
  driver_licence: "Driver's Licence",
  renewal: 'Renewal',
  replacement: 'Replacement',
};

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  documents_pending: { label: 'Docs Pending', variant: 'default' },
};

type SortField = 'reference' | 'applicant' | 'type' | 'status' | 'submitted';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboard() {
  const [sortField, setSortField] = useState<SortField>('submitted');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedApplications = [...recentApplications].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'reference':
        comparison = a.reference.localeCompare(b.reference);
        break;
      case 'applicant':
        comparison = a.applicant.localeCompare(b.applicant);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'submitted':
        comparison = a.submitted.getTime() - b.submitted.getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Heading className="mb-2">Dashboard</Heading>
        <Body className="text-text-secondary">
          Welcome back! Here's what's happening today.
        </Body>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Subheading>Applications (Last 30 Days)</Subheading>
            <Link href="/admin/reports" className="text-sm text-accent hover:underline flex items-center gap-1">
              View Report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <LineChart data={applicationTrend} labels={applicationLabels} height={220} />
        </Card>

        {/* Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Subheading>Applications by Type</Subheading>
            <Caption>This Month</Caption>
          </div>
          <BarChart data={applicationsByType} height={220} />
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Subheading>Recent Applications</Subheading>
              <Link href="/admin/applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {[
                    { key: 'reference', label: 'Reference' },
                    { key: 'applicant', label: 'Applicant' },
                    { key: 'type', label: 'Type' },
                    { key: 'status', label: 'Status' },
                    { key: 'submitted', label: 'Submitted' },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort(column.key as SortField)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        <SortIcon field={column.key as SortField} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <Mono className="text-sm">{app.reference}</Mono>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-primary">{app.applicant}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {typeLabels[app.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusConfig[app.status]?.variant || 'default'}>
                        {statusConfig[app.status]?.label || app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {format(app.submitted, 'MMM d, h:mm a')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' || app.status === 'under_review' ? (
                        <Button size="sm" variant="secondary">
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Subheading>Today's Schedule</Subheading>
              <Badge variant="info">{todaysSchedule.length} Tests</Badge>
            </div>
          </div>

          <div className="divide-y divide-border">
            {todaysSchedule.map((item) => (
              <div key={item.id} className="p-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                        item.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : item.status === 'in_progress'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-surface text-text-muted'
                      )}
                    >
                      {item.time.split(':')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{item.applicant}</p>
                      <p className="text-xs text-text-muted">{item.testType}</p>
                    </div>
                  </div>
                  {item.status === 'completed' && item.result && (
                    <Badge variant={item.result === 'passed' ? 'success' : 'error'}>
                      {item.result === 'passed' ? 'Passed' : 'Failed'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between ml-13 pl-13">
                  <div className="flex items-center gap-1 text-xs text-text-muted ml-[52px]">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>

                  {item.status === 'scheduled' && (
                    <Button size="sm" variant="ghost">
                      Start
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pass
                      </Button>
                      <Button size="sm" variant="ghost" className="text-error">
                        <XCircle className="w-3 h-3 mr-1" />
                        Fail
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <Link href="/admin/tests">
              <Button variant="ghost" className="w-full">
                View Full Schedule
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

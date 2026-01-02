import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Title, Body } from '@/components/ui';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('bg-white pb-12', className)}>
      <Container>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="pt-6 pb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={index} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-text-muted hover:text-primary transition-colors duration-150"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          isLast ? 'text-text-secondary' : 'text-text-muted'
                        )}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Title and Description */}
        <div className={cn(!breadcrumbs && 'pt-8')}>
          <Title as="h1">{title}</Title>
          {description && (
            <Body className="mt-3 max-w-2xl">{description}</Body>
          )}
        </div>

        {/* Optional Actions/Children */}
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </div>
  );
}

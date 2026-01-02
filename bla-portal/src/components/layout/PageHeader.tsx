"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
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
    <div className={cn("pb-12", className)}>
      <Container>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={index} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                    )}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="text-navy-light hover:text-navy transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          isLast ? "text-navy font-medium" : "text-muted"
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Title */}
        <h1 className="text-[40px] font-bold text-navy leading-tight">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="mt-4 text-lg text-navy-light max-w-2xl">{description}</p>
        )}

        {/* Optional children for actions/buttons */}
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </div>
  );
}

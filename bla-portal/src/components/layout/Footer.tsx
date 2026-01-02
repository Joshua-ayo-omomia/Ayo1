"use client";

import Link from "next/link";
import { Container } from "./Container";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "About BLA", href: "/about" },
      { label: "Our Mission", href: "/about/mission" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Driver's License", href: "/services/drivers-license" },
      { label: "Vehicle Registration", href: "/services/vehicle-registration" },
      { label: "Road Tax", href: "/services/road-tax" },
      { label: "Permits", href: "/services/permits" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
      { label: "Office Locations", href: "/locations" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy py-16">
      <Container>
        {/* Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 text-sm hover:text-white transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">BLA</span>
              <span className="text-muted text-sm">
                Barbados Licensing Authority
              </span>
            </div>
            <p className="text-muted text-sm">
              &copy; {currentYear} Barbados Licensing Authority. All rights
              reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

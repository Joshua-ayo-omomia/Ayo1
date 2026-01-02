import Link from 'next/link';
import { Container } from './Container';

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
    title: 'About',
    links: [
      { label: 'About BLA', href: '/about' },
      { label: 'Leadership', href: '/leadership' },
      { label: 'Careers', href: '/careers' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Business Licenses', href: '/services/business' },
      { label: 'Professional Licenses', href: '/services/professional' },
      { label: 'Permits', href: '/services/permits' },
      { label: 'Renewals', href: '/services/renewals' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Office Locations', href: '/locations' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-16">
      <Container>
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-opacity duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">BLA</span>
              <span className="text-sm text-text-muted">
                Barbados Licensing Authority
              </span>
            </div>
            <p className="text-sm text-text-muted">
              © {currentYear} Barbados Licensing Authority. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

import Link from 'next/link'
import { Twitter, Linkedin, Github } from 'lucide-react'

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/tracks', label: 'Tracks' },
  { href: '/apply', label: 'Apply' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

const socialLinks = [
  { href: '#', label: 'Twitter', icon: Twitter },
  { href: '#', label: 'LinkedIn', icon: Linkedin },
  { href: '#', label: 'GitHub', icon: Github },
]

export function PublicFooter() {
  return (
    <footer className="bg-navy-700 text-warm-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="font-display text-lg font-bold text-white">Day Learning</p>
            <p className="mt-1 font-body text-sm text-warm-300">A THCO Company</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-warm-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-warm-400 transition-colors hover:text-teal-400"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-navy-600 pt-6 text-center">
          <p className="font-body text-xs text-warm-400">
            &copy; {new Date().getFullYear()} Day Learning by THCO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

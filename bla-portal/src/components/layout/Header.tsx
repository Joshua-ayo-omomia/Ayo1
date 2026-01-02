"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface NavLink {
  label: string;
  href: string;
}

interface UserInfo {
  name: string;
  email: string;
}

interface HeaderProps {
  user?: UserInfo | null;
  onSignOut?: () => void;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Apply", href: "/apply" },
  { label: "Track Status", href: "/track" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="h-16 bg-white border-b border-border">
      <Container className="h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-navy">BLA</span>
            <span className="hidden sm:inline ml-2 text-sm text-navy-light">
              Barbados Licensing Authority
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[15px] font-medium transition-colors relative py-5",
                  isActive(link.href)
                    ? "text-navy"
                    : "text-navy-light hover:text-navy"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-golden" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-navy-light transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-navy">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-navy-light hover:bg-gray-50 hover:text-navy transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-navy-light hover:bg-gray-50 hover:text-navy transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-navy-light hover:bg-gray-50 hover:text-navy transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[15px] font-medium text-navy-light hover:text-navy transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/get-started"
                  className="px-4 py-2 bg-primary text-white text-[15px] font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-navy-light hover:text-navy transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <Container>
            <nav className="py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2 text-[15px] font-medium transition-colors",
                    isActive(link.href)
                      ? "text-navy"
                      : "text-navy-light hover:text-navy"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {isActive(link.href) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-golden" />
                    )}
                  </span>
                </Link>
              ))}
              <hr className="my-3 border-border" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-[15px] font-medium text-navy-light hover:text-navy transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block py-2 text-[15px] font-medium text-navy-light hover:text-navy transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut?.();
                    }}
                    className="block w-full text-left py-2 text-[15px] font-medium text-navy-light hover:text-navy transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block py-2 text-[15px] font-medium text-navy-light hover:text-navy transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/get-started"
                    className="block mt-2 px-4 py-2 bg-primary text-white text-[15px] font-medium rounded-md text-center hover:bg-primary/90 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

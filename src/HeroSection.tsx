import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4';

const ease = [0.21, 0.47, 0.32, 0.98];

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Services', href: '#', hasDropdown: true },
  { label: 'Reviews', href: '#' },
  { label: 'Contact us', href: '#' },
];

function FutureLogo() {
  return (
    <svg width="130" height="28" viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14L8 4H26L20 14H8L14 24H8L2 14Z" fill="white" />
      <text x="32" y="20" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="16" fill="white" letterSpacing="0.5">Future</text>
    </svg>
  );
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">

      {/* ── Video Background ── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="absolute top-0 left-0 right-0 z-20 px-6 md:px-[120px] py-[16px]"
      >
        <div className="flex items-center justify-between">

          {/* Logo */}
          <motion.a href="#" whileHover={{ opacity: 0.85 }} transition={{ duration: 0.15 }}>
            <FutureLogo />
          </motion.a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <motion.a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 font-manrope font-medium text-[14px] text-white cursor-pointer select-none"
                whileHover={{ opacity: 0.75 }}
                transition={{ duration: 0.15 }}
                onClick={link.hasDropdown ? e => { e.preventDefault(); setServicesOpen(v => !v); } : undefined}
              >
                {link.label}
                {link.hasDropdown && (
                  <motion.span animate={{ rotate: servicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </motion.span>
                )}
              </motion.a>
            ))}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-[8px] font-manrope font-semibold text-[14px] text-[#171717] bg-white"
              style={{ border: '1px solid #d4d4d4' }}
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: '#6929e8' }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-[8px] font-manrope font-semibold text-[14px] text-[#fafafa]"
              style={{
                backgroundColor: '#7b39fc',
                boxShadow: '0 4px 16px rgba(123,57,252,0.4)',
                transition: 'background-color 0.2s ease',
              }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            className="md:hidden text-white p-1"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-0 bg-black z-50 flex flex-col px-8 py-8"
          >
            <div className="flex items-center justify-between mb-12">
              <FutureLogo />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="text-white"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 font-manrope font-medium text-[22px] text-white border-b border-white/10 pb-6"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ease }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-5 h-5 opacity-60" />}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="flex flex-col gap-3 mt-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, ease }}
            >
              <button
                className="w-full py-3 rounded-[8px] font-manrope font-semibold text-[15px] text-[#171717] bg-white"
                style={{ border: '1px solid #d4d4d4' }}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </button>
              <button
                className="w-full py-3 rounded-[8px] font-manrope font-semibold text-[15px] text-white"
                style={{ backgroundColor: '#7b39fc', boxShadow: '0 4px 16px rgba(123,57,252,0.4)' }}
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center text-center px-6 pt-36 md:pt-40">

        {/* Tagline pill */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease }}
          className="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] mb-7 select-none"
          style={{
            background: 'rgba(85,80,110,0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(164,132,215,0.5)',
          }}
        >
          <span
            className="font-cabin font-medium text-[12px] text-white px-2 py-0.5 rounded-[6px] leading-none"
            style={{ backgroundColor: '#7b39fc' }}
          >
            New
          </span>
          <span className="font-cabin font-medium text-[14px] text-white whitespace-nowrap">
            Say Hello to Datacore v3.2
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.38, ease }}
          className="font-instrument text-white text-5xl md:text-[96px] max-w-[900px] leading-[1.1] tracking-tight mb-6"
        >
          Book your perfect stay{' '}
          <br className="hidden md:block" />
          instantly{' '}
          <em
            className="not-italic"
            style={{ fontStyle: 'italic', letterSpacing: '-0.01em' }}
          >
            and
          </em>
          {' '}hassle&#8209;free
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.55, ease }}
          className="font-inter font-normal text-[18px] text-white/70 max-w-[662px] leading-[1.65] mb-10"
        >
          Discover handpicked hotels, resorts, and stays across your favorite destinations.
          Enjoy exclusive deals, fast booking, and 24/7 support.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{ backgroundColor: '#6929e8', boxShadow: '0 8px 32px rgba(123,57,252,0.55)' }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-[10px] font-cabin font-medium text-[16px] text-white w-full sm:w-auto"
            style={{
              backgroundColor: '#7b39fc',
              boxShadow: '0 6px 24px rgba(123,57,252,0.45)',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            Book a Free Demo
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: '#352a54' }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-[10px] font-cabin font-medium text-[16px] w-full sm:w-auto"
            style={{
              backgroundColor: '#2b2344',
              color: '#f6f7f9',
              transition: 'background-color 0.2s ease',
            }}
          >
            Get Started Now
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

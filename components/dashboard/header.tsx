'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  currentTab?: 'expedientes' | 'consola' | 'modelos';
  onTabChange?: (tab: 'expedientes' | 'consola') => void;
  onOpenCreateModal?: () => void;
}

export function Header({ currentTab, onTabChange }: HeaderProps) {
  const pathname = usePathname();
  const isModelosPage = pathname?.startsWith('/modelos');
  const isExpedienteDetailPage = pathname?.startsWith('/expedientes/');
  const isHomePage = pathname === '/';

  return (
    <header className="w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo - Lucas + Apoyando Ideas Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-baseline gap-0.5 select-none focus:outline-hidden"
          >
            <span className="font-sans font-extrabold text-[23px] tracking-[0.06em] text-zinc-950 group-hover:text-zinc-700 transition-colors">
              LUCAS
            </span>
            <span className="text-teal-600 font-black text-[23px] leading-none group-hover:text-teal-500 transition-colors">
              .
            </span>
          </Link>

          <span className="hidden sm:inline-flex text-zinc-300">/</span>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50/80 text-teal-900 border border-teal-200/70 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Apoyando Ideas
          </span>
        </div>

        {/* Center / Navigation Tabs */}
        <nav className="flex items-center bg-zinc-100/90 p-1 rounded-lg border border-zinc-200/80 text-xs">
          {/* Expedientes link / tab */}
          {isHomePage && onTabChange ? (
            <button
              onClick={() => onTabChange('expedientes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                currentTab === 'expedientes'
                  ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Expedientes</span>
            </button>
          ) : (
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                !isModelosPage && !isExpedienteDetailPage
                  ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Expedientes</span>
            </Link>
          )}

          {/* Modelos de Decisión link */}
          <Link
            href="/modelos"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              isModelosPage
                ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
            <span>Modelos de Decisión</span>
          </Link>

          {/* Consola SAT */}
          {isHomePage && onTabChange ? (
            <button
              onClick={() => onTabChange('consola')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                currentTab === 'consola'
                  ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Consola SAT</span>
            </button>
          ) : (
            <Link
              href="/?tab=consola"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-zinc-600 hover:text-zinc-950 transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Consola SAT</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

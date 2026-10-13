import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Leaf, Home, Compass, Bookmark, LayoutDashboard, Store } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Restaurants', path: '/restaurants', icon: Store },
    { name: 'Reservations', path: '/reservations', icon: Bookmark },
    { name: 'Dashboard', path: '/restaurant-dashboard', icon: LayoutDashboard },
  ];

  const mobileNavLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Reservations', path: '/reservations', icon: Bookmark },
    { name: 'Dashboard', path: '/restaurant-dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* DESKTOP & TABLET TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#F5EBDD]/90 backdrop-blur-md border-b border-[#E6D9C5] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* RescueBite Branding */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#285C46] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1E4736] transition-colors">
                <Leaf className="w-5 h-5 text-[#DDE8D8]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-[#1C2A23] tracking-tight leading-none group-hover:text-[#285C46] transition-colors">
                  Rescue<span className="text-[#285C46]">Bite</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526D57] leading-tight mt-0.5">
                  Surplus Food Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#285C46] text-white shadow-xs'
                          : 'text-[#2E3933] hover:text-[#1C2A23] hover:bg-[#EAD9C4]/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 opacity-90" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Live Eco Badge */}
            <div className="hidden lg:flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DDE8D8] text-[#1E4736] border border-[#B8D1C3]">
                <span className="w-2 h-2 rounded-full bg-[#285C46] animate-pulse"></span>
                Fresh Surplus Active
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Inspired by modern food applications) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF4EB]/95 backdrop-blur-lg border-t border-[#E6D9C5] py-2 px-3 shadow-2xl">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
                  isActive
                    ? 'text-[#285C46] font-bold bg-[#DDE8D8]/70'
                    : 'text-[#5C6A62] hover:text-[#1C2A23]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#285C46] stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[11px] leading-none font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

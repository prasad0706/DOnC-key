import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--canvas)] text-[var(--ink)]">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="border-2 border-[var(--accent-teal)] p-1 rounded bg-transparent">
            <DocumentTextIcon className="h-5 w-5 text-[var(--accent-teal)]" />
          </div>
          <span className="font-display font-bold text-lg text-[var(--ink)]">DOnC-key</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-sunken)]"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
          <div className="relative z-50 w-64 h-full bg-[var(--surface)]">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
          </div>
        </div>
      )}

      {/* Main content area with independent scrolling */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

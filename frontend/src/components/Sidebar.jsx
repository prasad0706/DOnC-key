import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartBarIcon,
  MoonIcon,
  SunIcon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Projects', path: '/projects', icon: FolderIcon },
    { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
    { name: 'Usage', path: '/usage', icon: ChartBarIcon },
    { name: 'Platform Docs', path: '/platform-docs', icon: BookOpenIcon },
  ];

  return (
    <div
      className={`flex flex-col h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-[var(--surface-sunken)] text-[var(--ink-muted)] border-r border-[var(--border)] transition-all duration-300 ease-in-out flex-shrink-0 relative shadow-sm z-20`}
    >
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className={`flex items-center justify-between mb-8 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="border-2 border-[var(--accent-teal)] p-1.5 rounded-md flex items-center justify-center bg-transparent">
                  <DocumentTextIcon className="h-5 w-5 text-[var(--accent-teal)]" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-[var(--ink)]">DOnC-key</span>
              </div>
            )}

            {isCollapsed && (
              <div className="border-2 border-[var(--accent-teal)] p-1.5 rounded-md flex items-center justify-center bg-transparent mb-4">
                <DocumentTextIcon className="h-5 w-5 text-[var(--accent-teal)]" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded hover:bg-[var(--surface)] transition-colors ${
                isCollapsed ? 'absolute -right-3 top-8 bg-[var(--surface)] shadow border border-[var(--border)]' : ''
              }`}
            >
              <span className="sr-only">Toggle sidebar</span>
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--ink-muted)]">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--ink-muted)]">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-tab ${isActive ? 'active' : 'hover:bg-[var(--surface)] hover:text-[var(--ink)]'}`}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-[var(--border)]">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-3 py-2 rounded text-sm font-medium mb-2 transition-colors text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && 'Light Mode'}
            </>
          ) : (
            <>
              <MoonIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && 'Dark Mode'}
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded text-sm font-medium transition-colors text-[var(--ink-muted)] hover:bg-red-500/10 hover:text-[var(--accent-red)]"
        >
          <ArrowLeftOnRectangleIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

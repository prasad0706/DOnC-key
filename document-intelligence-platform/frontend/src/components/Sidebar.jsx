import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HomeIcon,
  DocumentTextIcon,
  KeyIcon,
  ChartBarIcon,
  UserIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  MoonIcon,
  SunIcon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Projects', path: '/projects', icon: FolderIcon },
    { name: 'Upload', path: '/upload', icon: ArrowUpTrayIcon },
    { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
    { name: 'Usage', path: '/usage', icon: ChartBarIcon },
    { name: 'Platform Docs', path: '/platform-docs', icon: BookOpenIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const getNavItemClasses = (path) => {
    const baseClasses = 'flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group relative overflow-hidden';
    const activeClasses = theme === 'dark'
      ? 'bg-blue-600/10 text-blue-400 font-semibold'
      : 'bg-blue-50 text-blue-600 font-semibold';

    // Check if current path starts with the nav item path (for nested routes)
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

    // Hover classes
    const hoverClasses = theme === 'dark'
      ? 'hover:bg-gray-800/50 hover:text-white'
      : 'hover:bg-gray-50 hover:text-gray-900';

    // Active Indicator (left border or background)
    const activeIndicator = isActive
      ? `before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md ${theme === 'dark' ? 'before:bg-blue-500' : 'before:bg-blue-600'}`
      : '';

    return `${baseClasses} ${isActive ? activeClasses : hoverClasses} ${activeIndicator}`;
  };

  return (
    <div className={`flex flex-col h-screen ${isCollapsed ? 'w-20' : 'w-72'} ${theme === 'dark' ? 'bg-[#0B1120] text-gray-400' : 'bg-white text-gray-600'} border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} transition-all duration-300 ease-in-out flex-shrink-0 relative shadow-xl z-20`}>
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className={`flex items-center justify-between mb-8 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600`}>
                  DocIntel
                </span>
              </div>
            )}

            {isCollapsed && (
              <div className="bg-blue-600 p-1.5 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'absolute -right-3 top-8 bg-white dark:bg-gray-800 shadow-md border dark:border-gray-700' : ''
                }`}
            >
              <span className="sr-only">Toggle sidebar</span>
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={getNavItemClasses(item.path)}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom section */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium mb-2 transition-colors ${theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
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
          className={`w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${theme === 'dark'
              ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'
              : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
            }`}
        >
          <ArrowLeftOnRectangleIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

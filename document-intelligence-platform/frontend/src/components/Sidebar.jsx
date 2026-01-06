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
  MoonIcon,
  SunIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
    { name: 'API Keys', path: '/api-keys', icon: KeyIcon },
    { name: 'Usage', path: '/usage', icon: ChartBarIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const getNavItemClasses = (path) => {
    const baseClasses = 'flex items-center px-4 py-2 rounded-md text-sm font-medium';
    const activeClasses = theme === 'dark'
      ? 'bg-blue-600 text-white'
      : 'bg-blue-100 text-blue-800';
    const inactiveClasses = theme === 'dark'
      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

    return `${baseClasses} ${location.pathname === path ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className={`flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200`}>
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className={`flex items-center justify-between mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-500" />
                <span className="text-lg font-semibold">DocIntel</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-full hover:bg-gray-600"
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {isCollapsed ? (
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                )}
              </svg>
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
      <div className="p-4 border-t border-gray-700">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="h-5 w-5 mr-3" />
              {!isCollapsed && 'Light Mode'}
            </>
          ) : (
            <>
              <MoonIcon className="h-5 w-5 mr-3" />
              {!isCollapsed && 'Dark Mode'}
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

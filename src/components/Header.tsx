import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onAdminClick?: () => void;
  currentUser: {
    name: string;
    profile_photo?: string;
    isAdmin?: boolean;
  };
}

export function Header({ currentView, onViewChange, onAdminClick, currentUser }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAuth();

  const handleSearch = (query: string) => {
    // TODO: Implement search with Supabase
    console.log('Searching for:', query);
    onViewChange('browse');
  };

  const handleLogout = async () => {
    await signOut();
  };

  const unreadNotifications = 0; // TODO: Load from Supabase

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => onViewChange('dashboard')}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          {currentUser && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search skills or users..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation & User Menu */}
          {currentUser && (
            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onViewChange('browse')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'browse'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => onViewChange('requests')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'requests'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  My Swaps
                </button>
                <button
                  onClick={onAdminClick}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin
                </button>
              </nav>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Notifications */}
              <button
                onClick={() => onViewChange('notifications')}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {currentUser.profile_photo ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={currentUser.profile_photo}
                      alt={currentUser.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentUser.name}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onViewChange('profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          onViewChange('settings');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
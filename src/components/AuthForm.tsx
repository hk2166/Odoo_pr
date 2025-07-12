import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

interface AuthFormProps {
  onAdminClick?: () => void;
}

export function AuthForm({ onAdminClick }: AuthFormProps = {}) {
  const { signIn, signUp, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Password validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (isSignup) {
      if (!form.name) {
        setError('Name is required for signup');
        return;
      }
      const { error } = await signUp(form.email, form.password, form.name, form.location);
      if (error) setError(error);
    } else {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error);
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setError(''); // Clear error when switching modes
    setForm({ email: '', password: '', name: '', location: '' }); // Clear form
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
          {isSignup ? 'Sign Up' : 'Log In'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {isSignup ? 'Create your SkillSwap account' : 'Log in to your SkillSwap account'}
        </p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your location (optional)"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              isSignup ? 'Sign Up' : 'Log In'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm transition-colors"
            onClick={handleToggleMode}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
        
        {/* Admin Login Button */}
        {onAdminClick && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
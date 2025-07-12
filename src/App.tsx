import React, { useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Browse } from './components/Browse';
import { SwapRequests } from './components/SwapRequests';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { SwapRequestModal } from './components/SwapRequestModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { UserWithSkills } from './lib/users';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/NotificationToast';

function AppRoutes({ showAdminLogin, setShowAdminLogin }: { 
  showAdminLogin: boolean; 
  setShowAdminLogin: (show: boolean) => void; 
}) {
  const { isDarkMode } = useDarkMode();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSkills | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const { user } = useAuth();
  const { toasts, removeToast, showSuccess } = useToast();

  // Check admin login status on mount
  React.useEffect(() => {
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    console.log('Checking admin login status:', adminLoggedIn);
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  // Also check when showAdminLogin changes
  React.useEffect(() => {
    if (!showAdminLogin) {
      const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
      console.log('Admin login check after modal close:', adminLoggedIn);
      setIsAdminLoggedIn(adminLoggedIn);
    }
  }, [showAdminLogin]);
  const profile = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    profile_photo: user.user_metadata?.profile_photo || '',
    isAdmin: isAdminLoggedIn
  } : null;

  const handleSendRequest = (targetUser: UserWithSkills) => {
    setSelectedUser(targetUser);
    setIsSwapModalOpen(true);
  };

  const handleSubmitSwapRequest = () => {
    // Request was sent successfully
    showSuccess('Request Sent', 'Your swap request has been sent successfully!');
    setIsSwapModalOpen(false);
    setSelectedUser(null);
  };

  const handleAdminLogin = () => {
    console.log('Admin login handler called'); // Debug log
    console.log('Setting admin logged in to true');
    setShowAdminLogin(false);
    // Small delay to ensure localStorage is set by AdminLogin component
    setTimeout(() => {
      const adminStatus = localStorage.getItem('admin_logged_in') === 'true';
      console.log('Checking admin status after login:', adminStatus);
      setIsAdminLoggedIn(adminStatus);
    }, 100);
    console.log('Admin login complete, should show dashboard');
  };

  const handleAdminLogout = () => {
    console.log('Admin logout called');
    localStorage.removeItem('admin_logged_in');
    setIsAdminLoggedIn(false);
  };

  console.log('Current state - isAdminLoggedIn:', isAdminLoggedIn, 'showAdminLogin:', showAdminLogin);
  // Show admin panel if admin is logged in
  if (isAdminLoggedIn) {
    console.log('Rendering AdminDashboard');
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Show admin login if requested
  if (showAdminLogin) {
    console.log('Rendering AdminLogin');
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'browse':
        return <Browse onSendRequest={handleSendRequest} />;
      case 'requests':
        return <SwapRequests />;
      case 'profile':
        return <Profile />;
      case 'admin':
        setShowAdminLogin(true);
        return null;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onAdminClick={() => setShowAdminLogin(true)}
        currentUser={profile || { name: '', profile_photo: '', isAdmin: false }}
      />
      <main>
        {renderCurrentView()}
      </main>
      {/* Swap Request Modal */}
      {isSwapModalOpen && selectedUser && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => {
            setIsSwapModalOpen(false);
            setSelectedUser(null);
          }}
          onSend={handleSubmitSwapRequest}
          targetUser={selectedUser}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Add error boundary for better error handling
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // Show admin login if requested
  if (showAdminLogin) {
    return <AdminLogin onLogin={() => setShowAdminLogin(false)} />;
  }
  
  if (!user) return <AuthForm onAdminClick={() => setShowAdminLogin(true)} />;
  return <AppRoutes showAdminLogin={showAdminLogin} setShowAdminLogin={setShowAdminLogin} />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
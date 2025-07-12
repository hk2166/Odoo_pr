import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MessageSquare, Ban, UserCheck, Download, AlertTriangle, 
  Send, Eye, Trash2, CheckCircle, XCircle, Clock, Filter, Search,
  BarChart3, TrendingUp, Activity, Bell, FileText, Settings, LogOut
} from 'lucide-react';
import { getAllUsersWithSkills, UserWithSkills } from '../lib/users';
import { getUserSwapRequests, SwapRequestWithDetails } from '../lib/swapRequests';
import { SkillBadge } from './SkillBadge';
import { useToast } from '../hooks/useToast';

interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  isActive: boolean;
  createdAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Debug log to confirm component is rendering
  React.useEffect(() => {
    console.log('AdminDashboard component mounted');
  }, []);

  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'swaps' | 'messages' | 'reports'>('overview');
  const [activeRole, setActiveRole] = useState<'content' | 'users' | 'swaps' | 'messaging' | 'reports'>('content');
  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequestWithDetails[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New message form
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    type: 'info' as AdminMessage['type']
  });

  // Mock content moderation data
  const [pendingContent, setPendingContent] = useState([
    {
      id: '1',
      type: 'skill_description',
      content: 'I can teach you how to hack into systems and steal data',
      userName: 'BadUser123',
      userId: 'user-1',
      reportedBy: 'user-2',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'profile_bio',
      content: 'Buy my course for $999! Get rich quick scheme!',
      userName: 'SpammerUser',
      userId: 'user-3',
      reportedBy: 'user-4',
      createdAt: new Date().toISOString()
    }
  ]);
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load users
      const allUsers = await getAllUsersWithSkills();
      setUsers(allUsers);

      // Load all swap requests (admin can see all)
      const allSwaps: SwapRequestWithDetails[] = [];
      for (const user of allUsers) {
        const userSwaps = await getUserSwapRequests(user.id);
        allSwaps.push(...userSwaps);
      }
      // Remove duplicates
      const uniqueSwaps = allSwaps.filter((swap, index, self) => 
        index === self.findIndex(s => s.id === swap.id)
      );
      setSwapRequests(uniqueSwaps);

      // Mock admin messages
      setAdminMessages([
        {
          id: '1',
          title: 'Welcome to SkillSwap!',
          content: 'Start connecting with others to share and learn new skills.',
          type: 'info',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      showError('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to ban ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isBanned: true } : user
      ));
      showSuccess('User Banned', `${userName} has been banned from the platform`);
    } catch (error) {
      showError('Error', 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isBanned: false } : user
      ));
      showSuccess('User Unbanned', `${userName} has been unbanned`);
    } catch (error) {
      showError('Error', 'Failed to unban user');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      showError('Error', 'Please fill in all message fields');
      return;
    }

    try {
      const message: AdminMessage = {
        id: Date.now().toString(),
        title: newMessage.title.trim(),
        content: newMessage.content.trim(),
        type: newMessage.type,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setAdminMessages(prev => [message, ...prev]);
      setNewMessage({ title: '', content: '', type: 'info' });
      showSuccess('Message Sent', 'Platform-wide message has been sent to all users');
    } catch (error) {
      showError('Error', 'Failed to send message');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setAdminMessages(prev => prev.filter(msg => msg.id !== messageId));
    showInfo('Message Deleted', 'Admin message has been removed');
  };

  const downloadReport = (type: 'users' | 'swaps' | 'activity') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email || 'N/A',
          location: user.location || 'Not specified',
          skillsOffered: user.skillsOffered.join(', '),
          skillsWanted: user.skillsWanted.join(', '),
          rating: user.rating,
          totalSwaps: user.totalSwaps || user.total_swaps || 0,
          joinedDate: user.joinedDate || user.created_at,
          isPublic: user.isPublic,
          isBanned: user.isBanned || false,
          lastActive: new Date().toISOString()
        }));
        filename = `users-report-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'swaps':
        data = swapRequests.map(swap => ({
          id: swap.id,
          fromUser: swap.from_profile.name,
          toUser: swap.to_profile.name,
          skillOffered: swap.skill_offered.name,
          skillWanted: swap.skill_wanted.name,
          status: swap.status,
          message: swap.message,
          createdAt: swap.created_at,
          updatedAt: swap.updated_at
        }));
        filename = `swaps-report-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'activity':
        data = {
          totalUsers: users.length,
          activeUsers: users.filter(u => !u.isBanned).length,
          bannedUsers: users.filter(u => u.isBanned).length,
          totalSwaps: swapRequests.length,
          pendingSwaps: swapRequests.filter(s => s.status === 'pending').length,
          completedSwaps: swapRequests.filter(s => s.status === 'completed').length,
          averageRating: users.length > 0 ? users.reduce((sum, u) => sum + u.rating, 0) / users.length : 0,
          topSkills: getTopSkills(),
          generatedAt: new Date().toISOString()
        };
        filename = `activity-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Report Downloaded', `${type} report has been downloaded successfully`);
  };

  const handleRejectContent = (contentId: string) => {
    setPendingContent(prev => prev.filter(content => content.id !== contentId));
    showSuccess('Content Rejected', 'Inappropriate content has been removed from the platform');
  };

  const handleApproveContent = (contentId: string) => {
    setPendingContent(prev => prev.filter(content => content.id !== contentId));
    showInfo('Content Approved', 'Content has been approved and is now visible');
  };

  const getTopSkills = () => {
    const skillCounts: { [key: string]: number } = {};
    users.forEach(user => {
      [...user.skillsOffered, ...user.skillsWanted].forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.skillsOffered.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         user.skillsWanted.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'banned' && user.isBanned) ||
                         (statusFilter === 'active' && !user.isBanned);
    
    return matchesSearch && matchesStatus;
  });

  const filteredSwaps = swapRequests.filter(swap => {
    const matchesSearch = swap.from_profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         swap.to_profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         swap.skill_offered.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         swap.skill_wanted.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || swap.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => !u.isBanned).length,
    bannedUsers: users.filter(u => u.isBanned).length,
    totalSwaps: swapRequests.length,
    pendingSwaps: swapRequests.filter(s => s.status === 'pending').length,
    activeSwaps: swapRequests.filter(s => s.status === 'accepted').length,
    completedSwaps: swapRequests.filter(s => s.status === 'completed').length,
    averageRating: users.length > 0 ? users.reduce((sum, u) => sum + u.rating, 0) / users.length : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Control Panel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Platform Management & Moderation</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Roles Overview */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Shield className="h-6 w-6 text-purple-600 mr-2" />
            Administrator Roles & Responsibilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveRole('content')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeRole === 'content'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Content Moderation</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reject inappropriate or spammy skill descriptions
              </p>
            </button>

            <button
              onClick={() => setActiveRole('users')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeRole === 'users'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <Ban className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">User Management</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ban users who violate platform policies
              </p>
            </button>

            <button
              onClick={() => setActiveRole('swaps')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeRole === 'swaps'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Swap Monitoring</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor pending, accepted, or cancelled swaps
              </p>
            </button>

            <button
              onClick={() => setActiveRole('messaging')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeRole === 'messaging'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <Bell className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Platform Messaging</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send platform-wide messages & alerts
              </p>
            </button>

            <button
              onClick={() => setActiveRole('reports')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeRole === 'reports'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <Download className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Reports & Analytics</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download user activity & swap statistics
              </p>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Swaps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeSwaps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingSwaps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900/30 text-red-600 p-3 rounded-lg">
                <Ban className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.bannedUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Content Moderation', icon: XCircle },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'swaps', label: 'Swap Monitoring', icon: MessageSquare },
                { id: 'messages', label: 'Platform Messages', icon: Bell },
                { id: 'reports', label: 'Reports & Analytics', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Loading admin data...</h3>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the latest information</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Content Moderation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Moderation Queue</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Review and moderate inappropriate content</p>
                      </div>
                    </div>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                      {pendingContent.length} Pending
                    </span>
                  </div>

                  {pendingContent.length > 0 ? (
                    <div className="space-y-4">
                      {pendingContent.map((content) => (
                        <div key={content.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                                  {content.type.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  by {content.userName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(content.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-gray-100 mb-2 font-medium">Reported Content:</p>
                              <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border italic">
                                "{content.content}"
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Reported by: {content.reportedBy}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleApproveContent(content.id)}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectContent(content.id)}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h4>
                      <p className="text-gray-600 dark:text-gray-400">No inappropriate content to review at this time.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Admin Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Ban className="h-5 w-5" />
                      <span>Manage Users</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('swaps')}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Activity className="h-5 w-5" />
                      <span>Monitor Swaps</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Bell className="h-5 w-5" />
                      <span>Send Alerts</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Reports</span>
                    </button>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Health Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {Math.round((stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Swap Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.activeUsers}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {stats.bannedUsers}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Banned Users</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Platform Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Swap Monitoring</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monitor pending, accepted, or cancelled swaps</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                      <Ban className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ban users who violate platform policies</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name, email, or skills..."
                        className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="banned">Banned Users</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skills</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.profilePhoto || user.profile_photo ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={user.profilePhoto || user.profile_photo || ''}
                                    alt={user.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {user.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'No email'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {user.skillsOffered.length + user.skillsWanted.length} skills
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.totalSwaps || user.total_swaps || 0} swaps
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">{user.rating.toFixed(1)} ⭐</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Joined {new Date(user.joinedDate || user.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.isBanned
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : user.isPublic
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}>
                                {user.isBanned ? 'Banned' : user.isPublic ? 'Active' : 'Private'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {user.isBanned ? (
                                  <button
                                    onClick={() => handleUnbanUser(user.id, user.name)}
                                    className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center space-x-1"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                    <span>Unban</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user.id, user.name)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
                                  >
                                    <Ban className="h-4 w-4" />
                                    <span>Ban</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                {/* Send New Message */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Messaging</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send platform-wide messages (feature updates, downtime alerts)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Title</label>
                        <input
                          type="text"
                          value={newMessage.title}
                          onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                          placeholder="Enter message title..."
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Type</label>
                        <select
                          value={newMessage.type}
                          onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as AdminMessage['type'] })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="info">Information</option>
                          <option value="warning">Warning</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="feature">Feature Updates</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
                      <textarea
                        value={newMessage.content}
                        onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                        rows={4}
                        placeholder="Enter your message content..."
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Send Message to All Users</span>
                    </button>
                  </div>
                </div>

                {/* Message History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Message History</h3>
                  <div className="space-y-4">
                    {adminMessages.map((message) => (
                      <div key={message.id} className={`p-4 rounded-lg border ${
                        message.type === 'warning' 
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                          : message.type === 'maintenance'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : message.type === 'feature'
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{message.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                message.type === 'warning' 
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                                  : message.type === 'maintenance'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : message.type === 'feature'
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              }`}>
                                {message.type}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Download Reports */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <Download className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports & Analytics</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download reports of user activity, feedback logs, and swap stats</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => downloadReport('users')}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center justify-center space-y-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>User Activity Report</span>
                      <span className="text-xs opacity-80">User registrations, activity logs</span>
                    </button>
                    <button
                      onClick={() => downloadReport('swaps')}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center justify-center space-y-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Swap Statistics</span>
                      <span className="text-xs opacity-80">Success rates, completion data</span>
                    </button>
                    <button
                      onClick={() => downloadReport('activity')}
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center justify-center space-y-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Feedback Logs</span>
                      <span className="text-xs opacity-80">User feedback, ratings, reviews</span>
                    </button>
                  </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detailed Platform Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Swap Success Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {Math.round((stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Banned Users</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{stats.bannedUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Swaps</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.totalSwaps}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Pending Content Reports</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{pendingContent.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Most Popular Skills</h3>
                    <div className="space-y-3">
                      {getTopSkills().slice(0, 5).map((item, index) => (
                        <div key={item.skill} className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">#{index + 1} {item.skill}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
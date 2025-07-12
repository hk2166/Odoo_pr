import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MessageSquare, Ban, UserCheck, Download, AlertTriangle, 
  Send, Eye, Trash2, CheckCircle, XCircle, Clock, Filter, Search,
  BarChart3, TrendingUp, Activity, Bell, FileText, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

interface UserReport {
  id: string;
  name: string;
  email: string;
  skillsOffered: string[];
  skillsWanted: string[];
  totalSwaps: number;
  rating: number;
  joinedDate: string;
  lastActive: string;
  isBanned: boolean;
  reportCount: number;
}

interface SwapReport {
  id: string;
  fromUser: string;
  toUser: string;
  skillOffered: string;
  skillWanted: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  rating?: number;
}

export function AdminPanel() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'swaps' | 'messages' | 'reports'>('overview');
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

  // Check if user is admin
  const isAdmin = user?.user_metadata?.isAdmin || user?.email === 'admin@skillswap.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load users
      const allUsers = await getAllUsersWithSkills();
      setUsers(allUsers);

      // Load all swap requests (admin can see all)
      // In a real app, you'd have an admin-specific API endpoint
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

      // Mock admin messages (in real app, load from database)
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
      // In a real app, you'd call an admin API to ban the user
      // For now, we'll just update the local state
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
          lastActive: new Date().toISOString() // Mock data
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

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor platform activity, manage users, and maintain community standards.
        </p>
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
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
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => downloadReport('users')}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download User Report</span>
                  </button>
                  <button
                    onClick={() => downloadReport('swaps')}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Swap Report</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send Platform Message</span>
                  </button>
                </div>
              </div>

              {/* Platform Analytics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round((stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {stats.activeUsers}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

          {activeTab === 'swaps' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search swaps by users or skills..."
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Swaps</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Swaps Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Swap Activity Monitoring</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participants</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skills Exchange</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredSwaps.map((swap) => (
                        <tr key={swap.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {swap.from_profile.name} → {swap.to_profile.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <SkillBadge skill={swap.skill_offered.name} type="offered" size="sm" />
                              <span className="text-gray-400 dark:text-gray-500">↔</span>
                              <SkillBadge skill={swap.skill_wanted.name} type="wanted" size="sm" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              swap.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                : swap.status === 'accepted'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : swap.status === 'pending'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {swap.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(swap.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>View Details</span>
                            </button>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Send Platform-Wide Message</h3>
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
                        <option value="feature">Feature Update</option>
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
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Download Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => downloadReport('users')}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Users Report</span>
                  </button>
                  <button
                    onClick={() => downloadReport('swaps')}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Swaps Report</span>
                  </button>
                  <button
                    onClick={() => downloadReport('activity')}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Activity Report</span>
                  </button>
                </div>
              </div>

              {/* Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {Math.round((stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Swaps</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.totalSwaps}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Skills</h3>
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
  );
}
import React from 'react';
import { TrendingUp, Users, Calendar, Star, ArrowRight, Bell } from 'lucide-react';
import { SkillBadge } from './SkillBadge';
import { mockSwapRequests, mockRatings, mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToSwapUpdates } from '../lib/realtime';
import { useToast } from '../hooks/useToast';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { user } = useAuth();
  const { showInfo } = useToast();
  
  // Create current user object from authenticated user
  const currentUser = user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    location: user.user_metadata?.location || '',
    profilePhoto: user.user_metadata?.profile_photo || undefined,
    skillsOffered: [], // TODO: Load from Supabase
    skillsWanted: [], // TODO: Load from Supabase
    availability: [], // TODO: Load from Supabase
    isPublic: true,
    rating: 0, // TODO: Calculate from ratings
    totalSwaps: 0, // TODO: Count from completed swaps
    joinedDate: user.created_at || new Date().toISOString()
  } : null;
  
  const swapRequests = mockSwapRequests;
  const ratings = mockRatings;

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your dashboard</h1>
        </div>
      </div>
    );
  }

  const userSwapRequests = swapRequests.filter(
    request => request.fromUserId === currentUser.id || request.toUserId === currentUser.id
  );

  const pendingRequests = userSwapRequests.filter(request => request.status === 'pending');
  const activeSwaps = userSwapRequests.filter(request => request.status === 'accepted');
  const completedSwaps = userSwapRequests.filter(request => request.status === 'completed');

  const userRatings = ratings.filter(rating => rating.toUserId === currentUser.id);
  const averageRating = userRatings.length > 0 
    ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length 
    : 0;

  // Set up real-time notifications for dashboard
  React.useEffect(() => {
    if (currentUser?.id) {
      const channel = subscribeToSwapUpdates(currentUser.id, (update) => {
        // Show dashboard-specific notifications
        if (update.type === 'new_request' && update.data.to_user_id === currentUser.id) {
          showInfo('New Activity', 'Check your swap requests for new activity!');
        }
      });
      
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, [currentUser?.id, showInfo]);
  const stats = [
    {
      title: 'Total Swaps',
      value: completedSwaps.length.toString(),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Active Swaps',
      value: activeSwaps.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your skills, track your swaps, and discover new learning opportunities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onViewChange('browse')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">Find People to Swap With</span>
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
            </button>
            <button
              onClick={() => onViewChange('profile')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg hover:from-emerald-100 hover:to-blue-100 dark:hover:from-emerald-900/30 dark:hover:to-blue-900/30 transition-colors group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">Update My Skills</span>
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
            </button>
            <button
              onClick={() => onViewChange('requests')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-colors group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">View My Swap Requests</span>
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((request) => {
              const otherUser = mockUsers.find(u => 
                u.id === (request.fromUserId === currentUser.id ? request.toUserId : request.fromUserId)
              );
              
              return (
                <div key={request.id} className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {request.fromUserId === currentUser.id 
                        ? `Waiting for ${otherUser?.name} to respond`
                        : `${otherUser?.name} wants to swap`
                      }
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.skillOffered} ↔ {request.skillWanted}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {pendingRequests.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Overview */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">My Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Skills I Offer</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.skillsOffered.map((skill) => (
                <SkillBadge key={skill} skill={skill} type="offered" />
              ))}
              {currentUser.skillsOffered.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Skills I Want</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.skillsWanted.map((skill) => (
                <SkillBadge key={skill} skill={skill} type="wanted" />
              ))}
              {currentUser.skillsWanted.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
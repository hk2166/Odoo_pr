import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, XCircle, User, MessageSquare, Star, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSwapRequests, SwapRequestWithDetails } from '../lib/swapRequests';
import { SkillBadge } from './SkillBadge';
import { subscribeToSwapUpdates } from '../lib/realtime';
import { useToast } from '../hooks/useToast';

interface Notification {
  id: string;
  type: 'swap_request' | 'request_accepted' | 'request_rejected' | 'swap_completed' | 'rating_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  swapRequest?: SwapRequestWithDetails;
}

export function Notifications() {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'swap_requests'>('all');
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    if (currentUser?.id) {
      loadNotifications();
      
      // Set up real-time subscription for new notifications
      const channel = subscribeToSwapUpdates(currentUser.id, (update) => {
        handleRealtimeUpdate(update);
      });
      
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, [currentUser?.id]);

  const loadNotifications = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      // Load swap requests
      const requests = await getUserSwapRequests(currentUser.id);
      setSwapRequests(requests);
      
      // Convert swap requests to notifications
      const swapNotifications = requests.map(request => {
        const isReceived = request.to_user_id === currentUser.id;
        const otherUser = isReceived ? request.from_profile : request.to_profile;
        
        let type: Notification['type'] = 'swap_request';
        let title = '';
        let message = '';
        
        if (request.status === 'pending' && isReceived) {
          type = 'swap_request';
          title = 'New Swap Request';
          message = `${otherUser.name} wants to exchange ${request.skill_offered.name} for ${request.skill_wanted.name}`;
        } else if (request.status === 'accepted') {
          type = 'request_accepted';
          title = 'Request Accepted';
          message = `${otherUser.name} accepted your swap request for ${request.skill_offered.name} ↔ ${request.skill_wanted.name}`;
        } else if (request.status === 'rejected') {
          type = 'request_rejected';
          title = 'Request Declined';
          message = `${otherUser.name} declined your swap request for ${request.skill_offered.name} ↔ ${request.skill_wanted.name}`;
        } else if (request.status === 'completed') {
          type = 'swap_completed';
          title = 'Swap Completed';
          message = `Your skill exchange with ${otherUser.name} has been completed!`;
        }
        
        return {
          id: request.id,
          type,
          title,
          message,
          timestamp: request.updated_at,
          read: false, // In a real app, you'd track read status
          swapRequest: request
        };
      });
      
      // Sort by most recent first
      const sortedNotifications = swapNotifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (update: any) => {
    console.log('Real-time notification update:', update);
    
    // Show toast notification
    switch (update.type) {
      case 'new_request':
        if (update.data.to_user_id === currentUser?.id) {
          showInfo('New Swap Request', 'You have received a new skill exchange request!');
        }
        break;
      case 'request_accepted':
        if (update.data.from_user_id === currentUser?.id) {
          showSuccess('Request Accepted', 'Your swap request has been accepted!');
        }
        break;
      case 'request_rejected':
        if (update.data.from_user_id === currentUser?.id) {
          showInfo('Request Declined', 'Your swap request was declined.');
        }
        break;
    }
    
    // Reload notifications to show the update
    loadNotifications();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    showSuccess('All Read', 'Marked all notifications as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    showInfo('Deleted', 'Notification removed');
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'swap_requests':
        return notif.type === 'swap_request';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'swap_request':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'request_accepted':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'request_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'swap_completed':
        return <Star className="h-5 w-5 text-purple-600" />;
      case 'rating_received':
        return <Star className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'swap_request':
        return 'bg-blue-50 border-blue-200';
      case 'request_accepted':
        return 'bg-emerald-50 border-emerald-200';
      case 'request_rejected':
        return 'bg-red-50 border-red-200';
      case 'swap_completed':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view notifications</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                Stay updated on your skill exchange activities
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('swap_requests')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'swap_requests'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Swap Requests ({notifications.filter(n => n.type === 'swap_request').length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications...</h3>
          <p className="text-gray-500">Please wait while we fetch your updates</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                getNotificationBgColor(notification.type, notification.read)
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className={`mt-1 text-sm ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Swap Request Details */}
                      {notification.swapRequest && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-center space-x-3 mb-2">
                            <SkillBadge 
                              skill={notification.swapRequest.skill_offered.name} 
                              type="offered" 
                              size="sm" 
                            />
                            <span className="text-gray-400">↔</span>
                            <SkillBadge 
                              skill={notification.swapRequest.skill_wanted.name} 
                              type="wanted" 
                              size="sm" 
                            />
                          </div>
                          {notification.swapRequest.message && (
                            <div className="text-xs text-gray-600 bg-white rounded p-2">
                              <strong>Message:</strong> {notification.swapRequest.message}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp and Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'unread' ? 'No unread notifications' : 
             filter === 'swap_requests' ? 'No swap requests' : 
             'No notifications yet'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You'll see updates about your skill exchanges here"
              : `No ${filter.replace('_', ' ')} at the moment`
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '#requests'}
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-gray-200"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Manage Swap Requests</span>
            </button>
            <button
              onClick={() => window.location.href = '#browse'}
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-gray-200"
            >
              <User className="h-5 w-5" />
              <span>Find New Skills</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
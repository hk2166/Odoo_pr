import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Trash2, Star, User, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { SkillBadge } from './SkillBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserSwapRequests, 
  acceptSwapRequest, 
  rejectSwapRequest, 
  deleteSwapRequest, 
  completeSwapRequest,
  SwapRequestWithDetails 
} from '../lib/swapRequests';
import { RatingModal } from './RatingModal';
import { subscribeToSwapUpdates } from '../lib/realtime';
import { useToast } from '../hooks/useToast';

export function SwapRequests() {
  const { user: currentUser } = useAuth();
  const [swapRequests, setSwapRequests] = useState<SwapRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'completed'>('received');
  const [error, setError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSwapForRating, setSelectedSwapForRating] = useState<SwapRequestWithDetails | null>(null);
  const { showSuccess, showInfo, showError } = useToast();

  useEffect(() => {
    if (currentUser?.id) {
      loadSwapRequests();
      
      // Set up real-time subscription
      const channel = subscribeToSwapUpdates(currentUser.id, (update) => {
        console.log('Real-time swap update received:', update);
        
        // Show notification based on update type
        switch (update.type) {
          case 'new_request':
            if (update.data.to_user_id === currentUser.id) {
              showInfo('New Swap Request', 'You have received a new skill exchange request!');
            }
            break;
          case 'request_accepted':
            if (update.data.from_user_id === currentUser.id) {
              showSuccess('Request Accepted', 'Your swap request has been accepted!');
            }
            break;
          case 'request_rejected':
            if (update.data.from_user_id === currentUser.id) {
              showError('Request Declined', 'Your swap request was declined.');
            }
            break;
          case 'request_completed':
            showSuccess('Swap Completed', 'A skill exchange has been marked as completed!');
            break;
        }
        
        // Refresh the list
        loadSwapRequests();
      });
      
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, [currentUser?.id]);

  const loadSwapRequests = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    setError('');
    try {
      const requests = await getUserSwapRequests(currentUser.id);
      setSwapRequests(requests);
    } catch (error) {
      console.error('Error loading swap requests:', error);
      setError('Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await acceptSwapRequest(requestId);
      if (error) {
        setError(error);
      } else {
        showSuccess('Request Accepted', 'You have accepted the swap request!');
        await loadSwapRequests();
        setError('');
      }
    } catch (error) {
      setError('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await rejectSwapRequest(requestId);
      if (error) {
        setError(error);
      } else {
        showInfo('Request Declined', 'You have declined the swap request.');
        await loadSwapRequests();
        setError('');
      }
    } catch (error) {
      setError('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this swap request?')) return;
    
    setActionLoading(requestId);
    try {
      const { error } = await deleteSwapRequest(requestId);
      if (error) {
        setError(error);
      } else {
        showInfo('Request Cancelled', 'Your swap request has been cancelled.');
        await loadSwapRequests();
        setError('');
      }
    } catch (error) {
      setError('Failed to delete request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSwap = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await completeSwapRequest(requestId);
      if (error) {
        setError(error);
      } else {
        showSuccess('Swap Completed', 'Congratulations! Your skill exchange is now complete.');
        await loadSwapRequests();
        setError('');
      }
    } catch (error) {
      setError('Failed to complete swap');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateSwap = (swap: SwapRequestWithDetails) => {
    setSelectedSwapForRating(swap);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    setSelectedSwapForRating(null);
    loadSwapRequests();
  };

  if (!currentUser) return null;

  const receivedRequests = swapRequests.filter(
    request => request.to_user_id === currentUser.id && request.status === 'pending'
  );

  const sentRequests = swapRequests.filter(
    request => request.from_user_id === currentUser.id && request.status === 'pending'
  );

  const completedSwaps = swapRequests.filter(
    request => 
      (request.from_user_id === currentUser.id || request.to_user_id === currentUser.id) &&
      (request.status === 'accepted' || request.status === 'completed')
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherUser = (request: SwapRequestWithDetails) => {
    return request.from_user_id === currentUser.id ? request.to_profile : request.from_profile;
  };

  const renderRequestCard = (request: SwapRequestWithDetails, isReceived: boolean) => {
    const otherUser = getOtherUser(request);
    const isLoading = actionLoading === request.id;

    return (
      <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {otherUser.profile_photo ? (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={otherUser.profile_photo}
                alt={otherUser.name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{otherUser.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{otherUser.location || 'Location not specified'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(request.created_at)}</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {request.status === 'pending' ? 'Pending' : 'Updated'} {formatDate(request.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Swap */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {isReceived ? 'They offer' : 'You offer'}
              </p>
              <SkillBadge skill={request.skill_offered.name} type="offered" />
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-xl">↔</span>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {isReceived ? 'You offer' : 'They offer'}
              </p>
              <SkillBadge skill={request.skill_wanted.name} type="wanted" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            {request.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {isReceived && request.status === 'pending' && (
            <>
              <button
                onClick={() => handleAcceptRequest(request.id)}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleRejectRequest(request.id)}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>Decline</span>
              </button>
            </>
          )}

          {!isReceived && request.status === 'pending' && (
            <button
              onClick={() => handleDeleteRequest(request.id)}
              disabled={isLoading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCompletedSwap = (request: SwapRequestWithDetails) => {
    const otherUser = getOtherUser(request);
    const isRequester = request.from_user_id === currentUser.id;
    const isLoading = actionLoading === request.id;

    return (
      <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {otherUser.profile_photo ? (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={otherUser.profile_photo}
                alt={otherUser.name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{otherUser.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(request.updated_at)}</span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {isRequester ? 'You offered' : 'They offered'}
              </p>
              <SkillBadge skill={request.skill_offered.name} type="offered" />
            </div>
            <span className="text-gray-400 dark:text-gray-500">↔</span>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {isRequester ? 'You learned' : 'They learned'}
              </p>
              <SkillBadge skill={request.skill_wanted.name} type="wanted" />
            </div>
          </div>
        </div>

        {request.status === 'accepted' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleCompleteSwap(request.id)}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Mark as Completed</span>
            </button>
          </div>
        )}

        {request.status === 'completed' && (
          <div className="space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 flex items-center justify-center space-x-2">
              <Star className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Swap Completed Successfully!</span>
            </div>
            <button
              onClick={() => handleRateSwap(request)}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Rate & Review</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Swap Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your incoming and outgoing skill swap requests.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-600 dark:text-red-400">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Received ({receivedRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Sent ({sentRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Active & Completed ({completedSwaps.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Loading swap requests...</h3>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'received' && (
            <>
              {receivedRequests.length > 0 ? (
                receivedRequests.map(request => renderRequestCard(request, true))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No pending requests</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have any incoming swap requests yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentRequests.length > 0 ? (
                sentRequests.map(request => renderRequestCard(request, false))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sent requests</h3>
                  <p className="text-gray-500 dark:text-gray-400">You haven't sent any swap requests yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              {completedSwaps.length > 0 ? (
                completedSwaps.map(renderCompletedSwap)
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No completed swaps</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have any active or completed swaps yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedSwapForRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedSwapForRating(null);
          }}
          onSubmit={handleRatingSubmitted}
          swapRequest={selectedSwapForRating}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { X, Star, Send, User } from 'lucide-react';
import { SwapRequestWithDetails } from '../lib/swapRequests';
import { createRating } from '../lib/swapRequests';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  swapRequest: SwapRequestWithDetails;
  currentUserId: string;
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  swapRequest,
  currentUserId
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const otherUser = swapRequest.from_user_id === currentUserId 
    ? swapRequest.to_profile 
    : swapRequest.from_profile;

  const otherUserId = swapRequest.from_user_id === currentUserId 
    ? swapRequest.to_user_id 
    : swapRequest.from_user_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: ratingError } = await createRating({
        swapRequestId: swapRequest.id,
        fromUserId: currentUserId,
        toUserId: otherUserId,
        rating,
        feedback: feedback.trim() || undefined
      });

      if (ratingError) {
        setError(ratingError);
        setLoading(false);
        return;
      }

      // Success
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-3xl transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          <Star className={`h-8 w-8 ${isActive ? 'fill-current' : ''}`} />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {otherUser.profile_photo ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={otherUser.profile_photo}
                alt={otherUser.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rate Your Experience
              </h3>
              <p className="text-sm text-gray-500">with {otherUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Swap Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Exchange</h4>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                {swapRequest.skill_offered.name}
              </span>
              <span className="text-gray-400">↔</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {swapRequest.skill_wanted.name}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </label>
            <div className="flex justify-center space-x-1 mb-2">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 font-medium">
                {getRatingText(rating)}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your experience with this skill exchange..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React from 'react';
import { MapPin, Star, Clock, MessageSquare, Award, Calendar } from 'lucide-react';
import { SkillBadge } from './SkillBadge';
import { UserWithSkills } from '../lib/users';

interface UserCardProps {
  user: UserWithSkills;
  onSendRequest: (user: UserWithSkills) => void;
  showRequestButton?: boolean;
}

export function UserCard({ user, onSendRequest, showRequestButton = true }: UserCardProps) {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
      {/* User Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0">
          {user.profilePhoto || user.profile_photo ? (
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
              src={user.profilePhoto || user.profile_photo || ''}
              alt={user.name}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
              <span className="text-xl font-bold text-white">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {user.name}
          </h3>
          
          <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
              <span>{user.rating.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
              <span>{user.totalSwaps || user.total_swaps || 0} swaps</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
              <span>Joined {formatJoinDate(user.joinedDate || user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Offered */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
          Skills Offered
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsOffered.slice(0, 3).map((skill) => (
            <SkillBadge key={skill} skill={skill} type="offered" size="sm" />
          ))}
          {user.skillsOffered.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              +{user.skillsOffered.length - 3} more
            </span>
          )}
          {user.skillsOffered.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">No skills offered yet</span>
          )}
        </div>
      </div>

      {/* Skills Wanted */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Skills Wanted
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsWanted.slice(0, 3).map((skill) => (
            <SkillBadge key={skill} skill={skill} type="wanted" size="sm" />
          ))}
          {user.skillsWanted.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              +{user.skillsWanted.length - 3} more
            </span>
          )}
          {user.skillsWanted.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">No skills wanted yet</span>
          )}
        </div>
      </div>

      {/* Availability */}
      {user.availability && user.availability.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            Availability
          </h4>
          <div className="flex flex-wrap gap-1">
            {user.availability.map((time) => (
              <span
                key={time}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {showRequestButton && (
        <button
          onClick={() => onSendRequest(user)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-md"
          disabled={user.skillsOffered.length === 0}
        >
          <MessageSquare className="h-4 w-4 text-white" />
          <span>
            {user.skillsOffered.length === 0 ? 'No Skills Available' : 'Send Swap Request'}
          </span>
        </button>
      )}
    </div>
  );
}
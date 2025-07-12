import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, Loader2, Users, MapPin, Star } from 'lucide-react';
import { UserCard } from './UserCard';
import { skillCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsersWithSkills, searchUsers, UserWithSkills } from '../lib/users';
import { subscribeToUserUpdates } from '../lib/realtime';

interface BrowseProps {
  onSendRequest: (user: UserWithSkills) => void;
}

export function Browse({ onSendRequest }: BrowseProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
    
    // Set up real-time subscription for user updates
    if (currentUser?.id) {
      const channel = subscribeToUserUpdates(currentUser.id, (updatedUser) => {
        console.log('User profile updated:', updatedUser);
        // Refresh users list to show updated profiles
        loadUsers();
      });
      
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const allUsers = await getAllUsersWithSkills();
      setUsers(allUsers);
      
      if (allUsers.length === 0) {
        setError('No users found. Be the first to complete your profile!');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!localSearchQuery.trim()) {
      loadUsers();
      return;
    }

    setSearchLoading(true);
    setError('');
    try {
      const searchResults = await searchUsers(localSearchQuery.trim());
      setUsers(searchResults);
      
      if (searchResults.length === 0) {
        setError(`No users found matching "${localSearchQuery}"`);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearAllFilters = () => {
    setLocalSearchQuery('');
    setSelectedCategory('');
    setSelectedSkill('');
    loadUsers();
  };

  const filteredUsers = useMemo(() => {
    if (!currentUser?.id) return [];

    return users.filter(user => {
      // Exclude current user and non-public profiles
      if (user.id === currentUser.id || !user.isPublic || user.isBanned) return false;

      // Category filter
      if (selectedCategory) {
        const category = skillCategories.find(cat => cat.id === selectedCategory);
        if (category) {
          const hasSkillInCategory = [...user.skillsOffered, ...user.skillsWanted]
            .some(skill => category.skills.includes(skill));
          if (!hasSkillInCategory) return false;
        }
      }

      // Specific skill filter
      if (selectedSkill) {
        const hasSkill = [...user.skillsOffered, ...user.skillsWanted].includes(selectedSkill);
        if (!hasSkill) return false;
      }

      return true;
    });
  }, [users, currentUser?.id, selectedCategory, selectedSkill]);

  const availableSkills = useMemo(() => {
    const selectedCat = skillCategories.find(cat => cat.id === selectedCategory);
    return selectedCat ? selectedCat.skills : [];
  }, [selectedCategory]);

  // Calculate stats for display
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const totalSkills = new Set([
      ...filteredUsers.flatMap(u => u.skillsOffered),
      ...filteredUsers.flatMap(u => u.skillsWanted)
    ]).size;
    const avgRating = totalUsers > 0 
      ? filteredUsers.reduce((sum, u) => sum + u.rating, 0) / totalUsers 
      : 0;

    return { totalUsers, totalSkills, avgRating };
  }, [filteredUsers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Discover Skills & Connect</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find talented people in your area and start your next skill exchange journey.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Users Ready to Swap</p>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 flex items-center space-x-3">
            <Filter className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.totalSkills}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Skills Available</p>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex items-center space-x-3">
            <Star className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.avgRating.toFixed(1)}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Community Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Find Your Perfect Match</h2>
          </div>
          {(localSearchQuery || selectedCategory || selectedSkill) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search People & Skills
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search by name, location, or skills (e.g., 'Photoshop', 'Excel')..."
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Try searching for specific skills like "JavaScript", "Photography", or "Spanish"
            </p>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSkill(''); // Reset skill filter when category changes
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Categories</option>
              {skillCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specific Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={!selectedCategory}
            >
              <option value="">
                {selectedCategory ? 'All Skills in Category' : 'Select a category first'}
              </option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(localSearchQuery || selectedCategory || selectedSkill) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Active filters:</span>
            {localSearchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{localSearchQuery}"
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                Category: {skillCategories.find(cat => cat.id === selectedCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSkill('');
                  }}
                  className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSkill && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                Skill: {selectedSkill}
                <button
                  onClick={() => setSelectedSkill('')}
                  className="ml-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      {!loading && !error && (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredUsers.length === 0 ? 'No people found' : 
               `Found ${filteredUsers.length} ${filteredUsers.length === 1 ? 'person' : 'people'}`}
            </p>
            {filteredUsers.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ready to share knowledge and learn new skills
              </p>
            )}
          </div>
          
          {filteredUsers.length > 0 && (
            <button
              onClick={loadUsers}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <Search className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Finding amazing people...</h3>
          <p className="text-gray-500 dark:text-gray-400">Loading users and their skills from the community</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Oops!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onSendRequest={onSendRequest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {localSearchQuery || selectedCategory || selectedSkill 
                ? 'No matches found' 
                : 'No users available yet'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {localSearchQuery || selectedCategory || selectedSkill
                ? 'Try adjusting your search criteria or browse all available users.'
                : 'Be the first to complete your profile and start connecting with others!'
              }
            </p>
            {(localSearchQuery || selectedCategory || selectedSkill) && (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Show All Users
              </button>
            )}
          </div>
        </div>
      )}

      {/* Call to Action for Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ready to start your skill journey?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete your profile to connect with other learners and start exchanging skills.
          </p>
          <button
            onClick={() => window.location.href = '#profile'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            Complete My Profile
          </button>
        </div>
      )}
    </div>
  );
}
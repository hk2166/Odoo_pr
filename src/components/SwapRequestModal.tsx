import React, { useState } from 'react';
import { X, Send, User, Plus, Minus } from 'lucide-react';
import { UserWithSkills } from '../lib/users';
import { useAuth } from '../contexts/AuthContext';
import { getUserSkills } from '../lib/skills';
import { createSwapRequest, getSkillIdByName } from '../lib/swapRequests';
import { SkillBadge } from './SkillBadge';
import { sendNotification } from '../lib/realtime';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  targetUser: UserWithSkills;
}

interface SkillExchange {
  id: string;
  skillOffered: string;
  skillWanted: string;
}

export function SwapRequestModal({
  isOpen,
  onClose,
  onSend,
  targetUser
}: SwapRequestModalProps) {
  const { user: currentUser } = useAuth();
  const [currentUserSkills, setCurrentUserSkills] = useState<string[]>([]);
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([
    { id: '1', skillOffered: '', skillWanted: '' }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MIN_MESSAGE_LENGTH = 20;
  const MAX_MESSAGE_LENGTH = 1000;

  // Load current user's skills when modal opens
  React.useEffect(() => {
    if (isOpen && currentUser?.id) {
      loadCurrentUserSkills();
      // Reset form when modal opens
      setSkillExchanges([{ id: '1', skillOffered: '', skillWanted: '' }]);
      setMessage('');
      setError('');
    }
  }, [isOpen, currentUser?.id]);

  const loadCurrentUserSkills = async () => {
    if (!currentUser?.id) return;
    
    try {
      const skills = await getUserSkills(currentUser.id);
      setCurrentUserSkills(skills.offered);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  };

  const addSkillExchange = () => {
    const newId = (skillExchanges.length + 1).toString();
    setSkillExchanges([...skillExchanges, { id: newId, skillOffered: '', skillWanted: '' }]);
  };

  const removeSkillExchange = (id: string) => {
    if (skillExchanges.length > 1) {
      setSkillExchanges(skillExchanges.filter(exchange => exchange.id !== id));
    }
  };

  const updateSkillExchange = (id: string, field: 'skillOffered' | 'skillWanted', value: string) => {
    setSkillExchanges(skillExchanges.map(exchange => 
      exchange.id === id ? { ...exchange, [field]: value } : exchange
    ));
  };

  const getAvailableOfferedSkills = (currentExchangeId: string) => {
    const usedSkills = skillExchanges
      .filter(exchange => exchange.id !== currentExchangeId)
      .map(exchange => exchange.skillOffered)
      .filter(Boolean);
    
    return currentUserSkills.filter(skill => !usedSkills.includes(skill));
  };

  const getAvailableWantedSkills = (currentExchangeId: string) => {
    const usedSkills = skillExchanges
      .filter(exchange => exchange.id !== currentExchangeId)
      .map(exchange => exchange.skillWanted)
      .filter(Boolean);
    
    return targetUser.skillsOffered.filter(skill => !usedSkills.includes(skill));
  };

  const validateForm = () => {
    // Check if all exchanges are complete
    const incompleteExchanges = skillExchanges.filter(
      exchange => !exchange.skillOffered || !exchange.skillWanted
    );
    
    if (incompleteExchanges.length > 0) {
      return 'Please complete all skill exchanges or remove incomplete ones';
    }

    // Check for duplicate skills
    const offeredSkills = skillExchanges.map(e => e.skillOffered);
    const wantedSkills = skillExchanges.map(e => e.skillWanted);
    
    if (new Set(offeredSkills).size !== offeredSkills.length) {
      return 'You cannot offer the same skill multiple times';
    }
    
    if (new Set(wantedSkills).size !== wantedSkills.length) {
      return 'You cannot request the same skill multiple times';
    }

    // Check message length
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      return `Message must be at least ${MIN_MESSAGE_LENGTH} characters long`;
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return `Message must be no more than ${MAX_MESSAGE_LENGTH} characters long`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      setError('You must be logged in to send swap requests');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll create separate requests for each skill exchange
      // In a real app, you might want to modify the database to support multiple skills per request
      for (const exchange of skillExchanges) {
        const skillOfferedId = await getSkillIdByName(exchange.skillOffered);
        const skillWantedId = await getSkillIdByName(exchange.skillWanted);

        if (!skillOfferedId || !skillWantedId) {
          setError(`Could not find skill IDs for ${exchange.skillOffered} or ${exchange.skillWanted}`);
          setLoading(false);
          return;
        }

        const { error: createError } = await createSwapRequest({
          fromUserId: currentUser.id,
          toUserId: targetUser.id,
          skillOfferedId,
          skillWantedId,
          message: message.trim()
        });

        if (createError) {
          setError(createError);
          setLoading(false);
          return;
        }
      }

      // Success - reset form and close modal
      setSkillExchanges([{ id: '1', skillOffered: '', skillWanted: '' }]);
      setMessage('');
      setError('');
      
      // Send notification to target user
      const skillsList = skillExchanges.map(e => `${e.skillOffered} ↔ ${e.skillWanted}`).join(', ');
      await sendNotification(
        targetUser.id,
        'swap_request',
        'New Skill Exchange Request',
        `${currentUser.user_metadata?.name || 'Someone'} wants to exchange: ${skillsList}`
      );
      
      onSend();
      onClose();
    } catch (error) {
      console.error('Error creating swap request:', error);
      setError('Failed to send swap request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultMessage = () => {
    if (skillExchanges.every(e => e.skillOffered && e.skillWanted)) {
      const currentUserName = currentUser?.user_metadata?.name || 'I';
      const exchanges = skillExchanges.map(e => `${e.skillOffered} for ${e.skillWanted}`).join(', ');
      
      setMessage(`Hi ${targetUser.name}! I'd love to do a skill exchange with you. I can teach you ${skillExchanges.map(e => e.skillOffered).join(', ')} and would like to learn ${skillExchanges.map(e => e.skillWanted).join(', ')} from you. I think this would be a great mutual learning opportunity for both of us. I'm available for flexible times and would love to discuss how we can help each other grow our skills. Let me know if you're interested in this exchange!`);
    }
  };

  if (!isOpen) return null;

  const isFormValid = validateForm() === null;
  const messageLength = message.trim().length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {targetUser.profilePhoto || targetUser.profile_photo ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={targetUser.profilePhoto || targetUser.profile_photo || ''}
                alt={targetUser.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Send Skill Exchange Request
              </h3>
              <p className="text-sm text-gray-500">to {targetUser.name}</p>
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

          {/* Skill Exchanges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Skill Exchanges
              </label>
              <button
                type="button"
                onClick={addSkillExchange}
                disabled={skillExchanges.length >= Math.min(currentUserSkills.length, targetUser.skillsOffered.length)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Exchange</span>
              </button>
            </div>

            <div className="space-y-4">
              {skillExchanges.map((exchange, index) => (
                <div key={exchange.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Exchange #{index + 1}
                    </h4>
                    {skillExchanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillExchange(exchange.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Skill I Offer */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Skill I Offer
                      </label>
                      <select
                        value={exchange.skillOffered}
                        onChange={(e) => updateSkillExchange(exchange.id, 'skillOffered', e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a skill you offer</option>
                        {getAvailableOfferedSkills(exchange.id).map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Skill I Want */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Skill I Want to Learn
                      </label>
                      <select
                        value={exchange.skillWanted}
                        onChange={(e) => updateSkillExchange(exchange.id, 'skillWanted', e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a skill they offer</option>
                        {getAvailableWantedSkills(exchange.id).map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Exchange Preview */}
                  {exchange.skillOffered && exchange.skillWanted && (
                    <div className="mt-3 flex items-center justify-center space-x-3">
                      <SkillBadge skill={exchange.skillOffered} type="offered" size="sm" />
                      <span className="text-gray-400 text-sm">↔</span>
                      <SkillBadge skill={exchange.skillWanted} type="wanted" size="sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Complete Exchanges Preview */}
          {skillExchanges.every(e => e.skillOffered && e.skillWanted) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Exchange Summary</h4>
              <div className="space-y-2">
                {skillExchanges.map((exchange, index) => (
                  <div key={exchange.id} className="flex items-center justify-center space-x-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">You teach</p>
                      <SkillBadge skill={exchange.skillOffered} type="offered" size="sm" />
                    </div>
                    <span className="text-gray-400">↔</span>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">You learn</p>
                      <SkillBadge skill={exchange.skillWanted} type="wanted" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateDefaultMessage}
                disabled={!skillExchanges.every(e => e.skillOffered && e.skillWanted)}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
              >
                Generate message
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Introduce yourself and explain why you'd like to exchange these skills... (minimum ${MIN_MESSAGE_LENGTH} characters)`}
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Minimum {MIN_MESSAGE_LENGTH} characters required
              </p>
              <p className={`text-xs ${
                messageLength < MIN_MESSAGE_LENGTH 
                  ? 'text-red-500' 
                  : messageLength > MAX_MESSAGE_LENGTH 
                  ? 'text-red-500' 
                  : 'text-gray-500'
              }`}>
                {messageLength}/{MAX_MESSAGE_LENGTH} characters
              </p>
            </div>
          </div>

          {/* Skills Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Available Skills
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-2">Your skills available to offer:</p>
                <div className="flex flex-wrap gap-1">
                  {currentUserSkills.length > 0 ? (
                    currentUserSkills.map((skill) => (
                      <SkillBadge key={skill} skill={skill} type="offered" size="sm" />
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No skills added yet</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">{targetUser.name}'s skills you can learn:</p>
                <div className="flex flex-wrap gap-1">
                  {targetUser.skillsOffered.length > 0 ? (
                    targetUser.skillsOffered.map((skill) => (
                      <SkillBadge key={skill} skill={skill} type="wanted" size="sm" />
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No skills offered yet</span>
                  )}
                </div>
              </div>
            </div>
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
              disabled={!isFormValid || loading || currentUserSkills.length === 0 || targetUser.skillsOffered.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Request{skillExchanges.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React from 'react';

interface SkillBadgeProps {
  skill: string;
  type?: 'offered' | 'wanted' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: (skill: string) => void;
}

export function SkillBadge({ 
  skill, 
  type = 'neutral', 
  size = 'md', 
  removable = false, 
  onRemove 
}: SkillBadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const typeClasses = {
    offered: 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200',
    wanted: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${typeClasses[type]}`}>
      {skill}
      {removable && onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-200 hover:text-red-600 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
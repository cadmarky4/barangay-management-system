// ============================================================================
// components/ui/StatCard.tsx - Generic stat card component
// ============================================================================

import React from 'react';
import { type IconType } from 'react-icons';
import { LoadingSpinner } from './LoadingSpinner';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  loading = false,
  onClick,
  className = '',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      accent: 'border-l-blue-400',
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      accent: 'border-l-green-400',
    },
    yellow: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      accent: 'border-l-yellow-400',
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      accent: 'border-l-red-400',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      accent: 'border-l-purple-400',
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      accent: 'border-l-indigo-400',
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      accent: 'border-l-gray-400',
    },
  };

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8 p-1.5',
      iconSize: 'text-sm',
      title: 'text-xs',
      value: 'text-lg',
      trend: 'text-xs',
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12 p-2.5',
      iconSize: 'text-lg',
      title: 'text-sm',
      value: 'text-2xl',
      trend: 'text-sm',
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16 p-3',
      iconSize: 'text-xl',
      title: 'text-base',
      value: 'text-3xl',
      trend: 'text-base',
    },
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return String(val);
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.direction === 'up') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }
    
    // Default behavior: up is good, down is bad
    return trend.direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 
        border-l-4 ${colors.accent} 
        transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${sizes.container}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className={`font-medium text-gray-600 ${sizes.title} leading-tight`}>
              {title}
            </p>
            <div className={`
              rounded-lg ${colors.iconBg} ${colors.iconText} 
              ${sizes.icon} ${sizes.iconSize}
              flex items-center justify-center flex-shrink-0
            `}>
              {loading ? (
                <LoadingSpinner size="sm" color="gray" />
              ) : (
                <Icon />
              )}
            </div>
          </div>
          
          <div className="flex items-baseline justify-between">
            <p className={`font-bold text-gray-900 ${sizes.value} leading-none`}>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
              ) : (
                formatValue(value)
              )}
            </p>
            
            {trend && !loading && (
              <div className={`flex items-center ${sizes.trend} ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1 font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
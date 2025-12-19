/**
 * Avatar Component
 *
 * Displays user avatar with initials fallback.
 */

import Image from 'next/image';
import React from 'react';

export interface AvatarProps {
  /** User's full name for generating initials */
  name: string;
  /** Optional image URL */
  src?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

/**
 * Generate initials from a name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return (parts[0] ?? '').slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

/**
 * Generate a consistent color based on name
 */
function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-fuchsia-500',
    'bg-lime-500',
  ] as const;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? 'bg-blue-500';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className = '' }) => {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

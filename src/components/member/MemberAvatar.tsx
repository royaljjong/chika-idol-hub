'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface MemberAvatarProps {
  glyph: string;
  memberColor: string;
  imageUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function MemberAvatar({
  glyph,
  memberColor,
  imageUrl,
  name,
  size = 56,
  className = '',
}: MemberAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(imageUrl) && !imageError;

  const isLight =
    memberColor === '#FFFFFF' ||
    memberColor === '#F4E409' ||
    memberColor === '#FFD700' ||
    memberColor === '#B0E0E6' ||
    memberColor === '#FFE5EC';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-bold select-none border-2 border-white/20 shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: memberColor,
        boxShadow: `0 0 16px ${memberColor}40`,
      }}
    >
      {showImage && imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={size * 2}
          height={size * 2}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <span
          className="font-bold leading-none"
          style={{
            fontSize: Math.round(size * 0.42),
            color: isLight ? '#111827' : '#FFFFFF',
          }}
        >
          {glyph || name[0]}
        </span>
      )}
    </div>
  );
}

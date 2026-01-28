'use client';

import { useState } from 'react';
import Image from 'next/image';

interface IconImageProps {
  src: string;
  fallbackText: string;
  fallbackColor?: string;
  alt: string;
  size?: number;
  className?: string;
}

/**
 * IconImage Component
 * 显示图标图片，加载失败时显示备用文字
 */
export default function IconImage({ 
  src, 
  fallbackText, 
  fallbackColor = 'bg-zinc-700',
  alt, 
  size = 36,
  className = ''
}: IconImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 如果没有 src 或加载失败，显示 fallback
  if (!src || imageError) {
    return (
      <div 
        className={`rounded-full flex items-center justify-center ${fallbackColor} ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white text-xs font-bold">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Fallback while loading */}
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 rounded-full flex items-center justify-center ${fallbackColor}`}
        >
          <span className="text-white text-xs font-bold">{fallbackText}</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        unoptimized={src.startsWith('http')} // External URLs need unoptimized
      />
    </div>
  );
}

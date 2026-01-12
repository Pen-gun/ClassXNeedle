/**
 * Optimized Image Component with Lazy Loading
 * Features: lazy loading, blur placeholder, error handling, responsive srcset
 */

import { useState, useRef, useEffect, memo } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { optimizeImageUrl, generateSrcSet } from '../../lib/performance';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  lazy = true,
  placeholder = 'skeleton',
  fallbackSrc = '/placeholder-image.png',
  aspectRatio,
  objectFit = 'cover',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Generate optimized URLs
  const optimizedSrc = optimizeImageUrl(src, { width, height, quality });
  const srcSet = generateSrcSet(src);

  // Low quality placeholder for blur effect
  const blurPlaceholder = optimizeImageUrl(src, {
    width: 20,
    quality: 10,
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const containerStyle = aspectRatio
    ? { aspectRatio }
    : width && height
    ? { aspectRatio: `${width}/${height}` }
    : undefined;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && placeholder === 'skeleton' && 'animate-pulse bg-stone-200 dark:bg-stone-700',
        className
      )}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && isInView && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 w-full h-full blur-lg scale-110',
            `object-${objectFit}`
          )}
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={hasError ? fallbackSrc : optimizedSrc}
          srcSet={hasError ? undefined : srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {/* Skeleton placeholder when not in view */}
      {!isInView && placeholder === 'skeleton' && (
        <div className="w-full h-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
      )}
    </div>
  );
});

export default OptimizedImage;

// ===========================================
// SIMPLE LAZY IMAGE (lighter alternative)
// ===========================================

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  fallback = '/placeholder-image.png',
  className,
  ...props
}: LazyImageProps) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={cn('transition-opacity duration-200', className)}
      {...props}
    />
  );
});

// ===========================================
// BACKGROUND IMAGE WITH LAZY LOADING
// ===========================================

interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
}

export const LazyBackground = memo(function LazyBackground({
  src,
  className,
  children,
  overlay = false,
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  const optimizedSrc = optimizeImageUrl(src, { quality: 80 });

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-stone-200 dark:bg-stone-800 transition-all duration-500',
        className
      )}
      style={
        isLoaded
          ? {
              backgroundImage: `url(${optimizedSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {children}
    </div>
  );
});

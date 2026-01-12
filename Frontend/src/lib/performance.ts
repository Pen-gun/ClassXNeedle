/**
 * Performance Utilities for ClassXNeedle Frontend
 * Provides memoization, lazy loading, and optimization helpers
 */

import { memo, lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

// ===========================================
// COMPONENT MEMOIZATION
// ===========================================

/**
 * Higher-order component for memoization with custom comparison
 * Use for expensive components that receive complex props
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Default shallow comparison for primitive props
 */
export function shallowEqual<T extends object>(
  prevProps: Readonly<T>,
  nextProps: Readonly<T>
): boolean {
  const prevKeys = Object.keys(prevProps) as (keyof T)[];
  const nextKeys = Object.keys(nextProps) as (keyof T)[];

  if (prevKeys.length !== nextKeys.length) return false;

  return prevKeys.every((key) => prevProps[key] === nextProps[key]);
}

// ===========================================
// LAZY LOADING WITH RETRY
// ===========================================

/**
 * Lazy load component with automatic retry on failure
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  });
}

/**
 * Lazy load with preload capability
 */
export function lazyWithPreload<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>
): LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const Component = lazy(componentImport) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };
  Component.preload = componentImport;
  return Component;
}

// ===========================================
// DEBOUNCE & THROTTLE
// ===========================================

/**
 * Debounce function - delays execution until after wait period
 * Perfect for search inputs, resize handlers
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle function - limits execution to once per interval
 * Perfect for scroll handlers, mousemove events
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ===========================================
// IMAGE OPTIMIZATION
// ===========================================

/**
 * Generate optimized image URL with Cloudinary transformations
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  if (!url || !url.includes('cloudinary')) return url;

  const { width, height, quality = 80, format = 'auto' } = options;

  // Build transformation string
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  transforms.push('c_fill'); // Crop mode

  const transformString = transforms.join(',');

  // Insert transformation into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateSrcSet(
  url: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  return sizes
    .map((size) => `${optimizeImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
}

// ===========================================
// PERFORMANCE MONITORING
// ===========================================

/**
 * Measure component render time (dev only)
 */
export function measureRender(componentName: string): () => void {
  if (!import.meta.env.DEV) {
    return () => {};
  }

  const start = performance.now();
  return () => {
    const end = performance.now();
    console.log(`[Perf] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
  };
}

/**
 * Log slow operations (dev only)
 */
export function logSlowOperation(
  operationName: string,
  threshold = 100
): (callback: () => void) => void {
  return (callback: () => void) => {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;

    if (duration > threshold && import.meta.env.DEV) {
      console.warn(
        `[Perf Warning] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  };
}

// ===========================================
// INTERSECTION OBSERVER (Lazy Loading)
// ===========================================

/**
 * Create an intersection observer for lazy loading
 */
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

// ===========================================
// REQUEST IDLE CALLBACK
// ===========================================

/**
 * Schedule low-priority work during idle time
 */
export function scheduleIdleWork(
  callback: () => void,
  timeout = 2000
): number | ReturnType<typeof setTimeout> {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  // Fallback for Safari
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel scheduled idle work
 */
export function cancelIdleWork(id: number | ReturnType<typeof setTimeout>): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id as number);
  } else {
    clearTimeout(id);
  }
}

// ===========================================
// LOCAL STORAGE WITH EXPIRY
// ===========================================

interface StorageItem<T> {
  value: T;
  expiry: number;
}

/**
 * Set item in localStorage with expiry
 */
export function setStorageWithExpiry<T>(
  key: string,
  value: T,
  ttlMs: number
): void {
  const item: StorageItem<T> = {
    value,
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Get item from localStorage (returns null if expired)
 */
export function getStorageWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item: StorageItem<T> = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
}

// ===========================================
// VIRTUAL LIST HELPER
// ===========================================

/**
 * Calculate visible items for virtual scrolling
 */
export function calculateVisibleItems<T>(
  items: T[],
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  overscan = 3
): { visibleItems: T[]; startIndex: number; endIndex: number; offsetY: number } {
  const totalItems = items.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
  };
}

export default {
  withMemo,
  shallowEqual,
  lazyWithRetry,
  lazyWithPreload,
  debounce,
  throttle,
  optimizeImageUrl,
  generateSrcSet,
  measureRender,
  logSlowOperation,
  createLazyObserver,
  scheduleIdleWork,
  cancelIdleWork,
  setStorageWithExpiry,
  getStorageWithExpiry,
  calculateVisibleItems,
};

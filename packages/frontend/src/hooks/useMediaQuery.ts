import { useState, useEffect } from 'react';

/**
 * Hook that returns true if the window matches the given media query
 * @param query Media query string
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Initial check (in case window.matchMedia is not available, default to false)
    const media = window.matchMedia ? window.matchMedia(query) : { matches: false };
    
    // Set initial value
    setMatches(media.matches);
    
    // Create handler for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for subsequent changes
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      // @ts-ignore - For Safari and older browsers
      media.addListener(listener);
    }
    
    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        // @ts-ignore - For Safari and older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);
  
  return matches;
};

// Predefined breakpoints based on Tailwind CSS defaults
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1280px)');
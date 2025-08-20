import { useState, useEffect } from 'react';

// Breakpoint constants matching Tailwind CSS defaults
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const [breakpoint, setBreakpoint] = useState('sm');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      // Determine current breakpoint
      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    breakpoint,
    isMobile: screenSize.width < BREAKPOINTS.md,
    isTablet: screenSize.width >= BREAKPOINTS.md && screenSize.width < BREAKPOINTS.lg,
    isDesktop: screenSize.width >= BREAKPOINTS.lg,
    isLargeDesktop: screenSize.width >= BREAKPOINTS.xl,
    isExtraLarge: screenSize.width >= BREAKPOINTS['2xl'],
    
    // Utility functions
    isBreakpoint: (bp) => breakpoint === bp,
    isBreakpointUp: (bp) => screenSize.width >= BREAKPOINTS[bp],
    isBreakpointDown: (bp) => screenSize.width < BREAKPOINTS[bp],
    
    // Common responsive values
    sidebarWidth: screenSize.width < BREAKPOINTS.md ? '100%' : '250px',
    containerPadding: screenSize.width < BREAKPOINTS.md ? '1rem' : '2rem',
    gridCols: screenSize.width < BREAKPOINTS.md ? 1 : 
              screenSize.width < BREAKPOINTS.lg ? 2 : 3
  };
};

export default useResponsive;

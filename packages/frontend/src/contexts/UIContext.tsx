import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface UIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const UIContext = createContext<UIContextType>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  openSidebar: () => {},
  theme: 'light',
  toggleTheme: () => {},
});

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // Get initial sidebar state from localStorage or default to false for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    // Check if we're running in the browser
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarOpen');
      return savedState ? JSON.parse(savedState) : window.innerWidth >= 1024;
    }
    return false;
  });

  // Get initial theme from localStorage or default to system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    localStorage.setItem('sidebarOpen', 'false');
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    localStorage.setItem('sidebarOpen', 'true');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Close sidebar on narrow screens when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [closeSidebar]);

  const value = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    theme,
    toggleTheme,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
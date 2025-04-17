import React, { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Responsive grid component that adapts to different screen sizes
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gap = 'medium',
  className = '',
}) => {
  // Map gap sizes to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8',
  };

  // Map column counts to Tailwind classes
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-1';
    }
  };

  // Build the responsive columns classes
  const gridColsClasses = [
    columns.sm && `sm:${getGridColsClass(columns.sm)}`,
    columns.md && `md:${getGridColsClass(columns.md)}`,
    columns.lg && `lg:${getGridColsClass(columns.lg)}`,
    columns.xl && `xl:${getGridColsClass(columns.xl)}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`grid ${getGridColsClass(columns.sm || 1)} ${gridColsClasses} ${
        gapClasses[gap]
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Grid item component with responsive width
 */
export const GridItem: React.FC<{
  children: ReactNode;
  className?: string;
  colSpan?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}> = ({ children, className = '', colSpan }) => {
  // Map column spans to Tailwind classes
  const getColSpanClass = (span: number) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-2';
      case 3:
        return 'col-span-3';
      case 4:
        return 'col-span-4';
      case 5:
        return 'col-span-5';
      case 6:
        return 'col-span-6';
      default:
        return 'col-span-1';
    }
  };

  // Build the responsive column span classes
  const colSpanClasses = colSpan
    ? [
        colSpan.sm && `sm:${getColSpanClass(colSpan.sm)}`,
        colSpan.md && `md:${getColSpanClass(colSpan.md)}`,
        colSpan.lg && `lg:${getColSpanClass(colSpan.lg)}`,
        colSpan.xl && `xl:${getColSpanClass(colSpan.xl)}`,
      ].filter(Boolean).join(' ')
    : '';

  return <div className={`${colSpanClasses} ${className}`}>{children}</div>;
};
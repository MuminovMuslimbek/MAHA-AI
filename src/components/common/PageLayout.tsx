
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "", 
  containerClassName = "",
  fullWidth = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex min-h-screen flex-col items-center bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 ${className}`}>
      <div className={`w-full ${fullWidth ? 'max-w-full px-0' : 'px-2 sm:px-4 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl'} bg-white shadow-xl rounded-lg min-h-screen flex flex-col ${containerClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;

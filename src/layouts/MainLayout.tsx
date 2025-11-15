
import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import BottomNav from '@/components/common/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import TokenDisplay from '@/components/common/TokenDisplay';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PageLayout from '@/components/common/PageLayout';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, fullWidth = false }) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();
  const isAuthenticated = !!user;

  return (
    <PageLayout
      containerClassName={`${isAdmin && !isMobile ? 'md:max-w-5xl lg:max-w-6xl' : ''}`}
      fullWidth={fullWidth}
    >
      <Navbar />
      
      {/* Show token display for students in the header area */}
      {isAuthenticated && !isAdmin && (
        <div className="bg-indigo-50 px-2 sm:px-4 py-2 flex justify-end">
          <TokenDisplay showAddButton={false} />
        </div>
      )}
      
      <div className="flex flex-1">
        {/* Admin Sidebar (visible only for admin and on non-mobile) */}
        {isAdmin && !isMobile && <AdminSidebar />}
        
        <div className={`flex-1 ${fullWidth ? 'px-0' : 'px-2 sm:px-4 md:px-6'} py-3 ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </div>
      </div>
      
      {isMobile && isAuthenticated ? <BottomNav /> : <Footer />}
    </PageLayout>
  );
};

export default MainLayout;

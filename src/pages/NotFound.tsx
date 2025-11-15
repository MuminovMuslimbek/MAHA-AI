
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/common/PageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Try to extract ID from URL paths like /current-affairs/123
    const pathParts = location.pathname.split('/');
    const isCurrentAffairs = pathParts[1] === 'current-affairs' && pathParts.length > 2;
    
    // If this is potentially a current affairs URL, try to redirect to the main page
    if (isCurrentAffairs) {
      // Small delay to allow the app context to load fully
      setTimeout(() => {
        navigate('/current-affairs');
      }, 500);
    }
  }, [location.pathname, navigate]);

  // Determine where to redirect the user based on their role
  const getHomeLink = () => {
    if (!user) return "/";
    return isAdmin ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <PageLayout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-4 sm:p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-5xl sm:text-6xl font-bold text-red-500 mb-4">404</h1>
          <p className="text-lg sm:text-xl text-gray-800 mb-2">Page Not Found</p>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-3">
            {location.pathname.includes('current-affairs') && (
              <Button 
                asChild 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Link to="/current-affairs">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Current Affairs
                </Link>
              </Button>
            )}
            <Button asChild className="w-full">
              <Link to={getHomeLink()}>
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;

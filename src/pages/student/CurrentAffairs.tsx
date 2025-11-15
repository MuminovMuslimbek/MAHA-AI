
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import CurrentAffairCard from '@/components/common/CurrentAffairCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSearch, Newspaper, Tag, ChevronUp, Lightbulb, BookOpen, Brain, Search, Filter, X, Calendar, RefreshCcw, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentAffairs } from '@/hooks/useCurrentAffairs';
import { format, isToday, isYesterday } from 'date-fns';

const CurrentAffairs: React.FC = () => {
  const { currentAffairs, isLoading } = useCurrentAffairs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract unique categories
  const categories = Array.from(
    new Set(currentAffairs.map((article) => article.category))
  );
  
  // Filter current affairs based on search term, category, and date
  const filteredArticles = currentAffairs.filter((article) => {
    const matchesSearch = 
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = category ? article.category === category : true;
    
    // Date filtering
    let matchesDate = true;
    const articleDate = new Date(article.published_date);
    
    if (dateFilter === 'today') {
      matchesDate = isToday(articleDate);
    } else if (dateFilter === 'yesterday') {
      matchesDate = isYesterday(articleDate);
    } else if (dateFilter === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      matchesDate = format(articleDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sort by date (newest first)
  const sortedArticles = [...filteredArticles].sort(
    (a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
  );

  // Check if we have a selected article from state
  useEffect(() => {
    if (location.state?.selectedArticleId) {
      const index = sortedArticles.findIndex(article => article.id === location.state.selectedArticleId);
      if (index !== -1) {
        setCurrentIndex(index);
        // Clear the state to prevent reapplying on navigation
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, sortedArticles, navigate]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold && currentIndex < sortedArticles.length - 1) {
      // Swiped up, go to next article
      setDirection(-1);
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.y > threshold && currentIndex > 0) {
      // Swiped down, go to previous article
      setDirection(1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  // Auto-adjust the container height based on content
  useEffect(() => {
    if (containerRef.current && sortedArticles.length > 0) {
      const cardElement = document.querySelector('.current-affair-card');
      if (cardElement) {
        containerRef.current.style.height = `${cardElement.clientHeight}px`;
      }
    }
  }, [sortedArticles, currentIndex]);

  // If no articles found or loading
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (sortedArticles.length === 0) {
    return (
      <MainLayout>
        <div className="mb-6">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Current Affairs</h1>
            <p className="text-white/80 text-sm md:text-base">
              {!isMobile ? "Stay updated with the latest news and developments around the world." : "Latest news for your exams"}
            </p>
          </div>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-purple-100 focus-visible:ring-purple-500 bg-white shadow-sm"
            />
          </div>
          
          <Select value={category || "all"} onValueChange={(val) => setCategory(val === "all" ? null : val)}>
            <SelectTrigger className="border-purple-100 focus-visible:ring-purple-500 bg-white shadow-sm">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-purple-600" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-8 text-center shadow-md">
          <Newspaper className="h-12 w-12 mx-auto text-purple-300 mb-3" />
          <p className="text-slate-500 font-medium">No current affairs found based on your filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearch('');
              setCategory(null);
            }}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </MainLayout>
    );
  }

  // End of current affairs - show quiz suggestion card
  const isAllArticlesViewed = currentIndex >= sortedArticles.length;

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg p-4 md:p-6 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center">
            <Newspaper className="mr-3 h-6 w-6 md:h-7 md:w-7" />
            Current Affairs
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            {!isMobile ? "Stay updated with the latest news and developments around the world." : "Latest news for your exams"}
          </p>
        </div>
      </div>
      
      {/* Filter toolbar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-purple-100">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-purple-100 focus-visible:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-3 items-center flex-wrap">
            <Select value={category || "all"} onValueChange={(val) => setCategory(val === "all" ? null : val)}>
              <SelectTrigger className="w-[140px] border-purple-100 focus-visible:ring-purple-500">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-purple-600" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
              <SelectTrigger className="w-[140px] border-purple-100 focus-visible:ring-purple-500">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-purple-600" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="custom">Select Date</SelectItem>
              </SelectContent>
            </Select>
            
            {dateFilter === 'custom' && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-[150px] border-purple-100 focus-visible:ring-purple-500"
              />
            )}
            
            {(search || category || dateFilter !== 'all') && (
              <Button 
                size="icon"
                variant="ghost" 
                onClick={() => {
                  setSearch('');
                  setCategory(null);
                  setDateFilter('all');
                  setCustomDate('');
                }}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Quiz Button in right corner */}
      <div className="fixed right-4 bottom-20 md:bottom-4 z-50">
        <Button 
          asChild
          size={isMobile ? "default" : "lg"}
          className="rounded-full shadow-lg p-2 md:p-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          <Link to="/quizzes">
            <Brain className="h-5 w-5 md:h-6 md:w-6" />
            <span className="ml-2 hidden md:inline">Take a Quiz</span>
          </Link>
        </Button>
      </div>
      
      {/* Enhanced TikTok-style interface */}
      <div className="relative h-[calc(100vh-240px)] sm:h-[600px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md overflow-hidden" ref={containerRef}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sortedArticles.length) * 100}%` }}
          />
        </div>
        
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <div className="text-xs bg-black/60 text-white px-2 py-1 rounded-full">
            {isAllArticlesViewed ? 'End' : `${currentIndex + 1}/${sortedArticles.length}`}
          </div>
          
          {!isAllArticlesViewed && sortedArticles[currentIndex]?.is_premium && (
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black">
              <Shield className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
        </div>
        
        <AnimatePresence custom={direction}>
          {isAllArticlesViewed ? (
            <motion.div
              key="end-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full h-full flex justify-center items-center px-4 py-6"
            >
              <div className="w-full max-w-md">
                <Card className="border-2 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <CardTitle className="text-center flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      You're All Caught Up!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to test your knowledge?</h3>
                    <p className="text-gray-600 mb-4">Test your understanding of current affairs with our specially curated quiz!</p>
                  </CardContent>
                  <CardFooter className="flex flex-col justify-center pb-6 gap-3">
                    <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      <Link to="/quizzes?category=current-affairs">
                        <Brain className="h-4 w-4 mr-2" />
                        Take Current Affairs Quiz
                      </Link>
                    </Button>
                    <div className="flex gap-3 w-full">
                      <Button asChild className="flex-1" variant="outline">
                        <Link to="/quizzes">All Quizzes</Link>
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => setCurrentIndex(0)}
                      >
                        Start Over
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          ) : (
            sortedArticles[currentIndex] && (
              <motion.div
                key={sortedArticles[currentIndex].id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  y: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                className="absolute w-full h-full flex justify-center items-center px-4 py-10"
              >
                <div className="w-full max-w-md current-affair-card">
                  <CurrentAffairCard 
                    article={{
                      ...sortedArticles[currentIndex],
                      isPremium: sortedArticles[currentIndex].is_premium,
                      tokenPrice: sortedArticles[currentIndex].token_price,
                      publishedDate: new Date(sortedArticles[currentIndex].published_date),
                      imageUrl: sortedArticles[currentIndex].image_url
                    }}
                    onNext={currentIndex < sortedArticles.length - 1 ? () => {
                      setDirection(-1);
                      setCurrentIndex(prev => prev + 1);
                    } : undefined}
                    onPrevious={currentIndex > 0 ? () => {
                      setDirection(1);
                      setCurrentIndex(prev => prev - 1);
                    } : undefined}
                    fullContent={true}
                    isLastArticle={currentIndex === sortedArticles.length - 1}
                  />
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
        
        {/* Swipe instruction */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col items-center animate-pulse">
            <ChevronUp className="h-5 w-5 text-purple-600 -mb-1" />
            <ChevronUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="bg-black/60 text-white text-xs rounded-full px-3 py-1 flex items-center gap-1">
            <span>Swipe to navigate</span>
          </div>
        </div>
        
        {/* Side navigation buttons for desktop */}
        {!isMobile && (
          <>
            {currentIndex > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md h-10 w-10"
                onClick={() => {
                  setDirection(1);
                  setCurrentIndex(prev => prev - 1);
                }}
              >
                <ChevronUp className="h-6 w-6 rotate-180" />
              </Button>
            )}
            
            {currentIndex < sortedArticles.length - 1 && (
              <Button 
                variant="outline"
                size="icon" 
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md h-10 w-10"
                onClick={() => {
                  setDirection(-1);
                  setCurrentIndex(prev => prev + 1);
                }}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CurrentAffairs;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useQuizzes } from '@/hooks/useQuizzes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileUp, Pencil, Trash, AlertCircle, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const AdminQuizzes: React.FC = () => {
  const { quizzes, isLoading, deleteQuiz } = useQuizzes();
  const isMobile = useIsMobile();
  const [quizStartAlerts, setQuizStartAlerts] = useState<{[key: string]: number}>({});
  
  // Simulate quiz start notifications (in real app, this would come from real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate students starting quizzes
      if (Math.random() > 0.85) { // 15% chance every 5 seconds
        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        if (randomQuiz) {
          const studentName = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eva'][Math.floor(Math.random() * 5)];
          
          // Update alert counter
          setQuizStartAlerts(prev => ({
            ...prev,
            [randomQuiz.id]: (prev[randomQuiz.id] || 0) + 1
          }));
          
          // Show toast notification
          toast({
            title: "Quiz Started! 🎯",
            description: `${studentName} just started "${randomQuiz.title}"`,
          });
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [quizzes]);
  
  const handleDelete = async (quizId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteQuiz.mutateAsync(quizId);
        toast({
          title: "Quiz Deleted",
          description: `"${title}" has been deleted successfully.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quiz",
          variant: "destructive"
        });
      }
    }
  };

  const clearAlerts = (quizId: string) => {
    setQuizStartAlerts(prev => {
      const updated = { ...prev };
      delete updated[quizId];
      return updated;
    });
  };
  
  return (
    <MainLayout>
      <PageHeader
        title="Quiz Management"
        description="Create, edit, and manage quizzes with real-time student activity"
      >
        <div className="flex gap-2">
          <Button asChild size={isMobile ? "sm" : "default"} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Link to="/admin/quizzes/new">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create Quiz
            </Link>
          </Button>
          <Button asChild size={isMobile ? "sm" : "default"} variant="outline">
            <Link to="/admin/quizzes/import">
              <FileUp className="mr-1 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      {/* Real-time Activity Dashboard */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Live Quiz Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Active Students</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(quizStartAlerts).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Active Quizzes</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {Object.keys(quizStartAlerts).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Total Quizzes</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{quizzes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No quizzes have been created yet. Click "Create Quiz" to add one.
              </div>
            ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-center">Premium</TableHead>
                    <TableHead className="text-center">Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.category || 'N/A'}</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="text-center">
                        {quiz.is_premium ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-center">
                        {quizStartAlerts[quiz.id] ? (
                          <Badge 
                            variant="default" 
                            className="bg-green-100 text-green-800 cursor-pointer"
                            onClick={() => clearAlerts(quiz.id)}
                          >
                            🎯 {quizStartAlerts[quiz.id]} active
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No activity</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/admin/quizzes/edit/${quiz.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(quiz.id, quiz.title)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminQuizzes;

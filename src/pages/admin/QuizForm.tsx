
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Trash, Check, X, PencilLine } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubjects } from '@/hooks/useSubjects';

const QuizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  isPremium: z.boolean().default(false),
  subjectId: z.string().optional(),
});

const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { subjects } = useSubjects();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof QuizFormSchema>>({
    resolver: zodResolver(QuizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      timeLimit: 5,
      isPremium: false,
      subjectId: 'none',
    },
  });

  useEffect(() => {
    const loadQuiz = async () => {
      if (id) {
        const { data: quiz } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (quiz) {
          form.reset({
            title: quiz.title,
            description: quiz.description || '',
            category: quiz.category || '',
            timeLimit: quiz.time_limit,
            isPremium: quiz.is_premium || false,
            subjectId: quiz.subject_id || 'none',
          });

          const { data: questionsData } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', id)
            .order('order_index', { ascending: true });
          
          if (questionsData) {
            setQuestions(questionsData);
          }
        }
      }
    };
    loadQuiz();
  }, [id, form]);

  const onSubmit = async (values: z.infer<typeof QuizFormSchema>) => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question to the quiz",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (id) {
        // Update existing quiz
        const { error: quizError } = await supabase
          .from('quizzes')
          .update({
            title: values.title,
            description: values.description,
            category: values.category,
            time_limit: values.timeLimit,
            is_premium: values.isPremium,
            subject_id: values.subjectId && values.subjectId !== 'none' ? values.subjectId : null,
          })
          .eq('id', id);

        if (quizError) throw quizError;

        // Delete existing questions
        await supabase.from('questions').delete().eq('quiz_id', id);

        // Insert updated questions
        const questionsToInsert = questions.map((q, index) => ({
          quiz_id: id,
          text: q.text,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation || null,
          order_index: index,
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast({
          title: "Success",
          description: "Quiz updated successfully"
        });
      } else {
        // Create new quiz
        const { data: newQuiz, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            title: values.title,
            description: values.description,
            category: values.category,
            time_limit: values.timeLimit,
            is_premium: values.isPremium,
            subject_id: values.subjectId && values.subjectId !== 'none' ? values.subjectId : null,
          })
          .select()
          .single();

        if (quizError) throw quizError;

        // Insert questions
        const questionsToInsert = questions.map((q, index) => ({
          quiz_id: newQuiz.id,
          text: q.text,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation || null,
          order_index: index,
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast({
          title: "Success",
          description: "Quiz created successfully"
        });
      }
      
      navigate('/admin/quizzes');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Question management
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
  });
  
  const handleAddQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "Question text and all options are required",
        variant: "destructive"
      });
      return;
    }
    
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    
    // Reset form
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    });
  };
  
  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setNewQuestion({
      text: question.text,
      options: [...question.options],
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation || '',
    });
    setEditingQuestionIndex(index);
  };
  
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    
    if (editingQuestionIndex === index) {
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      });
      setEditingQuestionIndex(null);
    }
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };
  
  return (
    <MainLayout>
      <PageHeader
        title={id ? "Edit Quiz" : "Create New Quiz"}
        description="Design a quiz with questions and answers"
      >
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={() => navigate('/admin/quizzes')}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Quizzes
        </Button>
      </PageHeader>
      
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Quiz Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter quiz title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Science, Math, History" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a description of the quiz" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            value={field.value} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Premium Content (requires tokens)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Questions</h3>
                
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div 
                        key={question.id || `question-${index}`}
                        className="border p-4 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{index + 1}. {question.text}</p>
                            <ul className="ml-4 mt-2">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} className="flex items-center">
                                  {optIndex === question.correctOptionIndex ? (
                                    <span className="text-green-600 mr-2 flex-shrink-0">
                                      <Check className="h-4 w-4" />
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 mr-2 flex-shrink-0">
                                      <X className="h-4 w-4" />
                                    </span>
                                  )}
                                  {option}
                                </li>
                              ))}
                            </ul>
                            {question.explanation && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Explanation:</span> {question.explanation}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(index)}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No questions added yet. Add questions below.</p>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">
                    {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Question Text</FormLabel>
                      <Textarea
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                        placeholder="Enter question text"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <FormLabel>Options</FormLabel>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <input
                              type="radio"
                              id={`option-${index}`}
                              checked={newQuestion.correctOptionIndex === index}
                              onChange={() => setNewQuestion({...newQuestion, correctOptionIndex: index})}
                              className="mr-2"
                            />
                            <label htmlFor={`option-${index}`} className="text-sm font-medium">
                              Correct
                            </label>
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <FormLabel>Explanation (Optional)</FormLabel>
                      <Textarea
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                        placeholder="Explain why the correct answer is right"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      className="mt-2"
                    >
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? 'Saving...' : (id ? 'Update Quiz' : 'Create Quiz')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default QuizForm;

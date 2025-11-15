
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileUp, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApp } from '@/contexts/AppContext';
import { Question } from '@/types';
import { toast } from '@/hooks/use-toast';

const QuizImport: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { createQuiz } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [csvData, setCsvData] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<{
    title: string;
    description: string;
    category: string;
    timeLimit: number;
    questions: Question[];
  } | null>(null);

  // Sample CSV template for download
  const sampleCsv = `title,description,category,timeLimit,isPremium
Science Quiz,A quiz about basic science concepts,Science,10,false
questionText,option1,option2,option3,option4,correctOptionIndex,explanation
What is the chemical symbol for water?,H2O,CO2,NaCl,O2,0,Water is represented as H2O in chemistry
What planet is known as the Red Planet?,Venus,Mars,Jupiter,Saturn,1,Mars is often called the Red Planet due to its reddish appearance
`;

  const downloadTemplate = () => {
    const element = document.createElement('a');
    const file = new Blob([sampleCsv], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = 'quiz_template.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');
    
    const file = e.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }
    
    try {
      const text = await file.text();
      setCsvData(text);
      parseCSV(text);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to read file. Please try again.');
      console.error('Error reading file:', error);
    }
    
    setIsUploading(false);
  };
  
  const parseCSV = (csvText: string) => {
    try {
      // Split by lines and remove empty lines
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // First line should be headers
      if (lines.length < 3) {
        setUploadStatus('error');
        setUploadMessage('CSV file must contain headers and at least one question');
        return;
      }
      
      // Parse quiz metadata from second line
      const quizData = parseCSVLine(lines[1]);
      if (quizData.length < 4) {
        setUploadStatus('error');
        setUploadMessage('Quiz data is incomplete');
        return;
      }
      
      const [title, description, category, timeLimitStr, isPremiumStr] = quizData;
      const timeLimit = parseInt(timeLimitStr) || 5;
      const isPremium = isPremiumStr?.toLowerCase() === 'true';
      
      // Parse question headers (line 3)
      const questionHeaders = parseCSVLine(lines[2]);
      
      // Parse questions (from line 4 onwards)
      const questions: Question[] = [];
      
      for (let i = 3; i < lines.length; i++) {
        const questionData = parseCSVLine(lines[i]);
        if (questionData.length >= 6) {
          const [text, ...options] = questionData;
          
          // The last two elements are correctOptionIndex and explanation
          const explanation = questionData.length > 6 ? questionData[questionData.length - 1] : '';
          const correctOptionIndexStr = questionData[questionData.length - 2];
          const correctOptionIndex = parseInt(correctOptionIndexStr) || 0;
          
          // Remove explanation and correctOptionIndex from options
          const actualOptions = options.slice(0, options.length - 2);
          
          questions.push({
            id: `imported-question-${i-2}`,
            text,
            options: actualOptions,
            correctOptionIndex,
            explanation
          });
        }
      }
      
      if (questions.length === 0) {
        setUploadStatus('error');
        setUploadMessage('No valid questions found in the CSV file');
        return;
      }
      
      setParseResult({
        title: title || 'Imported Quiz',
        description: description || 'Quiz imported from CSV',
        category: category || 'General',
        timeLimit,
        questions
      });
      
      setUploadStatus('success');
      setUploadMessage(`Successfully parsed ${questions.length} questions`);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to parse CSV file. Please check format and try again.');
      console.error('Error parsing CSV:', error);
    }
  };
  
  // Helper function to handle CSV parsing with quoted fields
  const parseCSVLine = (line: string): string[] => {
    // Simple CSV parsing that handles quoted fields
    const result = [];
    let field = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(field);
        field = '';
      } else {
        field += char;
      }
    }
    
    result.push(field); // Add the last field
    return result;
  };
  
  const handleImport = () => {
    if (!parseResult) return;
    
    try {
      createQuiz({
        title: parseResult.title,
        description: parseResult.description,
        category: parseResult.category,
        timeLimit: parseResult.timeLimit,
        questions: parseResult.questions,
        isPremium: false
      });
      
      toast({
        title: "Quiz Imported",
        description: `Successfully imported "${parseResult.title}" with ${parseResult.questions.length} questions`
      });
      
      navigate('/admin/quizzes');
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was a problem creating the quiz",
        variant: "destructive"
      });
      
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Import Quiz from CSV"
        description="Upload a CSV file to create a quiz"
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
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground">
                    The CSV file should follow the template format with quiz details and questions.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download Template
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FileUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">CSV files only (max 5MB)</p>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Select File
                  </Button>
                </div>
              </div>
              
              {uploadStatus !== 'idle' && (
                <div className={`p-4 rounded-md ${
                  uploadStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center">
                    {uploadStatus === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm ${
                      uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {uploadMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {parseResult && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Title:</span>
                  <p>{parseResult.title}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Category:</span>
                  <p>{parseResult.category}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Time Limit:</span>
                  <p>{parseResult.timeLimit} minutes</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Questions:</span>
                  <p>{parseResult.questions.length} questions</p>
                </div>
                
                <div className="pt-3">
                  <Button 
                    onClick={handleImport} 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Import Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default QuizImport;

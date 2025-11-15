
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, UserPlus, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      
      if (!error) {
        toast({
          title: "🎉 Account created!",
          description: "Welcome to QuizMaster! You can now log in.",
          variant: "default",
        });
        navigate('/login');
      } else {
        setError(error.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 animate-gradient-x">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-2xl transform hover:scale-102 transition-all duration-500">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-quiz-purple to-pink-600 flex items-center justify-center shadow-2xl animate-glow">
                  <Book className="h-10 w-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🌟</div>
              </div>
            </div>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-500 via-quiz-purple to-pink-600 bg-clip-text text-transparent">
              Create an account ✨
            </CardTitle>
            <CardDescription className="text-center text-gray-600 flex items-center justify-center">
              <span className="mr-2">🎯</span>
              Enter your details to create a new account and start learning!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-xl bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 p-4 text-sm text-red-700 animate-wiggle">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">👤</span>
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="🙋‍♂️ John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-purple-200 focus-visible:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">📧</span>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="✉️ name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-purple-200 focus-visible:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">🔐</span>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="🔒 ••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-purple-200 focus-visible:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">🔐</span>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="🔒 ••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-purple-200 focus-visible:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 via-quiz-purple to-pink-600 hover:from-blue-600 hover:via-quiz-purple-dark hover:to-pink-700 transition-all duration-500 shadow-xl hover:shadow-2xl text-lg py-3 rounded-xl font-semibold hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Creating account...</span>
                    <span className="text-xl">⏳</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> 
                    <span className="mr-2">🚀</span>
                    Create account
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </span>
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                <span className="mr-2">🤔</span>
                Already have an account?{' '}
                <Link to="/login" className="text-quiz-purple font-semibold hover:underline transition-all duration-300 hover:scale-105 inline-flex items-center">
                  <span className="mr-1">✨</span>
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;

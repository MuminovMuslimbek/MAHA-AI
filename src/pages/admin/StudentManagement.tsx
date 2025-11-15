import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, User, Coins, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfiles } from '@/hooks/useProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const StudentManagement: React.FC = () => {
  const { profiles, isLoading } = useProfiles();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, number>>({});
  const [studentIdForRecharge, setStudentIdForRecharge] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [activeTab, setActiveTab] = useState('manage');
  
  const students = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTokensMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const student = profiles.find(p => p.id === userId);
      if (!student) throw new Error('Student not found');

      const { error } = await supabase
        .from('profiles')
        .update({ tokens: student.tokens + amount })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, amount, name: student.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Tokens Added",
        description: `${data.amount} tokens have been added to ${data.name}.`,
      });
      // Reset the token amount for this student
      setTokenAmounts(prev => ({ ...prev, [data.userId]: 10 }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add tokens. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddTokens = (studentId: string) => {
    const amount = tokenAmounts[studentId] || 10;
    addTokensMutation.mutate({ userId: studentId, amount });
  };

  const handleRechargeByStudentId = () => {
    if (!studentIdForRecharge) {
      toast({
        title: "Error",
        description: "Please enter a valid Student ID",
        variant: "destructive",
      });
      return;
    }

    const student = profiles.find(p => p.id === studentIdForRecharge);

    if (!student) {
      toast({
        title: "Error",
        description: "Student ID not found",
        variant: "destructive",
      });
      return;
    }

    addTokensMutation.mutate({ 
      userId: studentIdForRecharge, 
      amount: rechargeAmount 
    });

    setStudentIdForRecharge('');
    setRechargeAmount(10);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Student Management"
        description={!isMobile ? "Manage student accounts and tokens" : ""}
      />
      
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Students</TabsTrigger>
            <TabsTrigger value="recharge">Token Recharge</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                className="pl-10" 
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Students Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-600" />
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tokens</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-xs">{student.id.slice(0, 8)}...</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell className="font-semibold">{student.tokens}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  value={tokenAmounts[student.id] || 10}
                                  onChange={(e) => setTokenAmounts(prev => ({
                                    ...prev,
                                    [student.id]: parseInt(e.target.value) || 0
                                  }))}
                                  min="1"
                                  className="w-20"
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center"
                                  onClick={() => handleAddTokens(student.id)}
                                  disabled={addTokensMutation.isPending}
                                >
                                  <Coins className="h-4 w-4 mr-1" /> Add
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No students found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recharge">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Token Recharge by Student ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium mb-1">
                      Student ID
                    </label>
                    <Input
                      id="studentId"
                      placeholder="Enter student ID"
                      value={studentIdForRecharge}
                      onChange={(e) => setStudentIdForRecharge(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tokenAmount" className="block text-sm font-medium mb-1">
                      Token Amount
                    </label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="tokenAmount"
                        type="number" 
                        value={rechargeAmount} 
                        onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 0)}
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">tokens</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleRechargeByStudentId}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={addTokensMutation.isPending}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Recharge Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StudentManagement;

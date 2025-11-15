
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuizzes } from '@/hooks/useQuizzes';

const SubjectManagement: React.FC = () => {
  const { toast } = useToast();
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading, createSubject, updateSubject, deleteSubject } = useSubjects();
  const { quizzes } = useQuizzes();
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; class_id: string | null } | null>(null);
  const [filterClassId, setFilterClassId] = useState('all');
  
  // Filtered subjects based on selected class filter
  const filteredSubjects = filterClassId === 'all'
    ? subjects
    : subjects.filter(s => s.class_id === filterClassId);
  
  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !selectedClassId) {
      toast({
        title: "Error",
        description: "Please enter a subject name and select a class",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createSubject.mutateAsync({ name: newSubjectName, classId: selectedClassId });
      setNewSubjectName('');
      setSelectedClassId('');
      toast({
        title: "Success",
        description: `${newSubjectName} has been added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    }
  };
  
  const handleEditSubject = (subject: { id: string; name: string; class_id: string | null }) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setSelectedClassId(subject.class_id || '');
  };
  
  const handleSaveEdit = async () => {
    if (!editingSubject || !newSubjectName.trim() || !selectedClassId) return;
    
    try {
      await updateSubject.mutateAsync({ id: editingSubject.id, name: newSubjectName, classId: selectedClassId });
      setEditingSubject(null);
      setNewSubjectName('');
      setSelectedClassId('');
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await deleteSubject.mutateAsync(id);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Manage Subjects"
        description="Add, edit, or remove subjects"
      />
      
      <div className="space-y-6">
        {/* Add/Edit Subject Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Subject name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={editingSubject ? handleSaveEdit : handleAddSubject}>
                  {editingSubject ? 'Update' : 'Add Subject'}
                </Button>
                {editingSubject && (
                  <Button variant="outline" onClick={() => {
                    setEditingSubject(null);
                    setNewSubjectName('');
                    setSelectedClassId('');
                  }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Subject List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subjects</CardTitle>
            <Select
              value={filterClassId}
              onValueChange={setFilterClassId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading subjects...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => {
                    const quizCount = quizzes.filter(q => q.subject_id === subject.id).length;
                    return (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>
                          {classes.find(c => c.id === subject.class_id)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{quizCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditSubject(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subject.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No subjects found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SubjectManagement;

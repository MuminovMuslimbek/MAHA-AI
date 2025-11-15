
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';

const ClassManagement: React.FC = () => {
  const { toast } = useToast();
  const { classes, isLoading, createClass, updateClass, deleteClass } = useClasses();
  const { subjects } = useSubjects();
  
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null);
  
  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createClass.mutateAsync(newClassName);
      setNewClassName('');
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    }
  };
  
  const handleEditClass = (classItem: { id: string; name: string }) => {
    setEditingClass(classItem);
    setNewClassName(classItem.name);
  };
  
  const handleSaveEdit = async () => {
    if (!editingClass || !newClassName.trim()) return;
    
    try {
      await updateClass.mutateAsync({ id: editingClass.id, name: newClassName });
      setEditingClass(null);
      setNewClassName('');
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await deleteClass.mutateAsync(id);
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Manage Classes"
        description="Add, edit, or remove classes"
      />
      
      <div className="space-y-6">
        {/* Add/Edit Class Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Class name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={editingClass ? handleSaveEdit : handleAddClass}>
                {editingClass ? 'Update' : 'Add Class'}
              </Button>
              {editingClass && (
                <Button variant="outline" onClick={() => {
                  setEditingClass(null);
                  setNewClassName('');
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Class List */}
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading classes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => {
                    const subjectCount = subjects.filter(s => s.class_id === classItem.id).length;
                    return (
                      <TableRow key={classItem.id}>
                        <TableCell>{classItem.name}</TableCell>
                        <TableCell>{subjectCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClass(classItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(classItem.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {classes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No classes found. Add one to get started.
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

export default ClassManagement;

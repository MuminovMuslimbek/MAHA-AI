
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Image, Trash2, Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  link_url?: string | null;
  placement: 'quiz' | 'dashboard' | 'results' | 'current_affairs';
  is_active: boolean;
}

const AdvertisementManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ['advertisements', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Advertisement[];
    },
  });

  const [newAd, setNewAd] = useState<Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    placement: 'quiz',
    is_active: true
  });

  const [isAdding, setIsAdding] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: typeof newAd) => {
      const { error } = await supabase
        .from('advertisements')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({
        title: "Advertisement Added",
        description: "The advertisement has been successfully added."
      });
      setNewAd({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        placement: 'quiz',
        is_active: true
      });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({
        title: "Advertisement Deleted",
        description: "The advertisement has been deleted.",
        variant: "destructive"
      });
    },
  });

  const handleAddNewAd = () => {
    if (!newAd.title || !newAd.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createMutation.mutate(newAd);
  };

  const toggleAdStatus = (id: string) => {
    const ad = advertisements.find(a => a.id === id);
    if (ad) {
      updateMutation.mutate({ id, is_active: !ad.is_active });
      toast({
        title: ad.is_active ? "Advertisement Disabled" : "Advertisement Enabled",
        description: `"${ad.title}" has been ${ad.is_active ? "disabled" : "enabled"}.`
      });
    }
  };

  const deleteAd = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Advertisement Management"
        description="Manage advertisements displayed across the platform"
      />

      <div className="space-y-6 mb-20">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Current Advertisements</h2>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" className="bg-indigo-600">
              <Plus className="h-4 w-4 mr-1" /> New Ad
            </Button>
          )}
        </div>

        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Advertisement</CardTitle>
              <CardDescription>Create a new advertisement to display on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={newAd.title}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                  placeholder="Enter advertisement title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                  placeholder="Enter advertisement description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url"
                  value={newAd.image_url || ''}
                  onChange={(e) => setNewAd({...newAd, image_url: e.target.value})}
                  placeholder="Enter image URL (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input 
                  id="link_url"
                  value={newAd.link_url || ''}
                  onChange={(e) => setNewAd({...newAd, link_url: e.target.value})}
                  placeholder="Enter link URL (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="placement">Placement *</Label>
                <Select 
                  value={newAd.placement}
                  onValueChange={(value: 'quiz' | 'dashboard' | 'results' | 'current_affairs') => setNewAd({...newAd, placement: value})}
                >
                  <SelectTrigger id="placement">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz Screen</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="results">Results Screen</SelectItem>
                    <SelectItem value="current_affairs">Current Affairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="is_active" 
                  checked={newAd.is_active}
                  onCheckedChange={(checked) => setNewAd({...newAd, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAddNewAd} className="bg-indigo-600">Add Advertisement</Button>
            </CardFooter>
          </Card>
        )}
        
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading advertisements...
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1">
            {advertisements.map((ad) => (
              <Card key={ad.id} className={`${!ad.is_active ? 'opacity-70' : ''}`}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm">{ad.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs mt-1">{ad.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`active-${ad.id}`} 
                        checked={ad.is_active}
                        onCheckedChange={() => toggleAdStatus(ad.id)}
                      />
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteAd(ad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center space-x-1">
                      <Image className="h-3 w-3" />
                      <span>{ad.image_url ? 'Has image' : 'No image'}</span>
                    </div>
                    <div>
                      Placement: <span className="font-medium capitalize">{ad.placement.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {advertisements.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No advertisements added yet
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdvertisementManagement;

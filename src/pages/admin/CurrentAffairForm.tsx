
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import { useCurrentAffairs } from '@/hooks/useCurrentAffairs';
import { useLabels } from '@/hooks/useLabels';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Define the form validation schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  category: z.string().min(2, "Category is required"),
  tags: z.string(),
  imageUrl: z.string().optional(),
  isPremium: z.boolean().default(false),
  tokenPrice: z.number().min(1).max(10).default(1),
  labelIds: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

const CurrentAffairForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentAffairs, isLoading } = useCurrentAffairs();
  const { labels } = useLabels();

  // Find existing current affair if editing
  const existingAffair = isEditing 
    ? currentAffairs.find(affair => affair.id === id)
    : undefined;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: '',
      imageUrl: '',
      isPremium: false,
      tokenPrice: 1,
      labelIds: [],
    },
  });

  useEffect(() => {
    if (isEditing && existingAffair) {
      // Fetch labels for this current affair
      const fetchLabels = async () => {
        const { data } = await supabase
          .from('current_affair_labels')
          .select('label_id')
          .eq('current_affair_id', existingAffair.id);
        
        const labelIds = data?.map(l => l.label_id) || [];
        
        form.reset({
          title: existingAffair.title,
          content: existingAffair.content,
          category: existingAffair.category,
          tags: existingAffair.tags.join(', '),
          imageUrl: existingAffair.image_url || '',
          isPremium: existingAffair.is_premium,
          tokenPrice: existingAffair.token_price || 1,
          labelIds,
        });
      };
      fetchLabels();
    }
  }, [existingAffair, form, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const { data: newAffair, error } = await supabase
        .from('current_affairs')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: tagsArray,
          image_url: data.imageUrl || null,
          is_premium: data.isPremium,
          token_price: data.tokenPrice,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Insert label associations
      if (data.labelIds.length > 0 && newAffair) {
        const labelInserts = data.labelIds.map(labelId => ({
          current_affair_id: newAffair.id,
          label_id: labelId,
        }));
        
        const { error: labelError } = await supabase
          .from('current_affair_labels')
          .insert(labelInserts);
        
        if (labelError) throw labelError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAffairs'] });
      toast({
        title: "Current affair created",
        description: "The current affair has been created successfully."
      });
      navigate("/admin/current-affairs");
    },
    onError: (error: any) => {
      console.error('Create current affair error:', error);
      toast({
        title: "Error",
        description: error?.message || "There was a problem creating the current affair.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!id || id === 'new') throw new Error('No ID provided for update');
      
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const { error } = await supabase
        .from('current_affairs')
        .update({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: tagsArray,
          image_url: data.imageUrl || null,
          is_premium: data.isPremium,
          token_price: data.tokenPrice,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete existing label associations
      await supabase
        .from('current_affair_labels')
        .delete()
        .eq('current_affair_id', id);
      
      // Insert new label associations
      if (data.labelIds.length > 0) {
        const labelInserts = data.labelIds.map(labelId => ({
          current_affair_id: id,
          label_id: labelId,
        }));
        
        const { error: labelError } = await supabase
          .from('current_affair_labels')
          .insert(labelInserts);
        
        if (labelError) throw labelError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAffairs'] });
      toast({
        title: "Current affair updated",
        description: "The current affair has been updated successfully."
      });
      navigate("/admin/current-affairs");
    },
    onError: (error: any) => {
      console.error('Update current affair error:', error);
      toast({
        title: "Error",
        description: error?.message || "There was a problem updating the current affair.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted with data:', data);
    console.log('ID from params:', id);
    console.log('isEditing:', isEditing);
    
    if (isEditing && id && id !== 'new') {
      console.log('Updating current affair with ID:', id);
      updateMutation.mutate(data);
    } else {
      console.log('Creating new current affair');
      createMutation.mutate(data);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title={isEditing ? "Edit Current Affair" : "Add New Current Affair"}
        description={isEditing ? "Update an existing current affair" : "Create a new current affair for students"}
      />

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter current affair title" {...field} />
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
                      <Input placeholder="e.g. Politics, Economy, Science" {...field} />
                    </FormControl>
                    <FormDescription>
                      The main category this current affair belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the content of the current affair..." 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tags separated by commas" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add relevant tags separated by commas (e.g. "election, democracy, voting")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to an image that represents this current affair
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="labelIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labels</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label) => {
                        const isSelected = field.value.includes(label.id);
                        return (
                          <Badge
                            key={label.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            style={{
                              backgroundColor: isSelected ? label.color : 'transparent',
                              borderColor: label.color,
                              color: isSelected ? 'white' : label.color,
                            }}
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value.filter(id => id !== label.id)
                                : [...field.value, label.id];
                              field.onChange(newValue);
                            }}
                          >
                            {label.name}
                            {isSelected && <X className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormDescription>
                      Select labels to categorize this current affair
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium Content</FormLabel>
                      <FormDescription>
                        Mark this current affair as premium content
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('isPremium') && (
                <FormField
                  control={form.control}
                  name="tokenPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          max={10}
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of tokens required to unlock this premium content (1-10)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/current-affairs")}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Current Affair" : "Create Current Affair"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </MainLayout>
  );
};

export default CurrentAffairForm;

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Users } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  genre: string;
  location: string;
  type: 'local' | 'online' | 'hybrid';
  activity_level: 'low' | 'moderate' | 'high';
  current_book: string;
  total_slots: number;
}

interface EditGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onGroupUpdated: () => void;
}

export const EditGroupDialog = ({ isOpen, onClose, group, onGroupUpdated }: EditGroupDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    location: '',
    type: 'online' as 'local' | 'online' | 'hybrid',
    activity_level: 'moderate' as 'low' | 'moderate' | 'high',
    current_book: '',
    total_slots: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        genre: group.genre || '',
        location: group.location || '',
        type: group.type || 'online',
        activity_level: group.activity_level || 'moderate',
        current_book: group.current_book || '',
        total_slots: group.total_slots || 10
      });
    }
  }, [group]);

  const handleSubmit = async () => {
    if (!group) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('book_groups')
        .update({
          name: formData.name,
          description: formData.description,
          genre: formData.genre,
          location: formData.location,
          type: formData.type,
          activity_level: formData.activity_level,
          current_book: formData.current_book,
          total_slots: formData.total_slots,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Group Updated!",
        description: "Your group has been updated successfully.",
      });

      onGroupUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Edit Group
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your group"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => setFormData({...formData, genre: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Biography">Biography</SelectItem>
                  <SelectItem value="Self-Help">Self-Help</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'local' | 'online' | 'hybrid') => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Enter location or 'Online'"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_book">Current Book</Label>
            <Input
              id="current_book"
              value={formData.current_book}
              onChange={(e) => setFormData({...formData, current_book: e.target.value})}
              placeholder="What book is the group reading?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(value: 'low' | 'moderate' | 'high') => setFormData({...formData, activity_level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_slots">Total Slots</Label>
              <Input
                id="total_slots"
                type="number"
                min="2"
                max="100"
                value={formData.total_slots}
                onChange={(e) => setFormData({...formData, total_slots: parseInt(e.target.value) || 10})}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
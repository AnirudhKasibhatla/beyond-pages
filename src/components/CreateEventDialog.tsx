import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEventDialog = ({ open, onOpenChange }: CreateEventDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    type: "",
    category: "",
    maxAttendees: "",
    featured: false
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.eventDate || !formData.eventTime || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('book_events')
        .insert({
          title: formData.title,
          description: formData.description,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          location: formData.location,
          type: formData.type,
          category: formData.category,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          featured: formData.featured,
          creator_id: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Event Created!",
        description: `"${formData.title}" has been created successfully. You earned 25 XP!`,
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        type: "",
        category: "",
        maxAttendees: "",
        featured: false
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Host a book event and connect with fellow readers in your community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title *</Label>
            <Input
              id="event-title"
              placeholder="e.g., Mystery Book Club Discussion"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people what your event is about..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange("eventDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-time">Time *</Label>
              <Input
                id="event-time"
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleInputChange("eventTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Central Library, Room 204 or Virtual (Zoom)"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type *</Label>
            <Select onValueChange={(value) => handleInputChange("type", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => handleInputChange("category", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book-club">Book Club</SelectItem>
                <SelectItem value="author-talk">Author Talk</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-attendees">Max Attendees (Optional)</Label>
            <Input
              id="max-attendees"
              type="number"
              placeholder="e.g., 25"
              min="1"
              max="1000"
              value={formData.maxAttendees}
              onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
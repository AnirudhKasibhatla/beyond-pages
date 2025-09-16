import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BookEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  category: 'book-club' | 'author-talk' | 'workshop' | 'social';
  attendees: number;
  maxAttendees?: number;
  isRsvped: boolean;
  hostXP: number;
  host: string;
  featured?: boolean;
  creatorId: string;
  isHost: boolean;
  recurring?: boolean;
  recurringDays?: string[];
  recurringDuration?: number;
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: BookEvent | null;
  onEventUpdated: () => void;
}

export const EditEventDialog = ({ open, onOpenChange, event, onEventUpdated }: EditEventDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    type: "",
    category: "",
    maxAttendees: "",
    featured: false,
    recurring: false,
    recurringDays: [] as string[],
    recurringDuration: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        eventDate: event.date.toISOString().split('T')[0],
        eventTime: event.time,
        location: event.location,
        type: event.type,
        category: event.category,
        maxAttendees: event.maxAttendees?.toString() || "",
        featured: event.featured || false,
        recurring: event.recurring || false,
        recurringDays: event.recurringDays || [],
        recurringDuration: event.recurringDuration?.toString() || ""
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !formData.title || !formData.eventDate || !formData.eventTime || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the event
      const { error } = await supabase
        .from('book_events')
        .update({
          title: formData.title,
          description: formData.description,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          location: formData.location,
          type: formData.type,
          category: formData.category,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          featured: formData.featured,
          recurring: formData.recurring,
          recurring_days: formData.recurring ? formData.recurringDays : null,
          recurring_duration: formData.recurring && formData.recurringDuration ? parseInt(formData.recurringDuration) : null
        })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event Updated!",
        description: `"${formData.title}" has been updated successfully.`,
      });

      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecurringDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        recurringDays: [...prev.recurringDays, day]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recurringDays: prev.recurringDays.filter(d => d !== day)
      }));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Update your event details and save changes.
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
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
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
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
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

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => handleInputChange("recurring", checked as boolean)}
              />
              <Label htmlFor="recurring">Make this a recurring event</Label>
            </div>

            {formData.recurring && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Days of the week</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.toLowerCase()}
                          checked={formData.recurringDays.includes(day.toLowerCase())}
                          onCheckedChange={(checked) => handleRecurringDayChange(day.toLowerCase(), checked as boolean)}
                        />
                        <Label htmlFor={day.toLowerCase()} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring-duration">Number of weeks to repeat</Label>
                  <Input
                    id="recurring-duration"
                    type="number"
                    placeholder="e.g., 4"
                    min="1"
                    max="52"
                    value={formData.recurringDuration}
                    onChange={(e) => handleInputChange("recurringDuration", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
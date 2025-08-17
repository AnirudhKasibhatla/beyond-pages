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

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupDialog = ({ open, onOpenChange }: CreateGroupDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalSlots: "",
    description: "",
    genre: "",
    type: ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.totalSlots) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save to database
    toast({
      title: "Group Created!",
      description: `"${formData.name}" has been created successfully. You earned 25 XP!`,
    });

    // Reset form and close dialog
    setFormData({
      name: "",
      location: "",
      totalSlots: "",
      description: "",
      genre: "",
      type: ""
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Book Group
          </DialogTitle>
          <DialogDescription>
            Start your own reading community and connect with fellow book lovers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              placeholder="e.g., Mystery Lovers Society"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Downtown Library or Virtual (Discord)"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-slots">Total Slots *</Label>
            <Input
              id="total-slots"
              type="number"
              placeholder="e.g., 20"
              min="2"
              max="500"
              value={formData.totalSlots}
              onChange={(e) => handleInputChange("totalSlots", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Group Type</Label>
            <Select onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local (In-person)</SelectItem>
                <SelectItem value="online">Online (Virtual)</SelectItem>
                <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Preferred Genre</Label>
            <Select onValueChange={(value) => handleInputChange("genre", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="science-fiction">Science Fiction</SelectItem>
                <SelectItem value="literary-fiction">Literary Fiction</SelectItem>
                <SelectItem value="young-adult">Young Adult</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="biography">Biography</SelectItem>
                <SelectItem value="general">General (All genres)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people what makes your group special..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
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
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
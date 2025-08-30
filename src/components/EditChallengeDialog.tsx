import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReadingChallenges, ReadingChallenge } from "@/hooks/useReadingChallenges";
import { useToast } from "@/hooks/use-toast";
import { Edit, BookOpen, Target } from "lucide-react";

interface EditChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ReadingChallenge | null;
}

export const EditChallengeDialog = ({ isOpen, onClose, challenge }: EditChallengeDialogProps) => {
  const [goal, setGoal] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [status, setStatus] = useState<'in-progress' | 'completed' | 'failed'>('in-progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateChallenge } = useReadingChallenges();
  const { toast } = useToast();

  useEffect(() => {
    if (challenge) {
      setGoal(challenge.goal.toString());
      setFavoriteGenre(challenge.favorite_genre);
      setStatus(challenge.status);
    }
  }, [challenge]);

  const handleSubmit = async () => {
    if (!challenge) return;

    setIsSubmitting(true);

    try {
      const { error } = await updateChallenge(challenge.id, {
        goal: parseInt(goal),
        favorite_genre: favoriteGenre,
        status,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Challenge Updated!",
        description: `Your ${challenge.year} reading challenge has been updated.`,
      });

      onClose();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to update reading challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Edit {challenge.year} Challenge
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-medium">
              Reading Goal
            </Label>
            <div className="relative">
              <Input
                id="goal"
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                min="1"
                max="365"
                className="pl-10"
              />
              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-sm font-medium">
              Favorite Genre
            </Label>
            <Select value={favoriteGenre} onValueChange={setFavoriteGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select your favorite genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fiction">Fiction</SelectItem>
                <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                <SelectItem value="Mystery">Mystery</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Sci-Fi">Science Fiction</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
                <SelectItem value="Biography">Biography</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Self-Help">Self-Help</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="No preference">No preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Challenge Status
            </Label>
            <Select value={status} onValueChange={(value: 'in-progress' | 'completed' | 'failed') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{challenge.completed}/{goal} books</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Achievement Rate</span>
              <span className="font-medium">
                {Math.round((challenge.completed / parseInt(goal)) * 100)}%
              </span>
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
            {isSubmitting ? 'Updating...' : 'Update Challenge'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
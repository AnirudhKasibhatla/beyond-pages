import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReadingChallenges } from "@/hooks/useReadingChallenges";
import { useToast } from "@/hooks/use-toast";
import { Target, BookOpen } from "lucide-react";

interface ReadingChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ReadingChallengeModal = ({ isOpen, onClose, onComplete }: ReadingChallengeModalProps) => {
  const [goal, setGoal] = useState('12');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createChallenge } = useReadingChallenges();
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await createChallenge({
        year: currentYear,
        goal: parseInt(goal),
        favorite_genre: favoriteGenre || 'No preference',
        status: 'in-progress',
        completed: 0,
        best_month: 'No data'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Challenge Created!",
        description: `Your ${currentYear} reading challenge has been set up with a goal of ${goal} books.`,
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create reading challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Set Your Reading Challenge</DialogTitle>
          <DialogDescription className="text-base">
            Welcome to your reading journey! Set a goal for {currentYear} to track your progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-medium">
              How many books do you want to read in {currentYear}?
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
                placeholder="12"
              />
              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-sm font-medium">
              Favorite Genre (Optional)
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Set Challenge'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
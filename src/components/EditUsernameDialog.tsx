import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditUsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditUsernameDialog = ({ isOpen, onClose }: EditUsernameDialogProps) => {
  const { profile, updateProfile } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const validateUsername = (value: string) => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-z0-9]+$/.test(value)) return 'Username can only contain lowercase letters and numbers';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await updateProfile({ username });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('This username is already taken');
        } else {
          setError('Failed to update username. Please try again.');
        }
        return;
      }

      toast({
        title: "Username Updated!",
        description: `Your username has been changed to @${username}`,
      });

      onClose();
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(cleaned);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Edit Username
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="pl-8"
                placeholder="username"
                maxLength={20}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Lowercase letters and numbers only, 3-20 characters
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-1">Preview:</div>
              <div className="text-muted-foreground">@{username || 'username'}</div>
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
            disabled={isSubmitting || !username || !!validateUsername(username)}
          >
            {isSubmitting ? 'Updating...' : 'Update Username'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
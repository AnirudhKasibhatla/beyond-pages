import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignUpPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignUpPromptDialog: React.FC<SignUpPromptDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/40 backdrop-blur-xl border-white/20 shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Join Beyond Pages</DialogTitle>
          <DialogDescription className="text-center">
            Sign up or sign in to experience all the features
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Create and join book groups</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Host and attend reading events</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Quote className="h-4 w-4 text-primary" />
                <span>Save and share your favorite quotes</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Track your reading progress</span>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleSignUp} className="w-full">
              Get Started
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
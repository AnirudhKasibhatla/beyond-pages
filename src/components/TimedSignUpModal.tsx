import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Quote, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGuestAuth } from '@/hooks/useGuestAuth';

export const TimedSignUpModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGuest } = useGuestAuth();

  useEffect(() => {
    // Only show modal for unauthenticated users
    if (user || sessionStorage.getItem('signUpModalDismissed')) {
      return;
    }

    // Start timer only once
    if (!timerActive && !open) {
      setTimerActive(true);
      
      const timer = setTimeout(() => {
        setOpen(true);
        setTimerActive(false);
      }, 20000); // 20 seconds

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleSignUp = () => {
    setOpen(false);
    navigate('/auth');
  };

  const handleClose = () => {
    setOpen(false);
    // Don't show again for this session
    sessionStorage.setItem('signUpModalDismissed', 'true');
  };

  // Don't show if user is authenticated or if already dismissed in this session
  if (user || sessionStorage.getItem('signUpModalDismissed')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Unlock Full Experience
          </DialogTitle>
          <DialogDescription className="text-center">
            You're browsing as a guest. Sign up to unlock all features and save your progress!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="p-4 bg-gradient-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Join book groups and connect with readers</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>RSVP to events and host your own</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Quote className="h-4 w-4 text-primary" />
                <span>Save highlights and track reading progress</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Build your personal book library</span>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleSignUp} className="w-full">
              Sign Up Now
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
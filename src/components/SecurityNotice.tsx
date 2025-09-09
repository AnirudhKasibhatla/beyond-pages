import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { useGuestAuth } from '@/hooks/useGuestAuth';

const SecurityNotice: React.FC = () => {
  const { isGuest } = useGuestAuth();

  if (!isGuest) return null;

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Guest Mode:</span>
          <span>Limited access to protect user data. Sign up for full features.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityNotice;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  onGoogleAuth: () => void;
  onSkipAuth: () => void;
}

const AuthCard = ({ onGoogleAuth, onSkipAuth }: AuthCardProps) => {
  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to continue your reading journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onGoogleAuth}
          className="w-full"
          size="lg"
        >
          Continue with Google
        </Button>
        <Button 
          onClick={onSkipAuth}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Skip Authentication (Guest)
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthCard;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Chrome, User as UserIcon, Globe, Calendar } from "lucide-react";
import type { User, Session } from '@supabase/supabase-js';

interface UserDetails {
  name: string;
  country: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
}

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    country: '',
    dateOfBirth: '',
    email: '',
    phone: ''
  });
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserProfile(session.user);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkUserProfile(session.user);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (user: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.name) {
      setUserDetails({
        name: '',
        country: '',
        dateOfBirth: '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setShowDetails(true);
    } else {
      navigate('/dashboard');
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authData.email,
      password: authData.password
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: authData.email,
      password: authData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link.",
      });
    }
    setLoading(false);
  };

  const sendOTP = async () => {
    setPhoneLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: authData.phone
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setOtpSent(true);
      toast({
        title: "OTP sent",
        description: "Check your phone for the verification code.",
      });
    }
    setPhoneLoading(false);
  };

  const verifyOTP = async () => {
    setPhoneLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: authData.phone,
      token: authData.otp,
      type: 'sms'
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setPhoneLoading(false);
  };

  const saveUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        name: userDetails.name,
        country: userDetails.country,
        date_of_birth: userDetails.dateOfBirth,
        email: userDetails.email,
        phone: userDetails.phone,
        display_name: userDetails.name
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile created",
        description: "Welcome to the reading community!",
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  if (user && !showDetails) {
    navigate('/dashboard');
    return null;
  }

  if (showDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Let's get to know you better
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  className="pl-9"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  className="pl-9"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  className="pl-9"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={userDetails.country} onValueChange={(value) => setUserDetails({...userDetails, country: value})}>
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="BR">Brazil</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  value={userDetails.dateOfBirth}
                  onChange={(e) => setUserDetails({...userDetails, dateOfBirth: e.target.value})}
                  className="pl-9"
                />
              </div>
            </div>

            <Button 
              onClick={saveUserDetails} 
              className="w-full"
              disabled={loading || !userDetails.name || !userDetails.email || !userDetails.country}
            >
              {loading ? "Creating Profile..." : "Complete Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to BookClub</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button onClick={signInWithEmail} className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      placeholder="Create a password"
                    />
                  </div>
                  <Button onClick={signUpWithEmail} className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={authData.phone}
                      onChange={(e) => setAuthData({...authData, phone: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                  <Button onClick={sendOTP} className="w-full" disabled={phoneLoading}>
                    {phoneLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      value={authData.otp}
                      onChange={(e) => setAuthData({...authData, otp: e.target.value})}
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                  <Button onClick={verifyOTP} className="w-full" disabled={phoneLoading}>
                    {phoneLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOtpSent(false)}
                    className="w-full"
                  >
                    Change Phone Number
                  </Button>
                </>
              )}
            </TabsContent>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={signInWithGoogle}
              className="w-full gap-2"
              disabled={loading}
            >
              <Chrome className="h-4 w-4" />
              Google
            </Button>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
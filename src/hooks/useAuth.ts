import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clear guest status when user signs in
        if (session?.user) {
          localStorage.removeItem('isGuest');
          
          // Mark authentication timestamp for post-auth splash
          if (event === 'SIGNED_IN') {
            sessionStorage.setItem('lastAuthTime', Date.now().toString());
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear guest status if there's an existing session
      if (session?.user) {
        localStorage.removeItem('isGuest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear all auth-related data when signing out
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestSession');
    
    // Clear any cached user data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('rate_limit_') || key.startsWith('user_')) {
        localStorage.removeItem(key);
      }
    });
    
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};
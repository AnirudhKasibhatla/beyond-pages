import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  bio: string | null;
  username: string | null;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  profile_picture_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile({
            ...data,
            bio: (data as any).bio || null
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile({
        ...data,
        bio: (data as any).bio || null
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_input: username
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { data, error } = await updateProfile({
        profile_picture_url: publicUrl
      });

      return { data: publicUrl, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const removeProfilePicture = async () => {
    if (!user || !profile?.profile_picture_url) return;

    try {
      const fileName = `${user.id}/profile.jpg`;
      
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      return await updateProfile({
        profile_picture_url: null
      });
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    checkUsernameAvailability,
    uploadProfilePicture,
    removeProfilePicture,
  };
};
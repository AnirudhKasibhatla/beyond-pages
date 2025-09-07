import { useState, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface ProfilePictureUploadProps {
  isEditing: boolean;
}

export const ProfilePictureUpload = ({ isEditing }: ProfilePictureUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfilePicture, removeProfilePicture } = useProfile();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await uploadProfilePicture(file);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePicture = async () => {
    try {
      const { error } = await removeProfilePicture();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2" disabled={uploading}>
            <Camera className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Change Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemovePicture}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Photo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};
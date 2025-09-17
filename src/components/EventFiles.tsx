import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileImage, Download, Trash2, Calendar, MapPin, Clock, Upload, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "./OptimizedImage";

interface EventFilesProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
}

interface EventImage {
  id: string;
  image_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

interface EventData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  type: string;
  category: string;
}

export const EventFiles = ({ eventId, eventTitle, isOpen, onClose, isHost }: EventFilesProps) => {
  const [images, setImages] = useState<EventImage[]>([]);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && eventId) {
      loadEventFiles();
      loadEventData();
    }
  }, [isOpen, eventId]);

  const loadEventFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_images')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading event files:', error);
      toast({
        title: "Error",
        description: "Failed to load event files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('book_events')
        .select('title, description, event_date, event_time, location, type, category')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEventData(data);
    } catch (error) {
      console.error('Error loading event data:', error);
    }
  };

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Downloaded",
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File) => {
    if (!user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${eventId}_${Date.now()}.${fileExtension}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      // Save reference in database
      const { error: dbError } = await supabase
        .from('event_images')
        .insert({
          event_id: eventId,
          image_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      // Reload images
      await loadEventFiles();

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  const deleteImage = async (imageId: string, fileName: string) => {
    try {
      // Get the image to find the file path
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Delete from storage
      const fileName_from_url = image.image_url.split('/').pop();
      if (fileName_from_url) {
        const { error: storageError } = await supabase.storage
          .from('event-images')
          .remove([fileName_from_url]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('event_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Deleted",
        description: `${fileName} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            Event Files - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images">Generated Images</TabsTrigger>
            <TabsTrigger value="details">Event Details</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-4">
            {isHost && (
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Upload Event Images</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add custom images to your event
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Choose Image"}
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading files...</div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center p-8">
                <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-muted-foreground">
                  {isHost 
                    ? "Upload images using the form above, or images will be automatically created when you host an event."
                    : "Event images will appear here once generated by the host."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="border rounded-lg p-4 space-y-3">
                    <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                      <OptimizedImage
                        src={image.image_url}
                        alt={`Event image for ${eventTitle}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm truncate">{image.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(image.file_size)} • {formatDate(image.created_at)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          <FileImage className="h-3 w-3 mr-1" />
                          {image.file_name.split('.').pop()?.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadImage(image.image_url, image.file_name)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        {isHost && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteImage(image.id, image.file_name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {eventData && (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">{eventData.title}</h3>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(eventData.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eventData.event_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{eventData.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">
                      {eventData.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {eventData.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                {eventData.description && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {eventData.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
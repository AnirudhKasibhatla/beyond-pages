import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Quote, BookOpen, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { captureImageFromCamera, extractTextFromImage } from '@/utils/textExtraction';
import { ImageCrop } from '@/components/ui/image-crop';

interface AddHighlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (highlight: {
    quote_text: string;
    book_title: string;
    book_author?: string;
    page_number?: string;
  }) => void;
}

export const AddHighlightDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: AddHighlightDialogProps) => {
  const [quoteText, setQuoteText] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const { toast } = useToast();

  const handleAddHighlight = () => {
    if (!quoteText.trim() || !bookTitle.trim()) return;
    
    onConfirm({
      quote_text: quoteText,
      book_title: bookTitle,
      book_author: bookAuthor || undefined,
      page_number: pageNumber || undefined,
    });
    
    // Reset form
    setQuoteText('');
    setBookTitle('');
    setBookAuthor('');
    setPageNumber('');
    onClose();
  };

  const handleScanQuote = useCallback(async () => {
    try {
      setIsScanning(true);
      toast({
        title: "Scanning",
        description: "Please take a photo of the text you want to extract",
      });
      
      const imageFile = await captureImageFromCamera();
      setCapturedImage(imageFile);
      setShowCropDialog(true);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: "Scan Failed", 
        description: error instanceof Error ? error.message : "Unable to capture image. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  }, [toast]);

  const handleCropComplete = useCallback(async (croppedFile: File) => {
    setShowCropDialog(false);
    setCapturedImage(null);
    
    try {
      toast({
        title: "Processing",
        description: "Extracting text from image...",
      });
      
      const extractedText = await extractTextFromImage(croppedFile);
      
      if (extractedText && extractedText.trim()) {
        setQuoteText(extractedText);
        toast({
          title: "Text Extracted Successfully",
          description: "The text has been extracted from your image. You can edit it if needed.",
        });
      } else {
        toast({
          title: "No Text Found",
          description: "Could not extract any readable text from the image. Please try again with a clearer image or better lighting.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during text extraction:', error);
      toast({
        title: "Extraction Failed", 
        description: error instanceof Error ? error.message : "Unable to extract text from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, [toast]);

  const handleCropDialogClose = () => {
    setShowCropDialog(false);
    setCapturedImage(null);
    setIsScanning(false);
  };

  const handleCancel = () => {
    setQuoteText('');
    setBookTitle('');
    setBookAuthor('');
    setPageNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md sm:rounded-lg rounded-xl mx-1 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Add New Highlight
          </DialogTitle>
          <DialogDescription>
            Add a memorable quote from any book to your highlights collection
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quoteText">Quote *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleScanQuote}
                disabled={isScanning}
                className="gap-2 mb-2 pb-2"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isScanning ? 'Scanning...' : 'Scan Quote'}
                </span>
              </Button>
            </div>
            <Textarea
              id="quoteText"
              placeholder="Enter the quote you want to highlight..."
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="bookTitle">Book Title *</Label>
            <Input
              id="bookTitle"
              placeholder="Enter book title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="bookAuthor">Author (optional)</Label>
            <Input
              id="bookAuthor"
              placeholder="Enter author name"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="pageNumber">Page Number (optional)</Label>
            <Input
              id="pageNumber"
              placeholder="e.g., 42 or Chapter 3"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddHighlight}
            disabled={!quoteText.trim() || !bookTitle.trim()}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Add Highlight
          </Button>
        </div>
      </DialogContent>

      {/* Image Crop Dialog */}
      {capturedImage && (
        <ImageCrop
          isOpen={showCropDialog}
          onClose={handleCropDialogClose}
          imageFile={capturedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </Dialog>
  );
};
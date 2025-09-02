import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Quote, BookOpen, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { captureImageFromCamera, extractTextFromImage } from '@/utils/textExtraction';

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

  const handleScanQuote = async () => {
    try {
      setIsScanning(true);
      const imageFile = await captureImageFromCamera();
      const extractedText = await extractTextFromImage(imageFile);
      
      if (extractedText) {
        setQuoteText(extractedText);
        toast({
          title: "Text extracted",
          description: "Quote text has been added to the form",
        });
      } else {
        toast({
          title: "No text found",
          description: "Try taking a clearer photo of the text",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scanning quote:', error);
      toast({
        title: "Scan failed",
        description: "Unable to extract text from image",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
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
                className="gap-2"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isScanning ? 'Scanning...' : 'Scan Quote'}
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
    </Dialog>
  );
};
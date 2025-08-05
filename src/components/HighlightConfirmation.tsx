import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Quote, BookOpen } from 'lucide-react';

interface HighlightConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onConfirm: (highlight: {
    quote_text: string;
    book_title: string;
    book_author?: string;
    page_number?: string;
  }) => void;
}

export const HighlightConfirmation = ({ 
  isOpen, 
  onClose, 
  selectedText, 
  onConfirm 
}: HighlightConfirmationProps) => {
  const [step, setStep] = useState<'confirm' | 'details'>('confirm');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [pageNumber, setPageNumber] = useState('');

  const handleConfirmQuote = () => {
    setStep('details');
  };

  const handleAddHighlight = () => {
    if (!bookTitle.trim()) return;
    
    onConfirm({
      quote_text: selectedText,
      book_title: bookTitle,
      book_author: bookAuthor || undefined,
      page_number: pageNumber || undefined,
    });
    
    // Reset form
    setStep('confirm');
    setBookTitle('');
    setBookAuthor('');
    setPageNumber('');
    onClose();
  };

  const handleCancel = () => {
    setStep('confirm');
    setBookTitle('');
    setBookAuthor('');
    setPageNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        {step === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                Is this a book quote?
              </DialogTitle>
              <DialogDescription>
                Did you just share a line or quote from a book?
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm italic">"{selectedText}"</p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                No, it's not
              </Button>
              <Button onClick={handleConfirmQuote} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Yes, add to highlights
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Add to Highlights
              </DialogTitle>
              <DialogDescription>
                Please provide book details for this quote
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm italic">"{selectedText}"</p>
              </div>
              
              <div className="space-y-3">
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
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddHighlight}
                disabled={!bookTitle.trim()}
                className="gap-2"
              >
                <Quote className="h-4 w-4" />
                Add Highlight
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
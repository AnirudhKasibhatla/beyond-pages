import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, FileText, BookOpen, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  status: 'to-read' | 'reading' | 'finished';
  genres: string[];
  progress?: string;
  rating?: number;
  reviewText?: string;
  createdAt: Date;
}

interface GoodreadsImportProps {
  onBooksImport: (books: Book[]) => void;
}

export const GoodreadsImport = ({ onBooksImport }: GoodreadsImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewBooks, setPreviewBooks] = useState<Book[]>([]);

  const mapGoodreadsStatus = (goodreadsShelf: string): Book['status'] => {
    const shelf = goodreadsShelf.toLowerCase().trim();
    switch (shelf) {
      case 'read':
        return 'finished';
      case 'currently-reading':
        return 'reading';
      case 'to-read':
      default:
        return 'to-read';
    }
  };

  const parseCSV = (csvText: string): Book[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').toLowerCase());
    
    const books: Book[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Simple CSV parsing - in production, use a proper CSV parser
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      
      const titleIndex = headers.findIndex(h => h.includes('title'));
      const authorIndex = headers.findIndex(h => h.includes('author'));
      const isbnIndex = headers.findIndex(h => h.includes('isbn'));
      const shelfIndex = headers.findIndex(h => h.includes('shelf') || h.includes('exclusive'));
      const ratingIndex = headers.findIndex(h => h.includes('rating') && h.includes('my'));
      const reviewIndex = headers.findIndex(h => h.includes('review'));
      
      if (titleIndex >= 0 && authorIndex >= 0 && values[titleIndex] && values[authorIndex]) {
        // Parse rating - ensure it's a valid number between 0-5
        let parsedRating: number | undefined;
        if (ratingIndex >= 0 && values[ratingIndex]) {
          const ratingValue = parseInt(values[ratingIndex]);
          if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
            parsedRating = ratingValue;
          }
        }

        const book: Book = {
          id: Date.now().toString() + Math.random().toString(),
          title: values[titleIndex] || 'Unknown Title',
          author: values[authorIndex] || 'Unknown Author',
          isbn: isbnIndex >= 0 ? values[isbnIndex] : undefined,
          status: shelfIndex >= 0 ? mapGoodreadsStatus(values[shelfIndex]) : 'to-read',
          genres: [], // We'll infer genres or leave empty for now
          rating: parsedRating,
          reviewText: reviewIndex >= 0 ? values[reviewIndex] : undefined,
          createdAt: new Date(),
        };
        
        books.push(book);
      }
    }
    
    return books;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedBooks = parseCSV(csvText);
        
        if (parsedBooks.length === 0) {
          toast.error("No books found in the file. Please check the format.");
          setImporting(false);
          return;
        }
        
        setPreviewBooks(parsedBooks);
        toast.success(`Found ${parsedBooks.length} books ready to import!`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error("Error reading the file. Please make sure it's a valid Goodreads export.");
      } finally {
        setImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImportBooks = () => {
    onBooksImport(previewBooks);
    setPreviewBooks([]);
    setIsOpen(false);
    toast.success(`Successfully imported ${previewBooks.length} books to your library!`);
  };

  const getStatusIcon = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return <BookOpen className="h-4 w-4 text-primary" />;
      case 'to-read':
        return <Clock className="h-4 w-4 text-accent" />;
      case 'finished':
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const statusCounts = previewBooks.reduce((acc, book) => {
    acc[book.status] = (acc[book.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import from Goodreads
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Import Books from Goodreads
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {previewBooks.length === 0 ? (
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Download className="h-5 w-5" />
                    <h3 className="font-semibold">Step 1: Export from Goodreads</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    1. Go to your Goodreads account and navigate to "My Books"<br/>
                    2. Click "Import and export" at the bottom of the page<br/>
                    3. Click "Export Library" to download your books as a CSV file
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Upload className="h-5 w-5" />
                    <h3 className="font-semibold">Step 2: Upload Your CSV File</h3>
                  </div>
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                      disabled={importing}
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {importing ? "Processing..." : "Click to upload your Goodreads CSV file"}
                      </p>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">Import Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {previewBooks.length} books ready to import
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Finished: {statusCounts.finished || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">Reading: {statusCounts.reading || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm">To Read: {statusCounts['to-read'] || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {previewBooks.slice(0, 20).map((book) => (
                  <Card key={book.id} className="p-3 bg-gradient-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-muted-foreground">by {book.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {book.rating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {book.rating}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {getStatusIcon(book.status)}
                          <span className="text-xs capitalize">{book.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {previewBooks.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground">
                    and {previewBooks.length - 20} more books...
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setPreviewBooks([])}>
                  Cancel
                </Button>
                <Button onClick={handleImportBooks} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import {previewBooks.length} Books
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

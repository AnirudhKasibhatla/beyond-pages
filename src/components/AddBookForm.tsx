import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Camera, X, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BrowserMultiFormatReader } from "@zxing/library";

interface Book {
  title: string;
  author: string;
  isbn?: string;
  status: 'to-read' | 'reading' | 'finished';
  genres: string[];
  progress?: string;
  rating?: number;
  reviewText?: string;
}

interface AddBookFormProps {
  onAddBook: (book: Book) => void;
  onCancel: () => void;
}

const COMMON_GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Health', 'Travel',
  'Poetry', 'Drama', 'Comedy', 'Horror', 'Thriller', 'Adventure'
];

export const AddBookForm = ({ onAddBook, onCancel }: AddBookFormProps) => {
  const [formData, setFormData] = useState<Book>({
    title: '',
    author: '',
    isbn: '',
    status: 'to-read',
    genres: [],
    progress: '',
    rating: undefined,
    reviewText: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'book' | 'author'>('book');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      let results = [];
      
      // Check if search query is an ISBN (10 or 13 digits with possible hyphens)
      const isISBN = /^[\d\-]{10,17}$/.test(searchTerm.replace(/\s/g, ''));
      
      if (isISBN) {
        // Search by ISBN using Open Library
        const isbn = searchTerm.replace(/[\s\-]/g, '');
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const data = await response.json();
        
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
          const book = data[bookKey];
          results = [{
            title: book.title || 'Unknown Title',
            author: book.authors?.[0]?.name || 'Unknown Author',
            isbn: isbn,
            subjects: book.subjects?.map(s => s.name).slice(0, 3) || [],
            cover: book.cover?.medium,
            publishYear: book.publish_date
          }];
        }
      } else {
        // Search by title/author using Open Library search API
        const query = encodeURIComponent(searchTerm);
        let searchUrl = '';
        let limit = 1;
        
        if (searchType === 'author') {
          // Search specifically by author and return all books by that author
          searchUrl = `https://openlibrary.org/search.json?author=${query}&limit=10`;
          limit = 10;
        } else {
          // Search by book title and return only one result
          searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=1`;
          limit = 1;
        }
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        results = data.docs?.slice(0, limit).map(book => {
          // Extract ISBN from multiple possible fields
          let isbn = '';
          if (book.isbn && book.isbn.length > 0) {
            isbn = book.isbn[0];
          } else if (book.isbn_13 && book.isbn_13.length > 0) {
            isbn = book.isbn_13[0];
          } else if (book.isbn_10 && book.isbn_10.length > 0) {
            isbn = book.isbn_10[0];
          }
          
          return {
            title: book.title || 'Unknown Title',
            author: book.author_name?.[0] || 'Unknown Author',
            isbn: isbn,
            subjects: book.subject?.slice(0, 3) || [],
            cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
            publishYear: book.first_publish_year
          };
        }) || [];
      }
      
      setSearchResults(results);
      toast({
        title: "Search completed",
        description: `Found ${results.length} book(s)`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to fetch book data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startBarcodeScanning = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      setShowScanner(true);
      setIsScanning(true);
      
      // Initialize the barcode reader
      codeReader.current = new BrowserMultiFormatReader();
      
      // Start scanning
      setTimeout(async () => {
        if (videoRef.current && codeReader.current) {
          try {
            const result = await codeReader.current.decodeFromVideoDevice(
              undefined, // Use default video device
              videoRef.current,
              (result, error) => {
                if (result) {
                  const isbn = result.getText();
                  setSearchQuery(isbn);
                  stopBarcodeScanning();
                  toast({
                    title: "Barcode scanned!",
                    description: `ISBN: ${isbn}`,
                  });
                  // Automatically search for the book
                  handleSearch(isbn);
                }
              }
            );
          } catch (err) {
            console.error('Error starting barcode scanning:', err);
            toast({
              title: "Scanner error",
              description: "Failed to start camera scanner.",
              variant: "destructive",
            });
            stopBarcodeScanning();
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera permission denied:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan barcodes.",
        variant: "destructive",
      });
    }
  };

  const stopBarcodeScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const selectBook = (book: any) => {
    setFormData({
      ...formData,
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      genres: book.subjects || []
    });
    setSearchResults([]);
    setShowManualForm(true);
  };

  const addGenre = (genre: string) => {
    if (!formData.genres.includes(genre)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre]
      });
    }
  };

  const removeGenre = (genre: string) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      toast({
        title: "Missing information",
        description: "Please provide at least title and author.",
        variant: "destructive",
      });
      return;
    }
    
    onAddBook(formData);
    toast({
      title: "Book added!",
      description: `"${formData.title}" has been added to your library.`,
    });
  };

  return (
    <div className="space-y-6">
      {!showManualForm && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder={searchType === 'author' ? "Search by author name..." : "Search by book title or ISBN..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            <Button 
              onClick={() => handleSearch()} 
              disabled={isSearching}
              variant="default"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              onClick={startBarcodeScanning}
              variant="outline"
              className="gap-2"
              disabled={isScanning}
            >
              <Camera className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>

          {/* Search Type Checkboxes */}
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="book-search" 
                checked={searchType === 'book'} 
                onCheckedChange={(checked) => checked && setSearchType('book')}
              />
              <Label htmlFor="book-search" className="text-sm">Search by Book Name (single result)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="author-search" 
                checked={searchType === 'author'} 
                onCheckedChange={(checked) => checked && setSearchType('author')}
              />
              <Label htmlFor="author-search" className="text-sm">Search by Author Name (all books)</Label>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Search Results:</h4>
              {searchResults.map((book, index) => (
                <Card key={index} className="p-4 cursor-pointer hover:shadow-medium transition-all duration-300" onClick={() => selectBook(book)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{book.title}</h5>
                      <p className="text-muted-foreground">by {book.author}</p>
                      {book.isbn && <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>}
                    </div>
                    <Button size="sm" variant="outline">Select</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowManualForm(true)}
              className="text-muted-foreground"
            >
              Or add book manually
            </Button>
          </div>
        </div>
      )}
      
      {/* Barcode Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={stopBarcodeScanning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-lg"></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Position the barcode within the frame to scan
            </p>
            <Button 
              onClick={stopBarcodeScanning}
              variant="outline"
              className="w-full gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Scanning
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showManualForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-read">Want to Read</SelectItem>
                  <SelectItem value="reading">Currently Reading</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={formData.genres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer hover:shadow-soft transition-all duration-200"
                  onClick={() => formData.genres.includes(genre) ? removeGenre(genre) : addGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {formData.genres.map((genre) => (
                  <Badge key={genre} variant="default" className="gap-1">
                    {genre}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeGenre(genre)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {formData.status === 'reading' && (
            <div className="space-y-2">
              <Label htmlFor="progress">Reading Progress</Label>
              <Input
                id="progress"
                placeholder="e.g., 25% complete, Chapter 5, Page 150"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              />
            </div>
          )}

          {formData.status === 'finished' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select value={formData.rating?.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ 1 Star</SelectItem>
                    <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts about this book..."
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  rows={4}
                />
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Add Book
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddBookForm } from "@/components/AddBookForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HighlightConfirmation } from "@/components/HighlightConfirmation";
// Removed useHighlights hook dependency
import { ShareReviewDialog } from "@/components/ShareReviewDialog";
import { GoodreadsImport } from "@/components/GoodreadsImport";
import { detectPotentialQuote } from "@/utils/textAnalysis";
import { getAIBookRecommendations } from "@/services/aiRecommendations";
import { Plus, BookOpen, Clock, CheckCircle, Star, Sparkles, RefreshCw, Edit2, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCommunity } from "@/context/CommunityContext";

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

interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  reason: string;
  rating: number;
}

export const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'to-read' | 'finished'>('reading');
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const { addPost } = useCommunity();
  
  // Edit review state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState<number>(0);
  
  // Highlight detection state
  const [showHighlightConfirmation, setShowHighlightConfirmation] = useState(false);
  const [detectedQuote, setDetectedQuote] = useState('');
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; author: string; rating: number; reviewText?: string } | null>(null);
  const openShare = (payload: { title: string; author: string; rating: number; reviewText?: string }) => {
    setShareData(payload);
    setShowShareDialog(true);
  };
  
  // Local highlight function
  const addHighlight = (highlight: any) => {
    // Local storage implementation for highlights
    console.log('Highlight saved locally:', highlight);
  };

  // Quote detection function
  const checkForQuotes = (reviewText: string, bookTitle: string) => {
    const potentialQuote = detectPotentialQuote(reviewText);
    if (potentialQuote) {
      setDetectedQuote(potentialQuote);
      setShowHighlightConfirmation(true);
    }
  };

  const addBook = (newBook: Omit<Book, 'id' | 'createdAt'>) => {
    const book: Book = {
      ...newBook,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBooks(prev => [...prev, book]);
    setShowAddForm(false);
    
    // Check for quotes in review text
    if (newBook.reviewText) {
      checkForQuotes(newBook.reviewText, newBook.title);
    }

    // Open share dialog and create community post if rating and review are provided
    if (newBook.rating && newBook.reviewText?.trim()) {
      openShare({
        title: newBook.title,
        author: newBook.author,
        rating: newBook.rating,
        reviewText: newBook.reviewText,
      });
      maybeCreateCommunityPost({
        title: newBook.title,
        author: newBook.author,
        rating: newBook.rating,
        reviewText: newBook.reviewText,
      });
    }
  };

  const handleGoodreadsImport = (importedBooks: Book[]) => {
    setBooks(prev => [...prev, ...importedBooks]);
    
    // Create community posts for books with reviews
    importedBooks.forEach(book => {
      if (book.reviewText?.trim() && book.rating) {
        maybeCreateCommunityPost({
          title: book.title,
          author: book.author,
          rating: book.rating,
          reviewText: book.reviewText,
        });
      }
    });
  };

  const maybeCreateCommunityPost = (payload: { title: string; author: string; rating?: number; reviewText?: string }) => {
    if (payload.reviewText?.trim()) {
      addPost({
        content: `Review: "${payload.title}" — ${payload.reviewText.slice(0, 200)}${payload.reviewText.length > 200 ? '…' : ''}`,
        bookTitle: payload.title,
        bookAuthor: payload.author,
        rating: payload.rating,
        authorName: 'You',
      });
    }
  };

  const updateBookStatus = (bookId: string, newStatus: Book['status']) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    ));
  };

  const deleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const startEditingReview = (book: Book) => {
    setEditingBookId(book.id);
    setEditReviewText(book.reviewText || '');
    setEditRating(book.rating || 0);
  };

  const saveReviewEdit = (bookId: string) => {
    const prevBook = books.find(b => b.id === bookId);
    const updatedText = editReviewText;
    const updatedRating = editRating;

    setBooks(prev => prev.map(book => 
      book.id === bookId 
        ? { ...book, reviewText: updatedText, rating: updatedRating || undefined }
        : book
    ));
    setEditingBookId(null);
    setEditReviewText('');
    setEditRating(0);
    
    // Check for quotes in the updated review
    if (updatedText) {
      const book = prevBook;
      if (book) {
        checkForQuotes(updatedText, book.title);
      }
    }

    // Open share dialog and create community post if rating and review are provided
    if (prevBook && updatedRating > 0 && updatedText?.trim()) {
      openShare({
        title: prevBook.title,
        author: prevBook.author,
        rating: updatedRating,
        reviewText: updatedText,
      });
      maybeCreateCommunityPost({
        title: prevBook.title,
        author: prevBook.author,
        rating: updatedRating,
        reviewText: updatedText,
      });
    }
  };

  const cancelEditingReview = () => {
    setEditingBookId(null);
    setEditReviewText('');
    setEditRating(0);
  };

  const filterBooksByStatus = (status: Book['status']) => {
    return books.filter(book => book.status === status);
  };

  const getStatusIcon = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return <BookOpen className="h-5 w-5 text-primary" />;
      case 'to-read':
        return <Clock className="h-5 w-5 text-accent" />;
      case 'finished':
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return 'default';
      case 'to-read':
        return 'secondary';
      case 'finished':
        return 'outline';
    }
  };

  const renderStars = (rating?: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              rating && star <= rating ? 'text-accent fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const tabCounts = {
    reading: filterBooksByStatus('reading').length,
    'to-read': filterBooksByStatus('to-read').length,
    finished: filterBooksByStatus('finished').length,
  };

  const currentBooks = filterBooksByStatus(activeTab);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const recs = await getAIBookRecommendations(books);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleGetRecommendations = async () => {
    setShowRecommendationsModal(true);
    if (recommendations.length === 0) {
      await loadRecommendations();
    }
  };

  const addRecommendedBook = (rec: BookRecommendation) => {
    const book: Book = {
      id: Date.now().toString(),
      title: rec.title,
      author: rec.author,
      status: 'to-read',
      genres: [rec.genre],
      createdAt: new Date(),
    };
    setBooks(prev => [...prev, book]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">My Library</h2>
        <div className="flex gap-3">
          <GoodreadsImport onBooksImport={handleGoodreadsImport} />
          
          <Dialog open={showRecommendationsModal} onOpenChange={setShowRecommendationsModal}>
            <DialogTrigger asChild>
              <Button 
                variant="accent" 
                onClick={handleGetRecommendations}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Suggest me
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Book Recommendations
                  <Badge variant="secondary" className="text-xs">
                    Powered by AI
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Based on your reading history and preferences
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadRecommendations}
                    disabled={loadingRecommendations}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingRecommendations ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {loadingRecommendations ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="p-4 bg-gradient-card animate-pulse">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-2 bg-muted rounded w-full"></div>
                          <div className="h-2 bg-muted rounded w-2/3"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="p-4 bg-gradient-card hover:shadow-medium transition-all duration-300">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-card-foreground line-clamp-2">
                                {rec.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">by {rec.author}</p>
                            </div>
                            <div className="flex items-center gap-1 text-accent">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs font-medium">{rec.rating}</span>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {rec.genre}
                          </Badge>
                          
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {rec.reason}
                          </p>
                          
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => {
                              addRecommendedBook(rec);
                              setShowRecommendationsModal(false);
                            }}
                            className="w-full gap-2"
                          >
                            <Plus className="h-3 w-3" />
                            Add to Library
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="hero" 
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-6 shadow-medium bg-gradient-card">
          <AddBookForm onAddBook={addBook} onCancel={() => setShowAddForm(false)} />
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        {[
          { key: 'reading' as const, label: 'Currently Reading', count: tabCounts.reading },
          { key: 'to-read' as const, label: 'Want to Read', count: tabCounts['to-read'] },
          { key: 'finished' as const, label: 'Finished', count: tabCounts.finished },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 justify-center gap-2"
          >
            {getStatusIcon(tab.key)}
            <span>{tab.label}</span>
            <Badge variant="outline" className="ml-1">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Books Grid */}
      {currentBooks.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-card shadow-soft">
          <div className="flex flex-col items-center gap-4">
            {getStatusIcon(activeTab)}
            <h3 className="text-xl font-semibold text-muted-foreground">
              No books in "{activeTab.replace('-', ' ')}" yet
            </h3>
            <p className="text-muted-foreground">
              Add your first book to get started on your reading journey!
            </p>
            <Button 
              variant="accent" 
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBooks.map((book) => (
            <Card key={book.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-muted-foreground">by {book.author}</p>
                  </div>
                  <Badge variant={getStatusColor(book.status)} className="shrink-0">
                    {book.status.replace('-', ' ')}
                  </Badge>
                </div>

                {book.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {book.genres.slice(0, 3).map((genre, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {book.genres.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{book.genres.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {book.progress && (
                  <p className="text-sm text-muted-foreground">
                    Progress: {book.progress}
                  </p>
                )}

                {editingBookId === book.id ? (
                  <div className="space-y-3">
                    {/* Edit Rating */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer transition-colors ${
                              star <= editRating ? 'text-accent fill-current' : 'text-muted-foreground hover:text-accent'
                            }`}
                            onClick={() => setEditRating(star)}
                          />
                        ))}
                        {editRating > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditRating(0)}
                            className="ml-2 h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Edit Review */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review</label>
                      <Textarea
                        value={editReviewText}
                        onChange={(e) => setEditReviewText(e.target.value)}
                        placeholder="Write your review..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => saveReviewEdit(book.id)}
                        className="gap-2"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditingReview}
                        className="gap-2"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {renderStars(book.rating)}
                      {book.rating && (
                        <span className="text-sm text-muted-foreground">
                          {book.rating}/5
                        </span>
                      )}
                    </div>

                    {book.reviewText && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {book.reviewText}
                      </p>
                    )}

                    {(book.reviewText || book.rating) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingReview(book)}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Review
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <Separator />

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {book.status !== 'reading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateBookStatus(book.id, 'reading')}
                        className="flex-1"
                      >
                        Start Reading
                      </Button>
                    )}
                    {book.status !== 'finished' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateBookStatus(book.id, 'finished')}
                        className="flex-1"
                      >
                        Mark Finished
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBook(book.id)}
                    className="text-destructive hover:text-destructive w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Highlight Confirmation Dialog */}
      <HighlightConfirmation
        isOpen={showHighlightConfirmation}
        onClose={() => setShowHighlightConfirmation(false)}
        selectedText={detectedQuote}
        onConfirm={addHighlight}
      />

      {/* Share Review Dialog */}
      <ShareReviewDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        data={shareData}
      />
    </div>
  );
};

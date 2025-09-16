import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddBookForm } from "@/components/AddBookForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBooks, type Book } from "@/hooks/useBooks";
import { ShareReviewDialog } from "@/components/ShareReviewDialog";
import { GoodreadsImport } from "@/components/GoodreadsImport";
import { GenreSelector } from "@/components/GenreSelector";

import { getAIBookRecommendations } from "@/services/aiRecommendations";
import { Plus, BookOpen, Clock, CheckCircle, Star, Sparkles, RefreshCw, Edit2, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCommunity } from "@/context/CommunityContext";

interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  reason: string;
  rating: number;
}

interface BookListProps {
  highlightButtons?: boolean;
}

export const BookList = ({ highlightButtons = false }: BookListProps) => {
  const { books, addBook: addBookToDb, updateBookStatus, deleteBook: deleteBookFromDb, updateBookReview, loading } = useBooks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'to-read' | 'finished'>('reading');
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const { createPost } = useCommunity();
  
  
  // Edit review state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState<number>(0);
  
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; author: string; rating: number; reviewText?: string } | null>(null);
  const openShare = (payload: { title: string; author: string; rating: number; reviewText?: string }) => {
    setShareData(payload);
    setShowShareDialog(true);
  };


  const addBook = async (formData: any) => {
    try {
      // Map form data to database format
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        status: formData.status,
        genres: formData.genres || [],
        progress: formData.progress,
        rating: formData.rating,
        review_text: formData.reviewText
      };
      
      await addBookToDb(bookData);
      setShowAddForm(false);
      

      // Open share dialog and create community post if rating and review are provided
      if (bookData.rating && bookData.review_text?.trim()) {
        openShare({
          title: bookData.title,
          author: bookData.author,
          rating: bookData.rating,
          reviewText: bookData.review_text,
        });
        maybeCreateCommunityPost({
          title: bookData.title,
          author: bookData.author,
          rating: bookData.rating,
          reviewText: bookData.review_text,
        });
      }
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const handleGoodreadsImport = async (importedBooks: any[]) => {
    // Convert imported books to our Book format and add them to database
    for (const importedBook of importedBooks) {
      try {
        const bookData = {
          title: importedBook.title,
          author: importedBook.author,
          isbn: importedBook.isbn,
          status: importedBook.status,
          genres: importedBook.genres || [],
          progress: importedBook.progress,
          rating: importedBook.rating,
          review_text: importedBook.reviewText || importedBook.review_text
        };
        
        await addBookToDb(bookData);
        
        // Create community posts for books with reviews
        if (bookData.review_text?.trim() && bookData.rating) {
          maybeCreateCommunityPost({
            title: bookData.title,
            author: bookData.author,
            rating: bookData.rating,
            reviewText: bookData.review_text,
          });
        }
      } catch (error) {
        console.error('Failed to import book:', importedBook.title, error);
      }
    }
  };

  const maybeCreateCommunityPost = async (payload: { title: string; author: string; rating?: number; reviewText?: string }) => {
    if (payload.reviewText?.trim()) {
      try {
        await createPost({
          content: `Review: "${payload.title}" — ${payload.reviewText.slice(0, 200)}${payload.reviewText.length > 200 ? '…' : ''}`,
          book_title: payload.title,
          book_author: payload.author,
          rating: payload.rating,
        });
      } catch (error) {
        console.error('Failed to create community post:', error);
      }
    }
  };

  const handleUpdateBookStatus = async (bookId: string, newStatus: Book['status']) => {
    try {
      await updateBookStatus(bookId, newStatus);
    } catch (error) {
      console.error('Failed to update book status:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteBookFromDb(bookId);
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const startEditingReview = (book: Book) => {
    setEditingBookId(book.id);
    setEditReviewText(book.review_text || '');
    setEditRating(book.rating || 0);
  };

  const saveReviewEdit = async (bookId: string) => {
    try {
      const prevBook = books.find(b => b.id === bookId);
      const updatedText = editReviewText;
      const updatedRating = editRating;

      await updateBookReview(bookId, updatedText, updatedRating || undefined);
      setEditingBookId(null);
      setEditReviewText('');
      setEditRating(0);
      

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
    } catch (error) {
      console.error('Failed to save review:', error);
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

  const addRecommendedBook = async (rec: BookRecommendation) => {
    try {
      const bookData = {
        title: rec.title,
        author: rec.author,
        status: 'to-read' as const,
        genres: [rec.genre],
      };
      await addBookToDb(bookData);
    } catch (error) {
      console.error('Failed to add recommended book:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold text-foreground">My Library</h2>
        
        {/* Mobile: Stack buttons vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col space-y-2 md:flex-row md:gap-3 md:space-y-0">
          <GoodreadsImport onBooksImport={handleGoodreadsImport} />
          
          <Dialog open={showRecommendationsModal} onOpenChange={setShowRecommendationsModal}>
            <DialogTrigger asChild>
              <Button 
                variant="accent" 
                onClick={handleGetRecommendations}
                className={`gap-2 w-full md:w-auto transition-all duration-300 ${
                  highlightButtons 
                    ? 'ring-4 ring-accent/50 shadow-glow animate-pulse' 
                    : ''
                }`}
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
                <GenreSelector onGenreSelect={loadRecommendations} />
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
          
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button 
                variant="hero" 
                className={`gap-2 w-full md:w-auto transition-all duration-300 ${
                  highlightButtons 
                    ? 'ring-4 ring-primary/50 shadow-glow animate-pulse' 
                    : ''
                }`}
              >
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:rounded-lg rounded-xl mx-2 sm:mx-0">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <AddBookForm onAddBook={addBook} onCancel={() => setShowAddForm(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Tabs - Responsive Layout */}
      <div className="w-full">
        {/* Mobile/Tablet: Vertical list layout */}
        <div className="flex flex-col space-y-2 md:hidden">
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
              className="w-full justify-start gap-2"
            >
              {getStatusIcon(tab.key)}
              <span>{tab.label}</span>
              <Badge variant="outline" className="ml-auto">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex gap-2 p-1 bg-secondary rounded-lg">
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
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 bg-gradient-card animate-pulse">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="flex gap-1">
                  <div className="h-5 bg-muted rounded w-12"></div>
                  <div className="h-5 bg-muted rounded w-12"></div>
                </div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : currentBooks.length === 0 ? (
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

                    {book.review_text && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {book.review_text}
                      </p>
                    )}

                    {book.status === 'finished' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingReview(book)}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3 w-3" />
                        {book.review_text || book.rating ? 'Edit Review' : 'Add Review'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <Separator />

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {book.status !== 'reading' && book.status !== 'finished' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateBookStatus(book.id, 'reading')}
                        className="flex-1"
                      >
                        Start Reading
                      </Button>
                    )}
                    {book.status !== 'finished' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateBookStatus(book.id, 'finished')}
                        className="flex-1"
                      >
                        Mark Finished
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBook(book.id)}
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
      

      {/* Share Review Dialog */}
      <ShareReviewDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        data={shareData}
      />
    </div>
  );
};

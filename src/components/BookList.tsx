import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddBookForm } from "@/components/AddBookForm";
import { Plus, BookOpen, Clock, CheckCircle, Star } from "lucide-react";

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

export const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'to-read' | 'finished'>('reading');

  const addBook = (newBook: Omit<Book, 'id' | 'createdAt'>) => {
    const book: Book = {
      ...newBook,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBooks(prev => [...prev, book]);
    setShowAddForm(false);
  };

  const updateBookStatus = (bookId: string, newStatus: Book['status']) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    ));
  };

  const deleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
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
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-accent fill-current' : 'text-muted-foreground'
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">My Library</h2>
        <Button 
          variant="hero" 
          onClick={() => setShowAddForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
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
            <Card key={book.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
              <div className="space-y-4">
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

                {book.rating && (
                  <div className="flex items-center gap-2">
                    {renderStars(book.rating)}
                    <span className="text-sm text-muted-foreground">
                      {book.rating}/5
                    </span>
                  </div>
                )}

                {book.reviewText && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {book.reviewText}
                  </p>
                )}

                <Separator />

                <div className="flex gap-2">
                  {book.status !== 'reading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBookStatus(book.id, 'reading')}
                    >
                      Start Reading
                    </Button>
                  )}
                  {book.status !== 'finished' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBookStatus(book.id, 'finished')}
                    >
                      Mark Finished
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBook(book.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
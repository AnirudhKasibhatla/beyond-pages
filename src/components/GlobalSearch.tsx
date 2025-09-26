import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Microscope, X, Book, User, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  id: string;
  type: 'book' | 'author' | 'reader';
  title: string;
  subtitle?: string;
  metadata?: string;
  user_id?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !user) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search books
      const { data: books } = await supabase
        .from('books')
        .select('id, title, author, genres, status, user_id')
        .or(`title.ilike.%${searchQuery}%, author.ilike.%${searchQuery}%`)
        .limit(10);

      if (books) {
        books.forEach(book => {
          // Add book as result
          searchResults.push({
            id: `book-${book.id}`,
            type: 'book',
            title: book.title,
            subtitle: `by ${book.author}`,
            metadata: book.status,
            user_id: book.user_id
          });

          // Add author as separate result if not already added
          if (!searchResults.some(r => r.type === 'author' && r.title === book.author)) {
            searchResults.push({
              id: `author-${book.author}`,
              type: 'author',
              title: book.author,
              subtitle: 'Author',
              metadata: `${books.filter(b => b.author === book.author).length} book(s)`
            });
          }
        });
      }

      // Search readers (profiles) - only safe fields for public access
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, name, user_id')
        .or(`username.ilike.%${searchQuery}%, display_name.ilike.%${searchQuery}%, name.ilike.%${searchQuery}%`)
        .limit(10);

      if (profiles) {
        profiles.forEach(profile => {
          const name = profile.display_name || 
                      profile.name || 
                      profile.username ||
                      'Anonymous Reader';
          
          searchResults.push({
            id: `reader-${profile.id}`,
            type: 'reader',
            title: name,
            subtitle: 'Reader',
            user_id: profile.user_id
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4" />;
      case 'author':
        return <Users className="h-4 w-4" />;
      case 'reader':
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'author':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'reader':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="max-w-2xl mx-auto w-full">
          {/* Search Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Microscope className="h-6 w-6" />
              <span className="text-lg font-medium">Search</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              placeholder="Search for books, authors, or readers..."
              className="pl-10 h-12 text-lg bg-card border-border"
            />
          </div>

          {/* Search Results */}
          <Card className="p-4 max-h-96 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {result.title}
                          </p>
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${getResultBadgeColor(result.type)}`}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                        {result.metadata && (
                          <p className="text-xs text-muted-foreground">
                            {result.metadata}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Microscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start typing to search for books, authors, and readers</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
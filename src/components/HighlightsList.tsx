import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHighlights, Highlight } from '@/hooks/useHighlights';
import { Quote, BookOpen, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const HighlightsList = () => {
  const { highlights, loading, deleteHighlight } = useHighlights();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-card">
        <div className="flex flex-col items-center gap-4">
          <Quote className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No highlights yet
            </h3>
            <p className="text-muted-foreground">
              When you write reviews with book quotes, you'll be able to add them to your highlights collection.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Quote className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">My Highlights</h3>
        <Badge variant="secondary" className="ml-2">
          {highlights.length}
        </Badge>
      </div>
      
      {highlights.map((highlight) => (
        <Card key={highlight.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <blockquote className="border-l-4 border-primary pl-4 italic text-card-foreground">
                  "{highlight.quote_text}"
                </blockquote>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteHighlight(highlight.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{highlight.book_title}</span>
              </div>
              
              {highlight.book_author && (
                <span>by {highlight.book_author}</span>
              )}
              
              {highlight.page_number && (
                <Badge variant="outline" className="text-xs">
                  Page {highlight.page_number}
                </Badge>
              )}
              
              <div className="flex items-center gap-1 ml-auto">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  {format(new Date(highlight.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Quote, BookOpen, Trash2, Calendar, Share2, Copy, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CommunityHighlights } from '@/components/CommunityHighlights';
import { useHighlights } from '@/hooks/useHighlights';
import { AddHighlightDialog } from '@/components/AddHighlightDialog';

interface Highlight {
  id: string;
  quote_text: string;
  book_title: string;
  book_author?: string;
  page_number?: string;
  created_at: string;
}

export const HighlightsList = () => {
  const { highlights, loading, addHighlight, deleteHighlight } = useHighlights();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const handleShare = async (highlight: Highlight) => {
    try {
      const shareText = `"${highlight.quote_text}" - from ${highlight.book_title}${highlight.book_author ? ` by ${highlight.book_author}` : ''}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Highlight from ${highlight.book_title}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "The highlight has been copied to your clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Could not share highlight",
        variant: "destructive",
      });
    }
  };

  const handleCopyQuote = async (quote: string) => {
    try {
      await navigator.clipboard.writeText(quote);
      toast({
        title: "Copied!",
        description: "Quote copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy quote",
        variant: "destructive",
      });
    }
  };

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
    <>
      <Tabs defaultValue="my-highlights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-highlights" className="flex items-center gap-2">
            <Quote className="h-4 w-4" />
            My Highlights
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-highlights" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">My Highlights</h3>
                <Badge variant="secondary" className="ml-2">
                  {highlights.length}
                </Badge>
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Quote
              </Button>
            </div>
            
            {highlights.length === 0 ? (
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
            ) : (
              highlights.map((highlight) => (
                <Card key={highlight.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 relative">
                        <blockquote className="border-l-4 border-primary pl-4 italic text-card-foreground">
                          "{highlight.quote_text}"
                        </blockquote>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyQuote(highlight.quote_text)}
                          className="absolute top-0 right-0 text-muted-foreground hover:text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(highlight)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHighlight(highlight.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="community" className="mt-6">
          <CommunityHighlights />
        </TabsContent>
      </Tabs>

      <AddHighlightDialog 
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onConfirm={addHighlight}
      />
    </>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trophy, Calendar, BookOpen, Star, MessageSquare } from "lucide-react";

interface Challenge {
  year: number;
  goal: number;
  completed: number;
  status: 'completed' | 'in-progress' | 'failed';
  bestMonth: string;
  favoriteGenre: string;
  books: string[];
  reviews: string[];
}

const mockChallenges: Challenge[] = [
  {
    year: 2025,
    goal: 25,
    completed: 0,
    status: 'in-progress',
    bestMonth: 'No data',
    favoriteGenre: 'No data',
    books: [],
    reviews: []
  }
];

export const ReadingChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [viewMode, setViewMode] = useState<'books' | 'reviews'>('books');

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleBackClick = () => {
    setSelectedChallenge(null);
  };

  if (selectedChallenge) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Challenges
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {selectedChallenge.year} Reading Challenge
          </h1>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {selectedChallenge.completed}/{selectedChallenge.goal}
              </div>
              <div className="text-sm text-muted-foreground">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round((selectedChallenge.completed / selectedChallenge.goal) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Achievement Rate</div>
            </div>
            <div className="text-center">
              <Badge 
                variant={selectedChallenge.status === 'completed' ? 'default' : 
                        selectedChallenge.status === 'in-progress' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {selectedChallenge.status === 'completed' && <Trophy className="h-3 w-3 mr-1" />}
                {selectedChallenge.status.charAt(0).toUpperCase() + selectedChallenge.status.slice(1)}
              </Badge>
            </div>
          </div>

          <Progress 
            value={(selectedChallenge.completed / selectedChallenge.goal) * 100} 
            className="h-3 mb-6" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Month</span>
              <span className="font-medium">{selectedChallenge.bestMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Favorite Genre</span>
              <span className="font-medium">{selectedChallenge.favoriteGenre}</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'books' ? 'default' : 'outline'}
            onClick={() => setViewMode('books')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Books ({selectedChallenge.books.length})
          </Button>
          <Button
            variant={viewMode === 'reviews' ? 'default' : 'outline'}
            onClick={() => setViewMode('reviews')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Reviews ({selectedChallenge.reviews.length})
          </Button>
        </div>

        {viewMode === 'books' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Books Read in {selectedChallenge.year}
              </CardTitle>
              <CardDescription>
                All {selectedChallenge.books.length} books you completed this year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedChallenge.books.map((book, index) => (
                  <Card key={index} className="p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">{book}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reviews from {selectedChallenge.year}
              </CardTitle>
              <CardDescription>
                All {selectedChallenge.reviews.length} reviews you wrote this year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedChallenge.reviews.map((review, index) => (
                  <Card key={index} className="p-4 hover:shadow-soft transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{review}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reading Challenges</h1>
        <p className="text-muted-foreground">
          Track your yearly reading goals and explore your reading journey through the years
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockChallenges.map((challenge) => (
          <Card 
            key={challenge.year}
            className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-medium ${
              challenge.status === 'in-progress' ? 'bg-gradient-primary text-primary-foreground' :
              challenge.status === 'completed' ? 'bg-gradient-card' : 'bg-muted/50'
            }`}
            onClick={() => handleChallengeClick(challenge)}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{challenge.year}</h3>
                <Badge 
                  variant={challenge.status === 'completed' ? 'default' : 
                          challenge.status === 'in-progress' ? 'secondary' : 'outline'}
                  className={challenge.status === 'in-progress' ? 'bg-white/20 text-white' : ''}
                >
                  {challenge.status === 'completed' && <Trophy className="h-3 w-3 mr-1" />}
                  {challenge.status === 'in-progress' && <Calendar className="h-3 w-3 mr-1" />}
                  {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={challenge.status === 'in-progress' ? 'text-white/90' : 'text-muted-foreground'}>
                    Progress
                  </span>
                  <span className="font-semibold">
                    {challenge.completed}/{challenge.goal} books
                  </span>
                </div>
                <Progress 
                  value={(challenge.completed / challenge.goal) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={challenge.status === 'in-progress' ? 'text-white/90' : 'text-muted-foreground'}>
                    Achievement Rate
                  </span>
                  <span className="font-medium">
                    {Math.round((challenge.completed / challenge.goal) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={challenge.status === 'in-progress' ? 'text-white/90' : 'text-muted-foreground'}>
                    Best Month
                  </span>
                  <span className="font-medium">{challenge.bestMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className={challenge.status === 'in-progress' ? 'text-white/90' : 'text-muted-foreground'}>
                    Favorite Genre
                  </span>
                  <span className="font-medium">{challenge.favoriteGenre}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-current/20">
                <p className={`text-xs ${challenge.status === 'in-progress' ? 'text-white/80' : 'text-muted-foreground'}`}>
                  Click to view books and reviews
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
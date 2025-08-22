import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface GenreSelectorProps {
  onGenreSelect: (genre?: string) => void;
}

const genres = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Thriller",
  "Historical Fiction",
  "Literary Fiction",
  "Non-fiction",
  "Biography",
  "Self-help",
  "Horror",
  "Adventure",
  "Young Adult",
  "Children's",
  "Poetry",
  "Philosophy",
  "Psychology",
  "Business",
  "Health & Fitness",
  "Travel"
];

export const GenreSelector = ({ onGenreSelect }: GenreSelectorProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleGetSuggestions = () => {
    onGenreSelect(selectedGenre || undefined);
  };

  return (
    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Choose a Genre</h3>
      </div>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Select value={selectedGenre} onValueChange={handleGenreSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a genre for recommendations" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleGetSuggestions}
          variant="accent"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Get Suggestions
        </Button>
      </div>
      {selectedGenre && (
        <p className="text-sm text-muted-foreground">
          Finding recommendations for <span className="font-medium text-foreground">{selectedGenre}</span> books...
        </p>
      )}
    </div>
  );
};
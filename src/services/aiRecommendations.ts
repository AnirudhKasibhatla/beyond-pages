interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  status: 'to-read' | 'reading' | 'finished';
}

interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  reason: string;
  rating: number;
}

export const getAIBookRecommendations = async (
  userBooks: Book[],
  preferredGenres?: string[]
): Promise<BookRecommendation[]> => {
  try {
    // Analyze user's reading patterns
    const finishedBooks = userBooks.filter(book => book.status === 'finished');
    const allGenres = userBooks.flatMap(book => book.genres);
    const genreFrequency = allGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topGenres = Object.entries(genreFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    const favoriteAuthors = finishedBooks.map(book => book.author).slice(0, 3);
    
    // Create prompt for AI
    const prompt = `You are a book recommendation expert. Based on a user's reading history, suggest 5 books they might enjoy.

User's reading patterns:
- Favorite genres: ${topGenres.join(', ') || 'No specific genres yet'}
- Recently read books: ${finishedBooks.slice(-3).map(book => `"${book.title}" by ${book.author}`).join(', ') || 'No books finished yet'}
- Favorite authors: ${favoriteAuthors.join(', ') || 'No favorite authors yet'}

Please suggest 5 diverse book recommendations that match their interests. For each book, provide:
1. Title
2. Author  
3. Primary genre
4. Brief reason why they'd like it (one sentence)
5. Estimated rating appeal (1-5 scale)

Format as JSON array:
[
  {
    "title": "Book Title",
    "author": "Author Name", 
    "genre": "Genre",
    "reason": "Why they'd like it",
    "rating": 4.5
  }
]

Make sure all recommendations are real published books. If the user has no reading history, suggest popular books across various genres.`;

    // In a real implementation, this would call an actual AI API like OpenAI or Gemini
    // For now, we'll simulate with intelligent mock data based on user's preferences
    const mockRecommendations = generateIntelligentMockRecommendations(topGenres, favoriteAuthors, finishedBooks);
    
    return mockRecommendations;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return generateFallbackRecommendations();
  }
};

const generateIntelligentMockRecommendations = (
  topGenres: string[],
  favoriteAuthors: string[],
  finishedBooks: Book[]
): BookRecommendation[] => {
  const genreBasedRecommendations: Record<string, BookRecommendation[]> = {
    'Fiction': [
      { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", genre: "Contemporary Fiction", reason: "A captivating story about love, ambition, and the price of fame that will keep you reading until dawn.", rating: 4.6 },
      { title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Literary Fiction", reason: "A beautiful coming-of-age story set in the marshlands with mystery and nature at its heart.", rating: 4.4 },
    ],
    'Fantasy': [
      { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Epic Fantasy", reason: "Masterful storytelling with rich world-building and a compelling magic system.", rating: 4.7 },
      { title: "The Priory of the Orange Tree", author: "Samantha Shannon", genre: "High Fantasy", reason: "An epic standalone fantasy with dragons, strong female characters, and intricate plotting.", rating: 4.5 },
    ],
    'Mystery': [
      { title: "The Thursday Murder Club", author: "Richard Osman", genre: "Cozy Mystery", reason: "Charming mystery featuring elderly sleuths with wit, humor, and surprising depth.", rating: 4.3 },
      { title: "Gone Girl", author: "Gillian Flynn", genre: "Psychological Thriller", reason: "A twisted psychological thriller that will make you question everything you think you know.", rating: 4.2 },
    ],
    'Thriller': [
      { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Crime Thriller", reason: "Based on your thriller preferences, this dark Swedish crime novel with complex characters will grip you.", rating: 4.4 },
      { title: "In the Woods", author: "Tana French", genre: "Psychological Thriller", reason: "Atmospheric psychological thriller with beautiful prose and haunting mystery elements.", rating: 4.2 },
      { title: "The Silent Companion", author: "Laura Purcell", genre: "Gothic Thriller", reason: "Given your thriller interests, this Victorian gothic tale combines psychological suspense with supernatural elements.", rating: 4.1 },
    ],
    'Romance': [
      { title: "Beach Read", author: "Emily Henry", genre: "Contemporary Romance", reason: "Perfect blend of humor, heart, and emotional depth with enemies-to-lovers charm.", rating: 4.5 },
      { title: "The Hating Game", author: "Sally Thorne", genre: "Workplace Romance", reason: "Witty banter and electric chemistry in this addictive office romance.", rating: 4.3 },
    ],
    'Science Fiction': [
      { title: "Klara and the Sun", author: "Kazuo Ishiguro", genre: "Literary Sci-Fi", reason: "A thoughtful exploration of AI consciousness and human connection from a Nobel laureate.", rating: 4.2 },
      { title: "Project Hail Mary", author: "Andy Weir", genre: "Hard Sci-Fi", reason: "A thrilling space adventure with humor, heart, and fascinating scientific concepts.", rating: 4.7 },
    ],
  };

  const defaultRecommendations: BookRecommendation[] = [
    { title: "Educated", author: "Tara Westover", genre: "Memoir", reason: "A powerful memoir about education, family, and finding your own path that will stay with you long after reading.", rating: 4.8 },
    { title: "The Midnight Library", author: "Matt Haig", genre: "Philosophical Fiction", reason: "A thought-provoking exploration of life's infinite possibilities that's both uplifting and profound.", rating: 4.4 },
    { title: "Circe", author: "Madeline Miller", genre: "Mythology", reason: "Beautiful retelling of Greek mythology with lyrical prose and a powerful female protagonist.", rating: 4.6 },
    { title: "The Silent Patient", author: "Alex Michaelides", genre: "Psychological Thriller", reason: "A gripping psychological thriller with an ending that will completely shock you.", rating: 4.3 },
    { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", reason: "Practical strategies for building good habits and breaking bad ones that actually work.", rating: 4.7 },
  ];

  if (topGenres.length === 0) {
    return defaultRecommendations;
  }

  const recommendations: BookRecommendation[] = [];
  
  // Get recommendations based on user's top genres
  for (const genre of topGenres.slice(0, 3)) {
    const genreRecs = genreBasedRecommendations[genre] || [];
    if (genreRecs.length > 0) {
      recommendations.push(genreRecs[Math.floor(Math.random() * genreRecs.length)]);
    }
  }

  // Fill remaining slots with diverse recommendations
  while (recommendations.length < 5) {
    const randomRec = defaultRecommendations[Math.floor(Math.random() * defaultRecommendations.length)];
    if (!recommendations.find(rec => rec.title === randomRec.title)) {
      recommendations.push(randomRec);
    }
  }

  return recommendations.slice(0, 5);
};

const generateFallbackRecommendations = (): BookRecommendation[] => [
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", genre: "Contemporary Fiction", reason: "A captivating story about love, ambition, and the price of fame.", rating: 4.6 },
  { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", reason: "Practical strategies for building good habits that actually work.", rating: 4.7 },
  { title: "The Midnight Library", author: "Matt Haig", genre: "Philosophical Fiction", reason: "A thought-provoking exploration of life's infinite possibilities.", rating: 4.4 },
  { title: "Project Hail Mary", author: "Andy Weir", genre: "Hard Sci-Fi", reason: "A thrilling space adventure with humor and fascinating science.", rating: 4.7 },
  { title: "Circe", author: "Madeline Miller", genre: "Mythology", reason: "Beautiful retelling of Greek mythology with lyrical prose.", rating: 4.6 },
];
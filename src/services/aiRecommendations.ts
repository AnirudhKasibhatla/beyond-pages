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

// Track rotation state for refresh functionality
let rotationIndex = 0;

export const getAIBookRecommendations = async (
  userBooks: Book[],
  preferredGenres?: string[]
): Promise<BookRecommendation[]> => {
  try {
    // Increment rotation index for refresh functionality
    rotationIndex = (rotationIndex + 1) % 3;
    
    // Analyze user's reading patterns
    const finishedBooks = userBooks.filter(book => book.status === 'finished');
    const allUserBooks = userBooks; // Include all books for exclusion
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
    
    // In a real implementation, this would call an actual AI API like OpenAI or Gemini
    // For now, we'll simulate with intelligent mock data based on user's preferences
    const mockRecommendations = generateIntelligentMockRecommendations(topGenres, favoriteAuthors, allUserBooks);
    
    return mockRecommendations;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return generateFallbackRecommendations();
  }
};

const generateIntelligentMockRecommendations = (
  topGenres: string[],
  favoriteAuthors: string[],
  allUserBooks: Book[]
): BookRecommendation[] => {
  
  // Classics collection as requested by user
  const classicsCollection: BookRecommendation[] = [
    { title: "1984", author: "George Orwell", genre: "Dystopian Fiction", reason: "A timeless masterpiece exploring surveillance, truth, and individual freedom in a totalitarian society.", rating: 4.8 },
    { title: "Animal Farm", author: "George Orwell", genre: "Political Satire", reason: "A brilliant allegorical tale about power, corruption, and revolution that remains deeply relevant.", rating: 4.6 },
    { title: "Wuthering Heights", author: "Emily Brontë", genre: "Gothic Romance", reason: "A passionate and dark tale of obsessive love and revenge set on the Yorkshire moors.", rating: 4.3 },
    { title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", reason: "Witty social commentary and one of literature's greatest love stories with unforgettable characters.", rating: 4.7 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Literary Fiction", reason: "A powerful exploration of justice, morality, and growing up in the American South.", rating: 4.8 },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Literary Fiction", reason: "A stunning portrayal of the American Dream and the decadence of the Jazz Age.", rating: 4.5 },
    { title: "Jane Eyre", author: "Charlotte Brontë", genre: "Gothic Romance", reason: "A compelling story of an independent woman's journey through love, loss, and self-discovery.", rating: 4.4 },
    { title: "Lord of the Flies", author: "William Golding", genre: "Dystopian Fiction", reason: "A gripping exploration of human nature when civilization breaks down.", rating: 4.2 },
  ];
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

  // Get titles of books the user already has (to exclude from recommendations)
  const userBookTitles = allUserBooks.map(book => book.title.toLowerCase());
  
  // Filter function to exclude books user already has
  const filterExcludeUserBooks = (recommendations: BookRecommendation[]): BookRecommendation[] => {
    return recommendations.filter(rec => !userBookTitles.includes(rec.title.toLowerCase()));
  };

  if (topGenres.length === 0) {
    // If no genres, mix classics with defaults, rotating based on refresh
    let combinedRecs = [...filterExcludeUserBooks(classicsCollection), ...filterExcludeUserBooks(defaultRecommendations)];
    
    // Rotate the selection based on rotationIndex
    const startIndex = rotationIndex * 2;
    combinedRecs = [...combinedRecs.slice(startIndex), ...combinedRecs.slice(0, startIndex)];
    
    return combinedRecs.slice(0, 5);
  }

  const recommendations: BookRecommendation[] = [];
  
  // Always include at least 1-2 classics if user hasn't read them
  const availableClassics = filterExcludeUserBooks(classicsCollection);
  if (availableClassics.length > 0) {
    const classicCount = Math.min(2, availableClassics.length);
    for (let i = 0; i < classicCount; i++) {
      const index = (rotationIndex + i) % availableClassics.length;
      recommendations.push(availableClassics[index]);
    }
  }
  
  // Get recommendations based on user's top genres (excluding user books)
  for (const genre of topGenres.slice(0, 2)) {
    const genreRecs = filterExcludeUserBooks(genreBasedRecommendations[genre] || []);
    if (genreRecs.length > 0 && recommendations.length < 5) {
      const rotatedIndex = (rotationIndex + recommendations.length) % genreRecs.length;
      const selectedRec = genreRecs[rotatedIndex];
      if (!recommendations.find(rec => rec.title === selectedRec.title)) {
        recommendations.push(selectedRec);
      }
    }
  }

  // Fill remaining slots with diverse recommendations (excluding user books)
  const availableDefaults = filterExcludeUserBooks(defaultRecommendations);
  while (recommendations.length < 5 && availableDefaults.length > 0) {
    const rotatedIndex = (rotationIndex + recommendations.length) % availableDefaults.length;
    const randomRec = availableDefaults[rotatedIndex];
    if (!recommendations.find(rec => rec.title === randomRec.title)) {
      recommendations.push(randomRec);
    } else {
      // If we hit a duplicate, try next in rotation
      const nextIndex = (rotatedIndex + 1) % availableDefaults.length;
      const nextRec = availableDefaults[nextIndex];
      if (!recommendations.find(rec => rec.title === nextRec.title)) {
        recommendations.push(nextRec);
      }
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
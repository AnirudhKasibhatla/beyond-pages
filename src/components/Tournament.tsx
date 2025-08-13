import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Crown, Target, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TournamentParticipant {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  league: string;
  status: 'active' | 'promoted' | 'eliminated';
}

export const Tournament = () => {
  const [currentSeason, setCurrentSeason] = useState(3);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([
    { id: '1', name: 'Sarah Chen', xp: 340, level: 15, rank: 1, league: 'Gold', status: 'active' },
    { id: '2', name: 'Marcus Rodriguez', xp: 315, level: 14, rank: 2, league: 'Gold', status: 'active' },
    { id: '3', name: 'Emily Watson', xp: 298, level: 13, rank: 3, league: 'Silver', status: 'active' },
    { id: '4', name: 'You', xp: 125, level: 3, rank: 12, league: 'Copper', status: 'active' },
    { id: '5', name: 'Alex Johnson', xp: 280, level: 12, rank: 4, league: 'Silver', status: 'active' },
    { id: '6', name: 'Lisa Park', xp: 265, level: 11, rank: 5, league: 'Silver', status: 'active' },
    { id: '7', name: 'David Kim', xp: 250, level: 10, rank: 6, league: 'Silver', status: 'active' },
    { id: '8', name: 'Rachel Green', xp: 235, level: 9, rank: 7, league: 'Silver', status: 'active' },
  ]);

  const [eliminatedPlayers] = useState<TournamentParticipant[]>([
    { id: 'e1', name: 'Tom Wilson', xp: 85, level: 2, rank: 15, league: 'Copper', status: 'eliminated' },
    { id: 'e2', name: 'Anna Brown', xp: 70, level: 2, rank: 16, league: 'Copper', status: 'eliminated' },
    { id: 'e3', name: 'Mike Davis', xp: 65, level: 1, rank: 17, league: 'Copper', status: 'eliminated' },
  ]);

  const { toast } = useToast();

  const getLeagueColor = (league: string) => {
    switch (league.toLowerCase()) {
      case 'platinum': return 'bg-slate-300 text-slate-800';
      case 'diamond': return 'bg-blue-400 text-blue-900';
      case 'gold': return 'bg-yellow-400 text-yellow-900';
      case 'silver': return 'bg-gray-300 text-gray-800';
      case 'copper': return 'bg-orange-400 text-orange-900';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <Trophy className="h-4 w-4 text-muted-foreground" />;
  };

  const simulateWeeklyReset = () => {
    // Simulate tournament reset logic
    const newParticipants = participants.map(p => ({
      ...p,
      xp: Math.floor(p.xp * 0.1), // Reset XP but keep some bonus
    }));

    // Award bonus XP to top 3
    newParticipants.slice(0, 3).forEach((p, index) => {
      const bonusXP = [50, 30, 20][index]; // Different bonus for top 3
      p.xp += bonusXP;
      if (index === 0) p.level += 1; // Winner gets level up
    });

    setParticipants(newParticipants);
    setCurrentSeason(prev => prev + 1);
    
    toast({
      title: "Weekly Tournament Reset!",
      description: `Season ${currentSeason + 1} has begun. Top performers received bonus XP!`,
    });
  };

  const getCurrentUserRank = () => {
    const userParticipant = participants.find(p => p.name === 'You');
    return userParticipant?.rank || 0;
  };

  const getPerformanceMessage = () => {
    const rank = getCurrentUserRank();
    if (rank <= 3) return "🏆 Amazing performance! You're in the top 3!";
    if (rank <= 6) return "📈 Great progress! Keep climbing the leaderboard!";
    if (rank <= 10) return "🎯 You're doing well! Push for the top 10!";
    return "💪 Keep reading and engaging to climb the rankings!";
  };

  // Calculate time until next reset (simulated)
  const getTimeUntilReset = () => {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
    nextReset.setHours(23, 59, 59, 999);
    
    const diff = nextReset.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold text-foreground">Weekly Tournament</h2>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-4 md:space-y-0">
          <Badge variant="default" className="text-sm px-4 py-2 w-fit">
            Season {currentSeason}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateWeeklyReset}
            className="gap-2 w-full md:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Simulate Reset</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>
      </div>

      {/* Tournament Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-hero text-primary-foreground shadow-medium">
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Your Rank</h3>
            <p className="text-2xl font-bold">#{getCurrentUserRank()}</p>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-accent text-accent-foreground shadow-medium">
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Time Left</h3>
            <p className="text-2xl font-bold">{getTimeUntilReset()}</p>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-card shadow-medium">
          <div className="text-center">
            <Medal className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1 text-card-foreground">Participants</h3>
            <p className="text-2xl font-bold text-primary">{participants.length}</p>
          </div>
        </Card>
      </div>

      {/* Performance Message */}
      <Card className="p-4 bg-secondary/50 border-l-4 border-l-primary">
        <p className="text-center text-card-foreground font-medium">
          {getPerformanceMessage()}
        </p>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6 bg-gradient-card shadow-medium">
        <h3 className="text-xl font-semibold mb-4 text-card-foreground">Current Standings</h3>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div 
              key={participant.id} 
              className={`flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 rounded-lg transition-all duration-300 ${
                participant.name === 'You' 
                  ? 'bg-primary/10 border-2 border-primary shadow-medium' 
                  : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-[50px] md:min-w-[60px] flex-shrink-0">
                  {getRankIcon(participant.rank)}
                  <span className="font-bold text-base md:text-lg">#{participant.rank}</span>
                </div>
                
                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1">
                  <h4 className={`font-semibold text-sm md:text-base truncate ${participant.name === 'You' ? 'text-primary' : 'text-card-foreground'}`}>
                    {participant.name}
                  </h4>
                  <div className="flex flex-col space-y-1 md:flex-row md:items-center md:gap-2 md:space-y-0">
                    <Badge variant="outline" className="text-xs w-fit">
                      Level {participant.level}
                    </Badge>
                    <Badge className={`text-xs w-fit ${getLeagueColor(participant.league)}`}>
                      {participant.league}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:text-right md:block">
                <p className="font-bold text-base md:text-lg text-card-foreground">{participant.xp} XP</p>
                <div className="w-20 md:w-24">
                  <Progress value={(participant.xp / 350) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Eliminated Players (Previous Season) */}
      <Card className="p-6 bg-gradient-card shadow-medium">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
          <Badge variant="outline">Season {currentSeason - 1}</Badge>
          Eliminated Players
        </h3>
        <div className="space-y-2">
          {eliminatedPlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">#{player.rank}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{player.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{player.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tournament Rules */}
      <Card className="p-6 bg-accent/10 border-accent/20">
        <h3 className="text-lg font-semibold mb-3 text-card-foreground">Tournament Rules</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Weekly tournaments run from Monday to Sunday</p>
          <p>• Earn XP by reading books, writing reviews, and community engagement</p>
          <p>• Top 3 finishers receive bonus XP for the next season</p>
          <p>• League placement affects XP multipliers</p>
          <p>• Bottom performers may be moved to lower leagues</p>
        </div>
      </Card>
    </div>
  );
};
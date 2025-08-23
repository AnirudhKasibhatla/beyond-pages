import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Crown, Target, Book, Star, Users } from "lucide-react";
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
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [userXP] = useState(0); // This would come from user data
  const [eliminatedPlayers] = useState<TournamentParticipant[]>([]);

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
        <Badge variant="default" className="text-sm px-4 py-2 w-fit">
          Season {currentSeason}
        </Badge>
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
      {userXP > 0 && (
        <Card className="p-4 bg-secondary/50 border-l-4 border-l-primary">
          <p className="text-center text-card-foreground font-medium">
            {getPerformanceMessage()}
          </p>
        </Card>
      )}

      {/* Tournament Rules for 0 XP users or Leaderboard for others */}
      {userXP === 0 ? (
        <Card className="p-6 bg-gradient-card shadow-medium">
          <h3 className="text-xl font-semibold mb-6 text-card-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            How Tournament Works
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <Book className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h4 className="font-semibold mb-2 text-card-foreground">Read Books</h4>
                <p className="text-sm text-muted-foreground">Complete books to earn XP and climb the leaderboard</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10">
                <Star className="h-8 w-8 mx-auto mb-3 text-accent" />
                <h4 className="font-semibold mb-2 text-card-foreground">Write Reviews</h4>
                <p className="text-sm text-muted-foreground">Share your thoughts and earn bonus XP</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10">
                <Users className="h-8 w-8 mx-auto mb-3 text-success" />
                <h4 className="font-semibold mb-2 text-card-foreground">Engage</h4>
                <p className="text-sm text-muted-foreground">Join community discussions and events</p>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-card-foreground">Tournament Rules</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Weekly tournaments run from Monday to Sunday</p>
                <p>• Earn XP by reading books, writing reviews, and community engagement</p>
                <p>• Top 3 finishers receive bonus XP for the next season</p>
                <p>• League placement affects XP multipliers</p>
                <p>• Bottom performers may be moved to lower leagues</p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-hero rounded-lg">
              <p className="text-primary-foreground font-medium">
                Start reading and engaging to see your name on the leaderboard!
              </p>
            </div>
          </div>
        </Card>
      ) : (
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
      )}

      {/* Eliminated Players (Previous Season) - Only show if users are in tournament */}
      {userXP > 0 && eliminatedPlayers.length > 0 && (
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
      )}

    </div>
  );
};
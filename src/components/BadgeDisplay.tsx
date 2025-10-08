import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import badgeFirstSteps from "@/assets/badge-first-steps.png";
import badgeStarter from "@/assets/badge-starter.png";
import badgeLibraryMaking from "@/assets/badge-library-making.png";
import badgeBibliophile from "@/assets/badge-bibliophile.png";

interface Badge {
  id: string;
  badge_name: string;
  earned_at: string;
}

interface BadgeDisplayProps {
  userId?: string;
}

const BADGE_CONFIG: Record<string, { image: string; description: string }> = {
  "First Steps": {
    image: badgeFirstSteps,
    description: "Joined the community"
  },
  "Starter": {
    image: badgeStarter,
    description: "Added your first book"
  },
  "Library in making": {
    image: badgeLibraryMaking,
    description: "Read 10 books"
  },
  "Bibliophile": {
    image: badgeBibliophile,
    description: "Read 50 books"
  }
};

export default function BadgeDisplay({ userId }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        setBadges(data || []);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading || badges.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/20">
      <h2 className="text-xl font-semibold text-foreground mb-4">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const config = BADGE_CONFIG[badge.badge_name];
          if (!config) return null;

          return (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-2">
                <img
                  src={config.image}
                  alt={badge.badge_name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-semibold text-sm text-foreground">{badge.badge_name}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

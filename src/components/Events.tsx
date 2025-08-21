import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Plus, Check, Star, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  category: 'book-club' | 'author-talk' | 'workshop' | 'social';
  attendees: number;
  maxAttendees?: number;
  isRsvped: boolean;
  hostXP: number;
  host: string;
  featured?: boolean;
}

export const Events = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [events, setEvents] = useState<BookEvent[]>([
    {
      id: '1',
      title: 'Author Talk: Margaret Atwood on Climate Fiction',
      description: 'Join bestselling author Margaret Atwood for an intimate discussion about her latest work and the role of climate fiction in modern literature.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      time: '7:00 PM EST',
      location: 'Virtual Event (Zoom)',
      type: 'virtual',
      category: 'author-talk',
      attendees: 127,
      maxAttendees: 200,
      isRsvped: false,
      hostXP: 25,
      host: 'Literary Society',
      featured: true
    },
    {
      id: '2',
      title: 'Mystery Book Club: "The Thursday Murder Club"',
      description: 'Monthly book club discussion focusing on contemporary mystery novels. This month we\'re diving into Richard Osman\'s delightful debut.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      time: '6:30 PM EST',
      location: 'Central Library, Room 204',
      type: 'in-person',
      category: 'book-club',
      attendees: 15,
      maxAttendees: 25,
      isRsvped: true,
      hostXP: 15,
      host: 'Sarah Chen'
    },
    {
      id: '3',
      title: 'Creative Writing Workshop: Character Development',
      description: 'Learn the fundamentals of creating compelling characters in your fiction writing. Suitable for beginners and intermediate writers.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      time: '2:00 PM EST',
      location: 'Writers\' Studio Downtown',
      type: 'in-person',
      category: 'workshop',
      attendees: 8,
      maxAttendees: 12,
      isRsvped: false,
      hostXP: 20,
      host: 'Marcus Rodriguez'
    },
    {
      id: '4',
      title: 'Sci-Fi Reading Marathon',
      description: 'A fun social event where we read and discuss short sci-fi stories together. Bring your favorite snacks and prepare for mind-bending tales!',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      time: '1:00 PM EST',
      location: 'Community Center',
      type: 'in-person',
      category: 'social',
      attendees: 23,
      maxAttendees: 30,
      isRsvped: false,
      hostXP: 18,
      host: 'Emily Watson'
    },
    {
      id: '5',
      title: 'Virtual Poetry Night',
      description: 'Share your favorite poems or your own original work in a supportive online environment. Open mic style event.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '8:00 PM EST',
      location: 'Discord Voice Channel',
      type: 'virtual',
      category: 'social',
      attendees: 31,
      isRsvped: true,
      hostXP: 12,
      host: 'Alex Johnson'
    }
  ]);

  const [claimedHostEvents, setClaimedHostEvents] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleRSVP = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isRsvped: !event.isRsvped,
            attendees: event.isRsvped ? event.attendees - 1 : event.attendees + 1
          }
        : event
    ));

    const event = events.find(e => e.id === eventId);
    if (event) {
      toast({
        title: event.isRsvped ? "RSVP Cancelled" : "RSVP Confirmed!",
        description: event.isRsvped 
          ? `You've cancelled your RSVP for "${event.title}"` 
          : `You're now registered for "${event.title}"`,
      });
    }
  };

  const claimHostXP = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && !claimedHostEvents.includes(eventId)) {
      setClaimedHostEvents(prev => [...prev, eventId]);
      toast({
        title: "XP Claimed!",
        description: `You earned ${event.hostXP} XP for hosting "${event.title}"`,
      });
    }
  };

  const getTypeIcon = (type: BookEvent['type']) => {
    switch (type) {
      case 'virtual':
        return '💻';
      case 'in-person':
        return '📍';
      case 'hybrid':
        return '🔄';
    }
  };

  const getCategoryColor = (category: BookEvent['category']) => {
    switch (category) {
      case 'book-club':
        return 'bg-primary text-primary-foreground';
      case 'author-talk':
        return 'bg-accent text-accent-foreground';
      case 'workshop':
        return 'bg-success text-success-foreground';
      case 'social':
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isEventSoon = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours > 0;
  };

  const isMyEvent = (host: string) => {
    return host === 'You' || host.includes('You');
  };

  const filteredEvents = events.filter(event => {
    if (categoryFilter !== "all" && event.category !== categoryFilter) return false;
    if (typeFilter !== "all" && event.type !== typeFilter) return false;
    if (timeFilter === "thisWeek") {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (event.date > weekFromNow) return false;
    }
    if (timeFilter === "thisMonth") {
      const now = new Date();
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (event.date > monthFromNow) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Book Events</h2>
        <Button variant="hero" className="gap-2">
          <Plus className="h-4 w-4" />
          Host Event
        </Button>
      </div>

      {/* Filter Options */}
      <Card className="p-4 bg-gradient-card">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filter Events</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="book-club">Book Club</SelectItem>
                <SelectItem value="author-talk">Author Talk</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Time</label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Total Events</h4>
          <p className="text-2xl font-bold text-primary">{events.length}</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Check className="h-6 w-6 text-success mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">RSVP'd</h4>
          <p className="text-2xl font-bold text-success">{events.filter(e => e.isRsvped).length}</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Star className="h-6 w-6 text-accent mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">Hosted</h4>
          <p className="text-2xl font-bold text-accent">{events.filter(e => isMyEvent(e.host)).length}</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
          <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-card-foreground">This Week</h4>
          <p className="text-2xl font-bold text-muted-foreground">
            {events.filter(e => {
              const now = new Date();
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return e.date <= weekFromNow;
            }).length}
          </p>
        </Card>
      </div>

      {/* Featured Event */}
      {filteredEvents.filter(e => e.featured).map(event => (
        <Card key={event.id} className="p-6 bg-gradient-hero text-primary-foreground shadow-strong">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="secondary" className="text-primary bg-primary-foreground">
              ⭐ Featured Event
            </Badge>
            {isEventSoon(event.date) && (
              <Badge variant="destructive" className="animate-pulse">
                Starting Soon!
              </Badge>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
          <p className="text-primary-foreground/90 mb-4 leading-relaxed">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {getTypeIcon(event.type)} {event.attendees} attending
                {event.maxAttendees && ` / ${event.maxAttendees}`}
              </span>
              <Badge className={getCategoryColor(event.category)}>
                {event.category.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <Button 
              variant={event.isRsvped ? "outline" : "secondary"}
              onClick={() => toggleRSVP(event.id)}
              className="gap-2"
            >
              {event.isRsvped ? (
                <>
                  <Check className="h-4 w-4" />
                  RSVP'd
                </>
              ) : (
                'RSVP Now'
              )}
            </Button>
          </div>
        </Card>
      ))}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.filter(e => !e.featured).map((event) => (
          <Card key={event.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{event.description}</p>
                </div>
                {isEventSoon(event.date) && (
                  <Badge variant="destructive" className="animate-pulse ml-2">
                    Soon!
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.date)} at {event.time}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {event.attendees} attending
                  {event.maxAttendees && ` / ${event.maxAttendees}`}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getTypeIcon(event.type)} {event.type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  by {event.host}
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={event.isRsvped ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleRSVP(event.id)}
                  className="flex-1 gap-2"
                >
                  {event.isRsvped ? (
                    <>
                      <Check className="h-4 w-4" />
                      RSVP'd
                    </>
                  ) : (
                    'RSVP'
                  )}
                </Button>

                {isMyEvent(event.host) && !claimedHostEvents.includes(event.id) && (
                  <Button 
                    variant="accent"
                    size="sm"
                    onClick={() => claimHostXP(event.id)}
                    className="gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Claim {event.hostXP} XP
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Event CTA */}
      <Card className="p-8 text-center bg-gradient-accent shadow-medium">
        <h3 className="text-xl font-semibold text-accent-foreground mb-3">
          Host Your Own Event
        </h3>
        <p className="text-accent-foreground/80 mb-6 max-w-2xl mx-auto">
          Share your passion for books with the community! Host a book club, organize a reading session, 
          or create a discussion group. Earn XP and connect with fellow readers.
        </p>
        <Button variant="hero" size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Start Hosting
        </Button>
      </Card>
    </div>
  );
};
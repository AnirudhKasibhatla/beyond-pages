import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Plus, Check, Star, Filter, Globe, RefreshCw, Edit, Trash2, MessageCircle, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreateEventDialog } from "./CreateEventDialog";
import { EventDetailsDialog } from "./EventDetailsDialog";
import { EventChat } from "./EventChat";
import { EditEventDialog } from "./EditEventDialog";
import { ShareEventDialog } from "./ShareEventDialog";
import { SignUpPromptDialog } from "./SignUpPromptDialog";
import { EventFiles } from "./EventFiles";
import { UserProfileView } from "./UserProfileView";

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
  creatorId: string;
  isHost: boolean;
}

export const Events = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [events, setEvents] = useState<BookEvent[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<BookEvent | null>(null);
  const [selectedChatEvent, setSelectedChatEvent] = useState<BookEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BookEvent | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharingEvent, setSharingEvent] = useState<BookEvent | null>(null);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [filesEvent, setFilesEvent] = useState<BookEvent | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load events from database
  useEffect(() => {
    loadEvents();
    if (user) {
      loadUserRSVPs();
    }
  }, [user]);

  // Listen for deep linking to specific events
  useEffect(() => {
    const handleShowEventDetails = (event: CustomEvent) => {
      const eventId = event.detail?.eventId;
      if (eventId) {
        const foundEvent = events.find(e => e.id === eventId);
        if (foundEvent) {
          setSelectedEvent(foundEvent);
          setShowEventDetails(true);
        }
      }
    };

    window.addEventListener('showEventDetails', handleShowEventDetails as EventListener);
    return () => window.removeEventListener('showEventDetails', handleShowEventDetails as EventListener);
  }, [events]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('book_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      const eventsWithRSVPs = await Promise.all(
        data.map(async (event) => {
          const { data: rsvpData } = await supabase
            .from('event_rsvps')
            .select('id')
            .eq('event_id', event.id);

          // Get host name from profiles (safe fields only)
          const { data: hostProfile } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('user_id', event.creator_id)
            .single();

          const hostName = hostProfile?.name || hostProfile?.username || 'Unknown Host';

          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: new Date(event.event_date),
            time: event.event_time,
            location: event.location,
            type: event.type as 'virtual' | 'in-person' | 'hybrid',
            category: event.category as 'book-club' | 'author-talk' | 'workshop' | 'social',
            attendees: rsvpData?.length || 0,
            maxAttendees: event.max_attendees,
            isRsvped: false, // Will be updated with user RSVPs
            hostXP: event.host_xp,
            host: user?.id === event.creator_id ? 'You' : hostName,
            featured: event.featured,
            creatorId: event.creator_id,
            isHost: user?.id === event.creator_id
          };
        })
      );

      setEvents(eventsWithRSVPs);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRSVPs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const rsvpEventIds = data.map(rsvp => rsvp.event_id);
      setUserRSVPs(rsvpEventIds);
      
      // Update events with RSVP status
      setEvents(prev => prev.map(event => ({
        ...event,
        isRsvped: rsvpEventIds.includes(event.id)
      })));
    } catch (error) {
      console.error('Error loading user RSVPs:', error);
    }
  };

  const toggleRSVP = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to RSVP for events.",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyRsvped = userRSVPs.includes(eventId);

    try {
      if (isCurrentlyRsvped) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        setUserRSVPs(prev => prev.filter(id => id !== eventId));
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRsvped: false, attendees: event.attendees - 1 }
            : event
        ));

        toast({
          title: "RSVP Cancelled",
          description: "You've cancelled your RSVP for this event.",
        });
      } else {
        // Add RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        setUserRSVPs(prev => [...prev, eventId]);
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRsvped: true, attendees: event.attendees + 1 }
            : event
        ));

        toast({
          title: "RSVP Confirmed!",
          description: "You're now registered for this event.",
        });
      }
    } catch (error) {
      console.error('Error toggling RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: BookEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: BookEvent) => {
    setEditingEvent(event);
    setShowEditDialog(true);
  };

  const handleShareEvent = (event: BookEvent) => {
    setSharingEvent(event);
    setShowShareDialog(true);
  };

  const handleFilesEvent = (event: BookEvent) => {
    setFilesEvent(event);
    setShowFilesDialog(true);
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const handleEventCreated = () => {
    loadEvents(); // Refresh events list when new event is created
  };

  const handleEventUpdated = () => {
    loadEvents(); // Refresh events list when event is updated
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('book_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };


  const getTypeIcon = (type: BookEvent['type']) => {
    switch (type) {
      case 'virtual':
        return <Globe className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      case 'hybrid':
        return <RefreshCw className="h-4 w-4" />;
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
        <Button variant="hero" className="gap-2" onClick={() => user ? setShowCreateDialog(true) : setShowSignUpDialog(true)}>
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
        <Card key={event.id} className="p-6 bg-gradient-hero text-primary-foreground shadow-strong cursor-pointer" onClick={() => handleEventClick(event)}>
          <div className="flex items-start justify-between mb-4">
            <Badge variant="secondary" className="text-primary bg-primary-foreground flex items-center gap-1">
              <Star className="h-3 w-3" /> Featured Event
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
              disabled={event.isHost}
            >
              {event.isHost ? (
                <>
                  <Star className="h-4 w-4" />
                  Host
                </>
              ) : event.isRsvped ? (
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
          <Card key={event.id} className="p-6 hover:shadow-medium transition-all duration-300 bg-gradient-card cursor-pointer" onClick={() => handleEventClick(event)}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRSVP(event.id);
                  }}
                  className="flex-1 gap-2"
                  disabled={event.isHost}
                >
                  {event.isHost ? (
                    <>
                      <Star className="h-4 w-4" />
                      Host
                    </>
                  ) : event.isRsvped ? (
                    <>
                      <Check className="h-4 w-4" />
                      RSVP'd
                    </>
                  ) : (
                    'RSVP'
                  )}
                </Button>

                {(event.isRsvped || event.isHost) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChatEvent(event);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>
                )}

                 <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilesEvent(event);
                  }}
                  className="gap-2"
                  title="View Files"
                >
                  <FileImage className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareEvent(event);
                  }}
                  className="gap-2"
                  title="Share Event"
                >
                  <Globe className="h-4 w-4" />
                </Button>

                {event.isHost && (
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="gap-2"
                      title="Edit Event"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      className="gap-2"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
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
        <Button variant="hero" size="lg" className="gap-2" onClick={() => user ? setShowCreateDialog(true) : setShowSignUpDialog(true)}>
          <Plus className="h-5 w-5" />
          Start Hosting
        </Button>
      </Card>

      {/* Create Event Dialog */}
      <CreateEventDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onEventCreated={handleEventCreated}
      />
      
      <EventDetailsDialog 
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        onRSVP={toggleRSVP}
        onViewProfile={handleViewProfile}
      />

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        event={editingEvent}
        onEventUpdated={handleEventUpdated}
      />

      <ShareEventDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        data={sharingEvent ? {
          id: sharingEvent.id,
          title: sharingEvent.title,
          description: sharingEvent.description,
          date: sharingEvent.date,
          time: sharingEvent.time,
          location: sharingEvent.location,
          type: sharingEvent.type,
          category: sharingEvent.category
        } : null}
      />

      {selectedChatEvent && (
        <EventChat
          eventId={selectedChatEvent.id}
          eventTitle={selectedChatEvent.title}
          onClose={() => setSelectedChatEvent(null)}
        />
      )}

      <SignUpPromptDialog
        open={showSignUpDialog}
        onOpenChange={setShowSignUpDialog}
      />

      {filesEvent && (
        <EventFiles
          eventId={filesEvent.id}
          eventTitle={filesEvent.title}
          isOpen={showFilesDialog}
          onClose={() => {
            setShowFilesDialog(false);
            setFilesEvent(null);
          }}
          isHost={filesEvent.isHost}
        />
      )}

      <UserProfileView
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        userId={selectedUserId}
      />
    </div>
  );
};
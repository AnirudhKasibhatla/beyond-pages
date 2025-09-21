import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, MessageSquare, User, Repeat } from "lucide-react";
import { EventChat } from "./EventChat";
import { ClickableUserName } from "./ClickableUserName";

interface BookEvent {
  id: string;
  title: string;
  description?: string;
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
  creatorId: string;
  isHost: boolean;
  recurring?: boolean;
  recurringDays?: string[];
  recurringDuration?: number;
}

interface EventDetailsDialogProps {
  event: BookEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRSVP: (eventId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const EventDetailsDialog = ({ event, isOpen, onClose, onRSVP, onViewProfile }: EventDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');

  if (!event) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return '💻';
      case 'in-person': return '📍';
      case 'hybrid': return '🔄';
      default: return '📅';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'book-club': return 'bg-primary/10 text-primary';
      case 'author-talk': return 'bg-accent/10 text-accent';
      case 'workshop': return 'bg-blue-500/10 text-blue-600';
      case 'social': return 'bg-green-500/10 text-green-600';
      default: return 'bg-secondary text-secondary-foreground';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeIcon(event.type)}
                  {event.type}
                </Badge>
                {event.recurring && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    Recurring
                  </Badge>
                )}
              </div>
            </div>
            {!event.isHost && (
              <Button
                onClick={() => onRSVP(event.id)}
                variant={event.isRsvped ? "outline" : "default"}
                className="ml-4"
              >
                {event.isRsvped ? "Cancel RSVP" : "RSVP"}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'details' ? 'default' : 'outline'}
            onClick={() => setActiveTab('details')}
            size="sm"
          >
            Details
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(event.date)}</p>
                      <p className="text-sm text-muted-foreground">Date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.time}</p>
                      <p className="text-sm text-muted-foreground">Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-muted-foreground">Location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attendees
                      </p>
                      <p className="text-sm text-muted-foreground">Current attendance</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                )}

                {event.recurring && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Recurring Event
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Repeats every {event.recurringDays?.join(', ')} for {event.recurringDuration} weeks
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Host Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {event.host.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {onViewProfile ? (
                      <ClickableUserName
                        name={event.host}
                        userId={event.creatorId}
                        onUserClick={onViewProfile}
                        className="font-semibold text-base"
                        variant="link"
                      />
                    ) : (
                      <h4 className="font-semibold">{event.host}</h4>
                    )}
                    <p className="text-sm text-muted-foreground">Event Host</p>
                    <Badge variant="outline" className="mt-2">
                      {event.hostXP} Host XP
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EventChat eventId={event.id} eventTitle={event.title} onClose={() => {}} />
        )}
      </DialogContent>
    </Dialog>
  );
};
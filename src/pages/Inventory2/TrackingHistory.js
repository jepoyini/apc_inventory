import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  MapPin, 
  User, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Edit, 
  QrCode,
  Trash2
} from 'lucide-react';
import { TrackingEvent } from '@/types/inventory';
const TrackingHistory: () => = ({ events, className }) => {
  const getEventIcon = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'created'="h-4 w-4" />;
      case 'updated'="h-4 w-4" />;
      case 'moved'="h-4 w-4" />;
      case 'shipped'="h-4 w-4" />;
      case 'received'="h-4 w-4" />;
      case 'returned'="h-4 w-4 rotate-180" />;
      case 'disposed'="h-4 w-4" />;
      case 'scanned'="h-4 w-4" />;
      default="h-4 w-4" />;
    }
  };

  const getEventColor = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'created': return 'bg-green-100 text-green-800 border-green-200';
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'received': return 'bg-green-100 text-green-800 border-green-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'disposed': return 'bg-red-100 text-red-800 border-red-200';
      case 'scanned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatEventDescription = (event) => {
    switch (event.type) {
      case 'created':
        return 'Product created in system';
      case 'updated':
        return 'Product information updated';
      case 'moved':
        return `Moved from ${event.fromLocation} to ${event.toLocation}`;
      case 'shipped':
        return `Shipped ${event.quantity || 'items'} from ${event.location}`;
      case 'received':
        return `Received ${event.quantity || 'items'} at ${event.location}`;
      case 'returned':
        return `Returned ${event.quantity || 'items'} to ${event.location}`;
      case 'disposed':
        return `Disposed ${event.quantity || 'items'} from ${event.location}`;
      case 'scanned':
        return `Scanned at ${event.location}`;
      default:
        return 'Activity recorded';
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Tracking History</span>
          <Badge variant="outline">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tracking events recorded</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
              
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start space-x-4 pb-6">
                  {/* Event icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {event.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatEventDescription(event)}
                      </p>
                      
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{event.user}</span>
                        </div>
                        
                        {event.quantity && (
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3" />
                            <span>{event.quantity} items</span>
                          </div>
                        )}
                        
                        {event.location && !event.fromLocation && !event.toLocation && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingHistory;
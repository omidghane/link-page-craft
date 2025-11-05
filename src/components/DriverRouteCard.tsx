import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface RouteStop {
  order: number;
  customerId: string;
  departureTime: string;
  arrivalTime: string;
}

interface DriverRouteCardProps {
  driverName: string;
  departureTime: string;
  lastDeliveryTime: string;
  status: string;
  statusText: string;
  stops: RouteStop[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-success/10 text-success hover:bg-success/20 border-success/20";
    case "in-transit":
      return "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20";
    case "pending":
      return "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20";
    default:
      return "";
  }
};

export const DriverRouteCard = ({
  driverName,
  departureTime,
  lastDeliveryTime,
  status,
  statusText,
  stops,
}: DriverRouteCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 border-b border-border pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{driverName}</h3>
            <Badge className={getStatusColor(status)}>
              {statusText}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <p className="text-xs">زمان حرکت</p>
                <p className="font-medium text-foreground">{departureTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <div>
                <p className="text-xs">تحویل آخرین مشتری</p>
                <p className="font-medium text-foreground">{lastDeliveryTime}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {stops.map((stop) => (
            <div
              key={stop.customerId}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="grid grid-cols-4 gap-4 items-center text-sm">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {stop.order}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">شناسه مشتری</p>
                  <p className="font-mono font-medium">{stop.customerId}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">زمان حرکت</p>
                  <p className="font-medium">{stop.departureTime}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">زمان رسیدن</p>
                  <p className="font-medium">{stop.arrivalTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

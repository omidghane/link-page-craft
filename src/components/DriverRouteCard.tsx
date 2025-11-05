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
      <CardHeader className="bg-muted/50 border-b border-border p-3 pb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{driverName}</h3>
            <Badge className={`text-xs ${getStatusColor(status)}`}>
              {statusText}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <div>
                <p className="text-[10px]">زمان حرکت</p>
                <p className="font-medium text-foreground text-xs">{departureTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <div>
                <p className="text-[10px]">تحویل آخرین مشتری</p>
                <p className="font-medium text-foreground text-xs">{lastDeliveryTime}</p>
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
              className="p-2 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {stop.order}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <p className="text-[9px] text-muted-foreground">شناسه:</p>
                  <p className="font-mono font-medium text-[10px]">{stop.customerId}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <p className="text-[9px] text-muted-foreground">حرکت:</p>
                  <p className="font-medium text-[10px]">{stop.departureTime}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <p className="text-[9px] text-muted-foreground">رسیدن:</p>
                  <p className="font-medium text-[10px]">{stop.arrivalTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

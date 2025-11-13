import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "./ui/input";

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
  driverIndex: number;
  onDriverNameChange: (newName: string) => void;
}

const DraggableStop = ({
  stop,
  driverIndex,
  stopIndex,
}: {
  stop: RouteStop;
  driverIndex: number;
  stopIndex: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${driverIndex}-${stopIndex}`,
    data: {
      driverIndex,
      stopIndex,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 hover:bg-muted/30 transition-colors cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="flex items-start gap-3 text-xs">
        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] mt-1">
          {stop.order}
        </div>

        <div className="flex-1 flex flex-col gap-1 items-start">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground">شناسه:</span>
            <span className="font-mono font-medium text-[10px]">{stop.customerId}</span>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1">
              <span className="font-medium text-[10px]">{stop.departureTime}</span>
              <span className="text-[9px] text-muted-foreground">←</span>
              <span className="font-medium text-[10px]">{stop.arrivalTime}</span>
            </div>
          </div>
        </div>

        <div>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

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
  driverIndex,
  onDriverNameChange,
}: DriverRouteCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 border-b border-border p-3 pb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* <h3 className="text-sm font-bold">{driverName}</h3> */}
            <Input
              value={driverName}
              onChange={(e) => onDriverNameChange(e.target.value)}
              className="h-7 px-2 py-1 text-xs font-bold"
            />
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
          {stops.map((stop, idx) => (
            <DraggableStop
              key={`${driverIndex}-${stop.customerId}`}
              stop={stop}
              driverIndex={driverIndex}
              stopIndex={idx}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

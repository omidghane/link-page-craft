import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Truck, Clock, User, X } from "lucide-react";

interface DeliveryStop {
  id: string;
  seq: number;
  timeStart: string;
  timeEnd: string;
}

interface Vehicle {
  id: number;
  departs: string;
  returns: string;
  driver: string;
  stops: DeliveryStop[];
}

const vehicles: Vehicle[] = [
  {
    id: 1,
    departs: "08:00",
    returns: "10:47",
    driver: "driver1",
    stops: [
      { id: "583926", seq: 1, timeStart: "08:06", timeEnd: "08:16" },
      { id: "584048", seq: 2, timeStart: "08:18", timeEnd: "08:28" },
      { id: "583718", seq: 3, timeStart: "08:38", timeEnd: "08:48" },
      { id: "583701", seq: 4, timeStart: "08:49", timeEnd: "08:59" },
      { id: "583700", seq: 5, timeStart: "09:04", timeEnd: "09:14" },
      { id: "583905", seq: 6, timeStart: "09:18", timeEnd: "09:28" },
      { id: "584480", seq: 7, timeStart: "09:33", timeEnd: "09:43" },
      { id: "584321", seq: 8, timeStart: "09:47", timeEnd: "09:57" },
    ],
  },
  {
    id: 2,
    departs: "08:00",
    returns: "11:01",
    driver: "driver2",
    stops: [
      { id: "583925", seq: 1, timeStart: "08:08", timeEnd: "08:18" },
      { id: "584307", seq: 2, timeStart: "08:25", timeEnd: "08:35" },
      { id: "584058", seq: 3, timeStart: "08:48", timeEnd: "08:58" },
      { id: "584318", seq: 4, timeStart: "09:00", timeEnd: "09:10" },
      { id: "584343", seq: 5, timeStart: "09:15", timeEnd: "09:25" },
      { id: "583986", seq: 6, timeStart: "09:45", timeEnd: "09:55" },
      { id: "583960", seq: 7, timeStart: "09:57", timeEnd: "10:07" },
      { id: "582882", seq: 8, timeStart: "10:09", timeEnd: "10:19" },
    ],
  },
  {
    id: 3,
    departs: "08:00",
    returns: "12:24",
    driver: "driver3",
    stops: [
      { id: "583717", seq: 1, timeStart: "08:26", timeEnd: "08:36" },
      { id: "584479", seq: 2, timeStart: "08:41", timeEnd: "08:51" },
      { id: "584386", seq: 3, timeStart: "08:53", timeEnd: "09:03" },
      { id: "583423", seq: 4, timeStart: "09:08", timeEnd: "09:18" },
      { id: "583242", seq: 5, timeStart: "09:28", timeEnd: "09:38" },
      { id: "583417", seq: 6, timeStart: "09:50", timeEnd: "10:00" },
      { id: "584100", seq: 7, timeStart: "10:00", timeEnd: "10:10" },
      { id: "583413", seq: 8, timeStart: "10:12", timeEnd: "10:22" },
    ],
  },
  {
    id: 4,
    departs: "08:00",
    returns: "11:38",
    driver: "",
    stops: [
      { id: "583932", seq: 1, timeStart: "08:31", timeEnd: "08:41" },
      { id: "583935", seq: 2, timeStart: "08:42", timeEnd: "08:52" },
      { id: "584346", seq: 3, timeStart: "08:53", timeEnd: "09:03" },
      { id: "584330", seq: 4, timeStart: "09:04", timeEnd: "09:14" },
      { id: "584432", seq: 5, timeStart: "09:17", timeEnd: "09:27" },
      { id: "584279", seq: 6, timeStart: "09:38", timeEnd: "09:48" },
      { id: "584304", seq: 7, timeStart: "10:12", timeEnd: "10:22" },
      { id: "584271", seq: 8, timeStart: "10:24", timeEnd: "10:34" },
    ],
  },
  {
    id: 5,
    departs: "08:00",
    returns: "11:21",
    driver: "",
    stops: [
      { id: "584349", seq: 1, timeStart: "08:34", timeEnd: "08:44" },
      { id: "583833", seq: 2, timeStart: "09:04", timeEnd: "09:14" },
      { id: "584396", seq: 3, timeStart: "09:17", timeEnd: "09:27" },
      { id: "584389", seq: 4, timeStart: "09:28", timeEnd: "09:38" },
      { id: "584351", seq: 5, timeStart: "09:39", timeEnd: "09:49" },
      { id: "583943", seq: 6, timeStart: "09:52", timeEnd: "10:02" },
      { id: "584337", seq: 7, timeStart: "10:03", timeEnd: "10:13" },
      { id: "583816", seq: 8, timeStart: "10:15", timeEnd: "10:25" },
    ],
  },
  {
    id: 6,
    departs: "08:00",
    returns: "11:33",
    driver: "",
    stops: [
      { id: "584395", seq: 1, timeStart: "08:37", timeEnd: "08:47" },
      { id: "584348", seq: 2, timeStart: "08:53", timeEnd: "09:03" },
      { id: "584339", seq: 3, timeStart: "09:20", timeEnd: "09:30" },
      { id: "584215", seq: 4, timeStart: "09:39", timeEnd: "09:49" },
      { id: "584303", seq: 5, timeStart: "09:53", timeEnd: "10:03" },
      { id: "584106", seq: 6, timeStart: "10:05", timeEnd: "10:15" },
      { id: "584061", seq: 7, timeStart: "10:16", timeEnd: "10:26" },
      { id: "584132", seq: 8, timeStart: "10:28", timeEnd: "10:38" },
    ],
  },
];

export const VehicleAssignments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">✏️</span>
        <h2 className="text-2xl font-bold">Edit Vehicle Assignments (Drag and Drop)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4 bg-muted/30">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Vehicle {vehicle.id}</h3>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Departs: <strong>{vehicle.departs}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Returns: <strong>{vehicle.returns}</strong></span>
                  </div>
                </div>
              </div>

              {/* Driver Input */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Driver:</span>
                </div>
                <Input
                  placeholder="Enter driver username"
                  defaultValue={vehicle.driver}
                  className="text-sm"
                />
              </div>

              {/* Stops */}
              <div className="space-y-2">
                {vehicle.stops.map((stop) => (
                  <div
                    key={stop.id}
                    className="bg-background rounded-lg p-3 border border-border relative group hover:border-primary transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>ID:</strong> {stop.id} <strong>Seq:</strong> {stop.seq}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {stop.timeStart} → {stop.timeEnd}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

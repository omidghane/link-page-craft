import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliveryStop {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  startTime?: string;
  endTime?: string;
}

interface DeliveryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string;
  driver: string;
  stops: DeliveryStop[];
}

export const DeliveryDetailsDialog = ({
  open,
  onOpenChange,
  deliveryId,
  driver,
  stops,
}: DeliveryDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            جزئیات مسیر {deliveryId} - راننده: {driver}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card rounded-lg border border-border overflow-hidden mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">id</TableHead>
                <TableHead className="text-right">Longitude</TableHead>
                <TableHead className="text-right">Latitude</TableHead>
                <TableHead className="text-right">Address</TableHead>
                <TableHead className="text-right">CustomerName</TableHead>
                <TableHead className="text-right">زمان شروع</TableHead>
                <TableHead className="text-right">زمان پایان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.map((stop) => (
                <TableRow key={stop.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono">{stop.id}</TableCell>
                  <TableCell>{stop.longitude}</TableCell>
                  <TableCell>{stop.latitude}</TableCell>
                  <TableCell className="max-w-xs">{stop.address}</TableCell>
                  <TableCell className="font-medium">{stop.customerName}</TableCell>
                  <TableCell>{stop.startTime || "-"}</TableCell>
                  <TableCell>{stop.endTime || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

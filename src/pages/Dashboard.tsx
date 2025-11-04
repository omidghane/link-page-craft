import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import Map from "@/components/Map";
import { DeliveryDetailsDialog } from "@/components/DeliveryDetailsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const deliveries = [
    {
      id: "DEL-001",
      driver: "علی حسینی",
      status: "delivered",
      statusText: "تحویل شده",
      origin: "انبار مرکزی",
      destination: "تهران، پونک",
      time: "ساعت 15 دقیقه 2",
      distance: "45 کیلومتر",
    },
    {
      id: "DEL-002",
      driver: "زهرا احمدی",
      status: "in-transit",
      statusText: "در حال انتقال",
      origin: "انبار شمال",
      destination: "کرج، مهرشهر",
      time: "ساعت 50 دقیقه 1",
      distance: "30 کیلومتر",
    },
    {
      id: "DEL-003",
      driver: "رضا کریمی",
      status: "pending",
      statusText: "منتظر",
      origin: "انبار جنوب",
      destination: "اصفهان، سرو سه راه پل",
      time: "ساعت 00 دقیقه 3",
      distance: "70 کیلومتر",
    },
    {
      id: "DEL-004",
      driver: "فاطمه رضایی",
      status: "delivered",
      statusText: "تحویل شده",
      origin: "انبار مرکزی",
      destination: "شهر، شهر زنبیل",
      time: "ساعت 40 دقیقه 2",
      distance: "55 کیلومتر",
    },
    {
      id: "DEL-005",
      driver: "محمد نوری",
      status: "in-transit",
      statusText: "در حال انتقال",
      origin: "انبار شرق",
      destination: "مشهد، خرابه",
      time: "ساعت 20 دقیقه 4",
      distance: "90 کیلومتر",
    },
    {
      id: "DEL-006",
      driver: "نادا احمدی",
      status: "pending",
      statusText: "منتظر",
      origin: "انبار غرب",
      destination: "کرمان، ونسستر",
      time: "ساعت 30 دقیقه 2",
      distance: "60 کیلومتر",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "in-transit":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "default";
    }
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

  const getDeliveryStops = (deliveryId: string) => {
    // Sample data - in a real app, this would come from your backend
    const stopsData: Record<string, any[]> = {
      "DEL-001": [
        {
          id: "584353",
          customerName: "دکتر فینی",
          address: "محله فرودوس - فلكه دوم صادقیه - بلوار فردوس شرق - ابتدای خیابان 20 متری ولیعصر پلاك 53-طبقه اول- واحد مسكونی شماره1",
          latitude: 35.7228775,
          longitude: 51.33027267,
          startTime: "09:00",
          endTime: "09:15",
        },
        {
          id: "584354",
          customerName: "آقای محمدی",
          address: "تهران - خیابان ولیعصر - پلاک 120",
          latitude: 35.7125,
          longitude: 51.4215,
          startTime: "09:30",
          endTime: "09:45",
        },
      ],
      "DEL-002": [
        {
          id: "584355",
          customerName: "خانم رضایی",
          address: "کرج - مهرشهر - بلوار اصلی - پلاک 45",
          latitude: 35.8328,
          longitude: 51.0094,
          startTime: "10:00",
          endTime: "10:20",
        },
      ],
      "DEL-003": [
        {
          id: "584356",
          customerName: "شرکت تجارت",
          address: "اصفهان - سه راه پل سرو - مجتمع تجاری - طبقه دوم",
          latitude: 32.6546,
          longitude: 51.6680,
          startTime: "11:00",
          endTime: "11:30",
        },
      ],
    };
    return stopsData[deliveryId] || [];
  };

  const handleViewDetails = (deliveryId: string) => {
    setSelectedDelivery(deliveryId);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <Map />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">نتایج بهینه سازی مسیر</h1>
          <p className="text-muted-foreground">
            مسیرهای تحویل شما بهینه شده است تا کارآیی را به حداکثر برساند
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="کل بسته ها"
            value="12,890"
            subtitle="تحویل داده شده"
          />
          <StatsCard
            title="میانگین زمان تحویل"
            value="ساعت 2.5"
            subtitle="در هر مسیر"
          />
          <StatsCard
            title="صرفه جویی سوخت در سرفصل"
            value="لیتر 2,350"
            subtitle="در این ماه"
          />
          <StatsCard
            title="مسیرهای بهینه شده"
            value="245"
            subtitle="در این ماه"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس شناسه مسیر، راننده..."
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="bg-primary hover:bg-primary-hover gap-2">
                <Download className="h-4 w-4" />
                دانلود گزارش
              </Button>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">شناسه</TableHead>
                <TableHead className="text-right">فاصله</TableHead>
                <TableHead className="text-right">مدت زمان تخمینی</TableHead>
                <TableHead className="text-right">محل پایان</TableHead>
                <TableHead className="text-right">محل شروع</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">راننده</TableHead>
                <TableHead className="text-right">شناسه مسیر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="text-primary p-0 h-auto"
                      onClick={() => handleViewDetails(delivery.id)}
                    >
                      ← مشاهده جزئیات
                    </Button>
                  </TableCell>
                  <TableCell>{delivery.distance}</TableCell>
                  <TableCell>{delivery.time}</TableCell>
                  <TableCell className="font-medium">{delivery.destination}</TableCell>
                  <TableCell>{delivery.origin}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(delivery.status)}
                      className={getStatusColor(delivery.status)}
                    >
                      {delivery.statusText}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{delivery.driver}</TableCell>
                  <TableCell className="font-mono">{delivery.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <DeliveryDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deliveryId={selectedDelivery || ""}
        driver={deliveries.find(d => d.id === selectedDelivery)?.driver || ""}
        stops={getDeliveryStops(selectedDelivery || "")}
      />
    </div>
  );
};

export default Dashboard;

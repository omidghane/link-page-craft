import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import Map from "@/components/Map";
import { DriverRouteCard } from "@/components/DriverRouteCard";

const Dashboard = () => {
  const driverRoutes = [
    {
      driverName: "علی حسینی",
      departureTime: "08:00",
      lastDeliveryTime: "12:30",
      status: "delivered",
      statusText: "تحویل شده",
      stops: [
        { order: 1, customerId: "584353", departureTime: "08:00", arrivalTime: "08:45" },
        { order: 2, customerId: "584354", departureTime: "09:00", arrivalTime: "09:30" },
        { order: 3, customerId: "584355", departureTime: "09:45", arrivalTime: "10:15" },
        { order: 4, customerId: "584356", departureTime: "10:30", arrivalTime: "11:00" },
        { order: 5, customerId: "584357", departureTime: "11:15", arrivalTime: "12:30" },
      ],
    },
    {
      driverName: "زهرا احمدی",
      departureTime: "09:00",
      lastDeliveryTime: "14:00",
      status: "in-transit",
      statusText: "در حال انتقال",
      stops: [
        { order: 1, customerId: "584358", departureTime: "09:00", arrivalTime: "09:45" },
        { order: 2, customerId: "584359", departureTime: "10:00", arrivalTime: "10:40" },
        { order: 3, customerId: "584360", departureTime: "11:00", arrivalTime: "11:45" },
        { order: 4, customerId: "584361", departureTime: "12:00", arrivalTime: "13:15" },
        { order: 5, customerId: "584362", departureTime: "13:30", arrivalTime: "14:00" },
      ],
    },
    {
      driverName: "رضا کریمی",
      departureTime: "10:00",
      lastDeliveryTime: "15:30",
      status: "pending",
      statusText: "منتظر",
      stops: [
        { order: 1, customerId: "584363", departureTime: "10:00", arrivalTime: "10:50" },
        { order: 2, customerId: "584364", departureTime: "11:00", arrivalTime: "11:45" },
        { order: 3, customerId: "584365", departureTime: "12:00", arrivalTime: "13:00" },
        { order: 4, customerId: "584366", departureTime: "13:15", arrivalTime: "14:15" },
        { order: 5, customerId: "584367", departureTime: "14:30", arrivalTime: "15:30" },
      ],
    },
    {
      driverName: "فاطمه رضایی",
      departureTime: "07:30",
      lastDeliveryTime: "13:00",
      status: "delivered",
      statusText: "تحویل شده",
      stops: [
        { order: 1, customerId: "584368", departureTime: "07:30", arrivalTime: "08:15" },
        { order: 2, customerId: "584369", departureTime: "08:30", arrivalTime: "09:15" },
        { order: 3, customerId: "584370", departureTime: "09:30", arrivalTime: "10:30" },
        { order: 4, customerId: "584371", departureTime: "10:45", arrivalTime: "11:45" },
        { order: 5, customerId: "584372", departureTime: "12:00", arrivalTime: "13:00" },
      ],
    },
    {
      driverName: "محمد نوری",
      departureTime: "08:30",
      lastDeliveryTime: "16:00",
      status: "in-transit",
      statusText: "در حال انتقال",
      stops: [
        { order: 1, customerId: "584373", departureTime: "08:30", arrivalTime: "09:30" },
        { order: 2, customerId: "584374", departureTime: "09:45", arrivalTime: "10:45" },
        { order: 3, customerId: "584375", departureTime: "11:00", arrivalTime: "12:15" },
        { order: 4, customerId: "584376", departureTime: "12:30", arrivalTime: "13:45" },
        { order: 5, customerId: "584377", departureTime: "14:00", arrivalTime: "15:00" },
        { order: 6, customerId: "584378", departureTime: "15:15", arrivalTime: "16:00" },
      ],
    },
    {
      driverName: "نادا احمدی",
      departureTime: "09:30",
      lastDeliveryTime: "14:30",
      status: "pending",
      statusText: "منتظر",
      stops: [
        { order: 1, customerId: "584379", departureTime: "09:30", arrivalTime: "10:15" },
        { order: 2, customerId: "584380", departureTime: "10:30", arrivalTime: "11:15" },
        { order: 3, customerId: "584381", departureTime: "11:30", arrivalTime: "12:30" },
        { order: 4, customerId: "584382", departureTime: "12:45", arrivalTime: "13:45" },
        { order: 5, customerId: "584383", departureTime: "14:00", arrivalTime: "14:30" },
      ],
    },
  ];


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
                placeholder="جستجو بر اساس نام راننده..."
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

        {/* Driver Route Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {driverRoutes.map((route, index) => (
            <DriverRouteCard
              key={index}
              driverName={route.driverName}
              departureTime={route.departureTime}
              lastDeliveryTime={route.lastDeliveryTime}
              status={route.status}
              statusText={route.statusText}
              stops={route.stops}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { RouteMap } from "@/components/RouteMap";
import { VehicleAssignments } from "@/components/VehicleAssignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      
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

        {/* Route Map */}
        <div className="mb-8">
          <RouteMap />
        </div>

        {/* Vehicle Assignments */}
        <VehicleAssignments />
      </main>
    </div>
  );
};

export default Dashboard;

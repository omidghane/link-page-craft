import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { DriverRouteCard } from "@/components/DriverRouteCard";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor, 
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSeedData } from "../hooks/useSeedData";

const VRPMap = React.lazy(() => import("@/components/VRPMap"));

const Dashboard = () => {
  const { rows, vehs, loading, error } = useSeedData();
  const [activeId, setActiveId] = useState(null);
  const [driverRoutes, setDriverRoutes] = useState([]);
  const [activeStop, setActiveStop] = useState(null);

  useEffect(() => {
    if (!rows || !vehs || rows.length === 0 || vehs.length === 0) return;

    // Map vehs to driverRoutes
    const updatedDriverRoutes = vehs.map((vehicle, vehicleIndex) => {
      const stops = vehicle.map((customerId, stopIndex) => {
        // Find the corresponding row for the customer
        const customerRow = rows.find((row) => row.id === customerId);

        return {
          order: stopIndex + 1,
          customerId: customerRow?.id ,
          departureTime: customerRow?.start_service
            ? safeMinToHHMM(customerRow.start_service)
            : "--:--",
          arrivalTime: customerRow?.finish_service
            ? safeMinToHHMM(customerRow.finish_service)
            : "--:--",
        };
      });

      return {
        driverName: `Driver ${vehicleIndex + 1}`, // Placeholder driver name
        departureTime: stops[0]?.departureTime || "--:--",
        lastDeliveryTime: stops[stops.length - 1]?.arrivalTime || "--:--",
        status: "pending", // Default status
        statusText: "منتظر", // Default status text
        stops,
      };
    });

    setDriverRoutes(updatedDriverRoutes);
  }, [rows, vehs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
    
    const activeData = active.data.current;
    if (activeData) {
      const route = driverRoutes[activeData.driverIndex];
      if (route) {
        setActiveStop(route.stops[activeData.stopIndex]);
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveStop(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeDriverIndex = activeData.driverIndex;
    const activeStopIndex = activeData.stopIndex;
    const overDriverIndex = overData.driverIndex;
    const overStopIndex = overData.stopIndex;

    if (activeDriverIndex === overDriverIndex) {
      // Reorder within same driver
      if (activeStopIndex !== overStopIndex) {
        setDriverRoutes((routes) => {
          const newRoutes = [...routes];
          const stops = [...newRoutes[activeDriverIndex].stops];
          const [movedStop] = stops.splice(activeStopIndex, 1);
          stops.splice(overStopIndex, 0, movedStop);
          
          // Update order numbers
          stops.forEach((stop, idx) => {
            stop.order = idx + 1;
          });
          
          newRoutes[activeDriverIndex] = {
            ...newRoutes[activeDriverIndex],
            stops,
          };
          return newRoutes;
        });
      }
    } else {
      // Move between drivers
      setDriverRoutes((routes) => {
        const newRoutes = [...routes];
        const sourceStops = [...newRoutes[activeDriverIndex].stops];
        const destStops = [...newRoutes[overDriverIndex].stops];
        
        const [movedStop] = sourceStops.splice(activeStopIndex, 1);
        destStops.splice(overStopIndex, 0, movedStop);
        
        // Update order numbers for both routes
        sourceStops.forEach((stop, idx) => {
          stop.order = idx + 1;
        });
        destStops.forEach((stop, idx) => {
          stop.order = idx + 1;
        });
        
        newRoutes[activeDriverIndex] = {
          ...newRoutes[activeDriverIndex],
          stops: sourceStops,
        };
        newRoutes[overDriverIndex] = {
          ...newRoutes[overDriverIndex],
          stops: destStops,
        };
        
        return newRoutes;
      });
    }
  };


  // Example usage:
  if (loading) return <div>Loading seed data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      {/* <div className="container mx-auto px-4">
        <VRPMap />
      </div> */}
      
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(() => {
              // console.log("Driver Routes (before filtering):", JSON.stringify(driverRoutes, null, 2)); // Log the full driverRoutes array

              const filteredRoutes = driverRoutes.map((route) => {
                // Filter out stops with customerId === 0
                const validStops = route.stops.filter((stop) => {
                  // console.log(`Checking stop: ${JSON.stringify(stop)}`); // Log each stop
                  return stop.customerId !== 0; // Keep only valid stops
                });

                // Re-number the orders after filtering to start from 1
                const reorderedStops = validStops.map((stop, idx) => ({
                  ...stop,
                  order: idx + 1
                }));

                // console.log(`Route "${route.driverName}" valid stops:`, validStops);

                return {
                  ...route,
                  stops: reorderedStops, // Replace stops with reordered stops
                };
              }).filter((route) => route.stops.length > 0); // Keep only routes with valid stops

              // console.log("Filtered Routes (excluding stops with id 0):", JSON.stringify(filteredRoutes, null, 2)); // Log the filtered routes

              return filteredRoutes.map((route, index) => (
                <div key={index} className="flex-shrink-0 w-48">
                  <SortableContext
                    items={route.stops.map((_, idx) => `${index}-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DriverRouteCard
                      driverName={route.driverName}
                      departureTime={route.departureTime}
                      lastDeliveryTime={route.lastDeliveryTime}
                      status={route.status}
                      statusText={route.statusText}
                      stops={route.stops}
                      driverIndex={index}
                    />
                  </SortableContext>
                </div>
              ));
            })()}
          </div>
          
          <DragOverlay>
            {activeId && activeStop ? (
              <div className="bg-card border border-border rounded-lg p-2 shadow-lg opacity-90">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {activeStop.order}
                  </div>
                  <div className="flex-1 flex gap-4 items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">شناسه:</span>
                      <span className="font-mono font-medium text-[10px]">{activeStop.customerId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">حرکت:</span>
                      <span className="font-medium text-[10px]">{activeStop.departureTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">رسیدن:</span>
                      <span className="font-medium text-[10px]">{activeStop.arrivalTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

// Helper function to convert minutes to HH:MM format
function safeMinToHHMM(value) {
  try {
    if (value === null || value === undefined) return "--:--";
    const hours = Math.floor(value / 60);
    const minutes = Math.floor(value % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
}

export default Dashboard;

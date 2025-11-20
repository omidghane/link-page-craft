import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Save,
  BarChart3,
} from "lucide-react";
import { DriverRouteCard } from "@/components/DriverRouteCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSeedData } from "../hooks/useSeedData";

const VRPMap = React.lazy(() => import("@/components/VRPMap"));

const normalizeCoordinate = (value: any) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const Dashboard = () => {
  const { rows, vehs, loading, error } = useSeedData();
  const [activeId, setActiveId] = useState(null);
  const [driverRoutes, setDriverRoutes] = useState([]);
  const [activeStop, setActiveStop] = useState(null);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  useEffect(() => {
    if (!rows || !vehs || rows.length === 0 || vehs.length === 0) return;

    setDriverRoutes((prevRoutes) => {
      const updatedDriverRoutes = vehs
        .map((vehicle, vehicleIndex) => {
          // همه stopها (شامل 0)
          const allStops = vehicle.map((customerId, stopIndex) => {
            const customerRow = rows.find((row) => row.id === customerId);
            const customerName =
              customerRow?.CustomerName ||
              customerRow?.customer_name ||
              customerRow?.customerName ||
              "";
            const address =
              customerRow?.Address ||
              customerRow?.address ||
              customerRow?.CustomerAddress ||
              "";
            const latitude = normalizeCoordinate(
              customerRow?.Latitude ??
                customerRow?.latitude ??
                customerRow?.Lat ??
                customerRow?.lat
            );
            const longitude = normalizeCoordinate(
              customerRow?.Longitude ??
                customerRow?.longitude ??
                customerRow?.Lon ??
                customerRow?.lon
            );
            const serviceTime =
              customerRow?.ServiceTime ??
              customerRow?.service_time ??
              customerRow?.serviceTime ??
              null;
            const customerTimeWindow =
              customerRow?.CustomerTimeWindow ??
              customerRow?.customer_time_window ??
              customerRow?.customerTimeWindow ??
              null;

            return {
              order: stopIndex + 1,
              customerId: customerRow?.id ?? 0,
              departureTime: customerRow?.start_service
                ? safeMinToHHMM(customerRow.start_service)
                : "--:--",
              arrivalTime: customerRow?.finish_service
                ? safeMinToHHMM(customerRow.finish_service)
                : "--:--",
              customerName,
              address,
              latitude,
              longitude,
              serviceTime,
              customerTimeWindow,
            };
          });

          const stops = allStops
            .filter((stop) => stop.customerId !== 0)
            .map((stop, idx) => ({
              ...stop,
              order: idx + 1,
            }));

          if (stops.length === 0) return null;

          // 👈 اگر قبلاً اسمی برای این راننده داشتیم، همونو نگه دار
          const previousName = prevRoutes[vehicleIndex]?.driverName;

          return {
            driverName: previousName ?? `Driver ${vehicleIndex + 1}`,
            departureTime: "08:00",
            lastDeliveryTime: stops[stops.length - 1]?.arrivalTime || "--:--",
            status: prevRoutes[vehicleIndex]?.status ?? "pending",
            statusText: prevRoutes[vehicleIndex]?.statusText ?? "منتظر",
            stops,
          };
        })
        .filter((route) => route !== null);

      return updatedDriverRoutes as typeof prevRoutes;
    });
  }, [rows, vehs]);

  const handleDriverNameChange = (driverIndex: number, newName: string) => {
    setDriverRoutes((routes) =>
      routes.map((route, idx) =>
        idx === driverIndex ? { ...route, driverName: newName } : route
      )
    );
  };

  const handleSaveDriverAssignments = async () => {
    if (!driverRoutes.length) {
      toast.error("مسیر فعالی برای ذخیره وجود ندارد");
      return;
    }

    type DriverCustomerRecord = {
      customerId: number;
      CustomerName: string;
      Address: string;
      Latitude: number | null;
      Longitude: number | null;
      ServiceTime: string | number | null;
      CustomerTimeWindow: string | null;
    };

    type DriverAssignmentPayload = {
      driverName: string;
      route: number[];
      company: string;
    };

    type DriverPayloadBundle = {
      driverName: string;
      company: string;
      routeIds: number[];
      customers: DriverCustomerRecord[];
    };

    const driverBundles: DriverPayloadBundle[] = driverRoutes
      .map((route, driverIndex) => {
        const stopsWithDetails: DriverCustomerRecord[] = (route?.stops ?? [])
          .map((stop) => {
            const customerId = Number(stop.customerId ?? 0);
            if (!Number.isFinite(customerId) || customerId === 0) {
              return null;
            }

            return {
              customerId,
              CustomerName: stop.customerName || "",
              Address: stop.address || "",
              Latitude: normalizeCoordinate(stop.latitude),
              Longitude: normalizeCoordinate(stop.longitude),
              ServiceTime: stop.serviceTime ?? null,
              CustomerTimeWindow: stop.customerTimeWindow ?? null,
            } as DriverCustomerRecord;
          })
          .filter((stop): stop is DriverCustomerRecord => Boolean(stop));

        if (!stopsWithDetails.length) return null;

        return {
          driverName: route?.driverName || `Driver ${driverIndex + 1}`,
          company: "Milanpars Pharmed",
          routeIds: stopsWithDetails.map((stop) => stop.customerId),
          customers: stopsWithDetails,
        };
      })
      .filter((bundle): bundle is DriverPayloadBundle => Boolean(bundle));

    const assignments: DriverAssignmentPayload[] = driverBundles.map(
      (bundle) => ({
        driverName: bundle.driverName,
        route: bundle.routeIds,
        company: bundle.company,
      })
    );

    const flattenedCustomers: DriverCustomerRecord[] = driverBundles.flatMap(
      (bundle) => bundle.customers
    );

    const customerDetailsPayload = {
      company: "Milanpars Pharmed",
      customers: flattenedCustomers,
    };

    if (!assignments.length) {
      toast.error("هیچ مسیری برای ارسال به سرور یافت نشد");
      return;
    }
    // console.log("Assignments to be sent:", assignments);
    console.log("Customer details to be sent:", customerDetailsPayload);

    try {
      setIsSavingAssignments(true);
      await api.post("/api/map/driver-assignments", assignments );

      if (customerDetailsPayload.customers.length) {
        await api.post("/api/customers", customerDetailsPayload);
      }
      toast.success("تخصیص راننده ها با موفقیت ذخیره شد");
    } catch (err) {
      console.error("Failed to save driver assignments", err);
      toast.error("خطا در ذخیره تخصیص راننده ها");
    } finally {
      setIsSavingAssignments(false);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    console.log("Drag started. Active ID:", active.id);
    setActiveId(active.id);

    const activeData = active.data.current;
    console.log("Active data on drag start:", activeData);
    if (activeData) {
      const route = driverRoutes[activeData.driverIndex];
      if (route) {
        console.log("Setting activeStop:", route.stops[activeData.stopIndex]);
        setActiveStop(route.stops[activeData.stopIndex]);
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log("Drag ended. Active ID:", active.id, "Over ID:", over?.id);
    setActiveId(null);
    setActiveStop(null);

    if (!over || active.id === over.id) {
      console.log("No valid drop target or dropped on itself. Exiting.");
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log("Active data on drag end:", activeData);
    console.log("Over data on drag end:", overData);

    if (!activeData || !overData) {
      console.log("Missing active or over data. Exiting.");
      return;
    }

    const activeDriverIndex = activeData.driverIndex;
    const activeStopIndex = activeData.stopIndex;
    const overDriverIndex = overData.driverIndex;
    const overStopIndex = overData.stopIndex;

    console.log(
      `Moving stop from driver ${activeDriverIndex}, index ${activeStopIndex} to driver ${overDriverIndex}, index ${overStopIndex}`
    );

    setDriverRoutes((routes) => {
      const newRoutes = [...routes];

      if (activeDriverIndex === overDriverIndex) {
        // Reorder within the same driver
        const stops = [...newRoutes[activeDriverIndex].stops];
        const [movedStop] = stops.splice(activeStopIndex, 1); // Remove the dragged stop
        stops.splice(overStopIndex, 0, movedStop); // Insert it at the target position

        // Update order numbers
        stops.forEach((stop, idx) => {
          stop.order = idx + 1;
        });

        newRoutes[activeDriverIndex] = {
          ...newRoutes[activeDriverIndex],
          stops,
        };
        console.log("Reordered stops within the same driver:", stops);
      } else {
        // Move between drivers
        const sourceStops = [...newRoutes[activeDriverIndex].stops];
        const destStops = [...newRoutes[overDriverIndex].stops];

        const [movedStop] = sourceStops.splice(activeStopIndex, 1); // Remove the dragged stop
        destStops.splice(overStopIndex, 0, movedStop); // Insert it at the target position

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
        console.log("Moved stop between drivers.");
        console.log("Source stops after move:", sourceStops);
        console.log("Destination stops after move:", destStops);
      }

      console.log("Updated driverRoutes after drag end:", newRoutes);
      return newRoutes;
    });
  };

  // Example usage:
  if (loading) return <div>Loading seed data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto px-4">
        <VRPMap />
      </div>

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

              const filteredRoutes = driverRoutes
                .map((route) => {
                  // Filter out stops with customerId === 0
                  const validStops = route.stops.filter((stop) => {
                    // console.log(`Checking stop: ${JSON.stringify(stop)}`); // Log each stop
                    return stop.customerId !== 0; // Keep only valid stops
                  });

                  // Re-number the orders after filtering to start from 1
                  const reorderedStops = validStops.map((stop, idx) => ({
                    ...stop,
                    order: idx + 1,
                  }));

                  // console.log(`Route "${route.driverName}" valid stops:`, validStops);

                  return {
                    ...route,
                    stops: reorderedStops, // Replace stops with reordered stops
                  };
                })
                .filter((route) => route.stops.length > 0); // Keep only routes with valid stops

              // console.log("Filtered Routes (excluding stops with id 0):", JSON.stringify(filteredRoutes, null, 2)); // Log the filtered routes

              return driverRoutes.map((route, driverIndex) => (
                <div key={driverIndex} className="flex-shrink-0 w-48">
                  <SortableContext
                    items={route.stops.map((_, stopIndex) => `${driverIndex}-${stopIndex}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DriverRouteCard
                      driverName={route.driverName}
                      departureTime={route.departureTime}
                      lastDeliveryTime={route.lastDeliveryTime}
                      status={route.status}
                      statusText={route.statusText}
                      stops={route.stops}
                      driverIndex={driverIndex}
                      onDriverNameChange={(newName) =>
                        handleDriverNameChange(driverIndex, newName)
                      }
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
                      <span className="text-[9px] text-muted-foreground">
                        شناسه:
                      </span>
                      <span className="font-mono font-medium text-[10px]">
                        {activeStop.customerId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">
                        حرکت:
                      </span>
                      <span className="font-medium text-[10px]">
                        {activeStop.departureTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">
                        رسیدن:
                      </span>
                      <span className="font-medium text-[10px]">
                        {activeStop.arrivalTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start">
          <Button className="sm:min-w-[170px] gap-2">
            <RefreshCw className="h-4 w-4" />
            اعمال تغییرات مسیر
          </Button>
          <Button
            variant="outline"
            className="sm:min-w-[170px] gap-2"
            onClick={handleSaveDriverAssignments}
            disabled={isSavingAssignments}
          >
            <Save className="h-4 w-4" />
            {isSavingAssignments ? "در حال ذخیره..." : "ذخیره تخصیص راننده ها"}
          </Button>
          <Button variant="outline" className="sm:min-w-[170px] gap-2">
            <BarChart3 className="h-4 w-4" />
            مشاهده آمار
          </Button>
        </div>
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
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  } catch {
    return "--:--";
  }
}

export default Dashboard;

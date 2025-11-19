import { supabase } from "@/lib/supabaseClient";
import {
  DRIVER_VEHICLE_TABLE,
  DriverRoute,
  DriverRouteStop,
  normalizeRoute,
} from "@/lib/driverSession";

const CUSTOMERS_TABLE = "Customers";

const toNumberOrNull = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildStopsFromIds = (
  routeIds: number[],
  customerLookup: Map<number, any>
): DriverRouteStop[] =>
  routeIds.map((customerId, index) => {
    const customer = customerLookup.get(customerId) ?? {};

    return {
      id: customerId,
      order: index + 1,
      customerName: customer.CustomerName || `مشتری ${customerId}`,
      address: customer.Address || "",
      latitude: toNumberOrNull(customer.Latitude),
      longitude: toNumberOrNull(customer.Longitude),
      serviceTime:
        customer.ServiceTime !== undefined ? customer.ServiceTime : null,
      customerTimeWindow:
        customer.CustomerTimeWindow !== undefined
          ? customer.CustomerTimeWindow
          : null,
    } as DriverRouteStop;
  });

export const fetchDriverRoutesWithCustomerDetails = async (
  driverEmail: string,
  company: string
): Promise<DriverRoute[]> => {
  const { data: driverRows, error: driverError } = await supabase
    .from(DRIVER_VEHICLE_TABLE)
    .select('id, route, "driver-email"')
    .eq("driver-email", driverEmail)
    .eq("company", company);

  if (driverError) {
    throw driverError;
  }

  const routeRecords = (driverRows ?? []).map((row, idx) => {
    const routeIds = normalizeRoute(row?.route) 
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value !== 0) as number[];

    return {
      row,
      idx,
      routeIds,
    };
  });

  const uniqueCustomerIds = Array.from(
    new Set(routeRecords.flatMap((record) => record.routeIds))
  );

  const customersLookup = new Map<number, any>();

  if (uniqueCustomerIds.length) {
    const { data: customers, error: customersError } = await supabase
      .from(CUSTOMERS_TABLE)
      .select(
        "id, CustomerName, Address, Latitude, Longitude, ServiceTime, CustomerTimeWindow"
      )
      .in("id", uniqueCustomerIds);

    if (customersError) {
      throw customersError;
    }

    (customers ?? []).forEach((customer) => {
      if (customer?.id !== undefined && customer?.id !== null) {
        customersLookup.set(Number(customer.id), customer);
      }
    });
  }

  const formattedRoutes: DriverRoute[] = routeRecords.map((record) => {
    const stops = buildStopsFromIds(record.routeIds, customersLookup);

    return {
      id: record.row?.id ?? record.idx,
      name: record.row?.["driver-email"] ?? `مسیر ${record.idx + 1}`,
      departure: "--:--",
      arrival: "--:--",
      status: "در انتظار",
      stops,
    };
  });

  return formattedRoutes;
};

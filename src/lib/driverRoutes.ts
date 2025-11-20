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
  console.log("[driverRoutes] Fetching routes", { driverEmail, company });

  const vehicleTables = Array.from(
    new Set([DRIVER_VEHICLE_TABLE, "Vehicle", "Vehicle"])
  ).filter(Boolean);
  // const vehicleTables = "Vehicle";

  let driverRows: any[] | null = null;
  let usedVehicleTable: string | null = null;
  let lastError: unknown = null;

  for (const tableName of vehicleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("id, route, driver_email")
        .eq("driver_email", driverEmail)
        .eq("company", company);

      if (error) {
        lastError = error;
        console.warn(
          "[driverRoutes] Query failed for table", tableName,
          error
        );
        continue;
      }

      driverRows = data ?? [];
      usedVehicleTable = tableName;
      console.log(
        "[driverRoutes] Vehicle rows response",
        tableName,
        driverRows
      );
      if (driverRows.length) {
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn("[driverRoutes] Unexpected error for table", tableName, err);
    }
  }

  if (!driverRows) {
    if (lastError) {
      throw lastError;
    }
    driverRows = [];
  }

  if (!usedVehicleTable) {
    console.warn(
      "[driverRoutes] No vehicle table returned data",
      vehicleTables
    );
  } else {
    console.log("[driverRoutes] Using vehicle table", usedVehicleTable);
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

  console.log("[driverRoutes] Unique customer IDs", uniqueCustomerIds);

  const customersLookup = new Map<number, any>();

  if (uniqueCustomerIds.length) {
    const { data: customers, error: customersError } = await supabase
      .from(CUSTOMERS_TABLE)
      .select(
        "id, CustomerName, Address, Latitude, Longitude, ServiceTime, CustomerTimeWindow"
      )
      .in("id", uniqueCustomerIds);

    if (customersError) {
      console.error(
        "[driverRoutes] Supabase error while fetching customers",
        customersError
      );
      throw customersError;
    }

    console.log("[driverRoutes] Customer rows response", customers);

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
      name: record.row?.driver_email ?? `مسیر ${record.idx + 1}`,
      departure: "--:--",
      arrival: "--:--",
      status: "در انتظار",
      stops,
    };
  });

  console.log("[driverRoutes] Formatted routes result", formattedRoutes);

  return formattedRoutes;
};

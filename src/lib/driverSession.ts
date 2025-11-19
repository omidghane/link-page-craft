export const USERS_TABLE = "users";
export const DRIVER_VEHICLE_TABLE = "Vehicle";
export const DRIVER_ROUTES_STORAGE_KEY = "driverDashboardRoutes";
export const DRIVER_PROFILE_STORAGE_KEY = "driverDashboardProfile";

export type DriverProfile = {
  email: string;
  company: string;
};

export type DriverRouteStop = {
  id: number;
  order: number;
  customerName: string;
  address?: string;
  latitude: number | null;
  longitude: number | null;
  serviceTime?: string | number | null;
  customerTimeWindow?: string | null;
};

export type DriverRoute = {
  id: number | string;
  name: string;
  departure: string;
  arrival: string;
  status: string;
  stops: DriverRouteStop[];
};

export const normalizeRoute = (value: unknown): (string | number)[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Failed to parse driver route", error);
    }
  }
  return [];
};

export const persistDriverSession = (
  profile: DriverProfile,
  routes: DriverRoute[]
) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    DRIVER_ROUTES_STORAGE_KEY,
    JSON.stringify(routes)
  );
  sessionStorage.setItem(
    DRIVER_PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
};

export const clearDriverSession = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRIVER_ROUTES_STORAGE_KEY);
  sessionStorage.removeItem(DRIVER_PROFILE_STORAGE_KEY);
};

export const readDriverSession = () => {
  if (typeof window === "undefined") {
    return { routes: [], profile: null };
  }
  try {
    const rawRoutes = sessionStorage.getItem(DRIVER_ROUTES_STORAGE_KEY);
    const rawProfile = sessionStorage.getItem(DRIVER_PROFILE_STORAGE_KEY);

    return {
      routes: rawRoutes ? (JSON.parse(rawRoutes) as DriverRoute[]) : [],
      profile: rawProfile
        ? (JSON.parse(rawProfile) as DriverProfile)
        : null,
    };
  } catch (error) {
    console.error("Failed to parse stored driver session", error);
    return { routes: [], profile: null };
  }
};

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  Clock3,
  MapPin,
  Navigation2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  USERS_TABLE,
  DriverRoute,
  DriverProfile,
  readDriverSession,
  persistDriverSession,
  clearDriverSession,
} from "@/lib/driverSession";
import { fetchDriverRoutesWithCustomerDetails } from "@/lib/driverRoutes";

const VRPMap = React.lazy(() => import("@/components/VRPMap"));

type LocationState = {
  driverRoutes?: DriverRoute[];
  driverProfile?: DriverProfile;
} | null;

const formatStopLabel = (stop: DriverRoute["stops"][number]) =>
  stop.customerName || `شناسه مشتری ${stop.id}`;

const DriverDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSession = readDriverSession();
  const locationState = (location.state as LocationState) ?? null;

  const initialRoutes = locationState?.driverRoutes ?? initialSession.routes;
  const initialProfile =
    locationState?.driverProfile ?? initialSession.profile;

  const [routes, setRoutes] = useState<DriverRoute[]>(initialRoutes);
  const [profile, setProfile] = useState<DriverProfile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialRoutes.length);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location.state) return;
    const statePayload = location.state as LocationState;
    if (statePayload?.driverRoutes?.length) {
      setRoutes(statePayload.driverRoutes);
      if (statePayload.driverProfile) {
        setProfile(statePayload.driverProfile);
        persistDriverSession(
          statePayload.driverProfile,
          statePayload.driverRoutes
        );
      }
      setLoading(false);
    }
  }, [location.state]);

  const loadRoutes = useCallback(
    async (showInitialSpinner = false) => {
      if (showInitialSpinner) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        setError(null);
        const { data: authResult, error: authError } = await supabase.auth.getUser();
        if (authError || !authResult?.user?.email) {
          toast.error("لطفاً دوباره وارد شوید");
          clearDriverSession();
          navigate("/login");
          return;
        }

        const signedInEmail = authResult.user.email;

        const { data: userProfile, error: profileError } = await supabase
          .from(USERS_TABLE)
          .select("role, company")
          .eq("email", signedInEmail)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            profileError.message || "خطا در دریافت اطلاعات کاربر"
          );
        }

        if ((userProfile?.role ?? "").toLowerCase() !== "driver") {
          toast.info("این صفحه مخصوص رانندگان است");
          clearDriverSession();
          navigate("/upload-customer");
          return;
        }

        if (!userProfile?.company) {
          throw new Error("شرکت مرتبط با راننده یافت نشد");
        }

        console.log("[DriverDashboard] Loading routes for", signedInEmail);
        const formattedRoutes = await fetchDriverRoutesWithCustomerDetails(
          signedInEmail,
          userProfile.company
        );
        console.log("[DriverDashboard] Routes fetched", formattedRoutes);

        const driverProfilePayload: DriverProfile = {
          email: signedInEmail,
          company: userProfile.company,
        };

        setRoutes(formattedRoutes);
        setProfile(driverProfilePayload);
        persistDriverSession(driverProfilePayload, formattedRoutes);
      } catch (fetchError) {
        console.error("Failed to load driver dashboard", fetchError);
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "بارگیری داده‌ها با خطا مواجه شد";
        setError(message);
        toast.error(message);
      } finally {
        if (showInitialSpinner) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!routes.length) {
      loadRoutes(true);
    } else {
      setLoading(false);
    }
  }, [routes.length, loadRoutes]);

  const totalStops = useMemo(
    () => routes.reduce((acc, route) => acc + (route.stops?.length ?? 0), 0),
    [routes]
  );

  const activeRoutes = useMemo(
    () => routes.filter((route) => route.status !== "complete").length,
    [routes]
  );

  const handleRefresh = () => {
    loadRoutes(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">داشبورد راننده</p>
              <h1 className="text-2xl font-bold text-foreground">
                خوش آمدید{profile?.email ? `، ${profile.email}` : ""}
              </h1>
              {profile?.company && (
                <p className="text-sm text-muted-foreground">
                  شرکت: {profile.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/upload-customer")}
              className="border-dashed">
              به داشبورد مدیر
            </Button>
            <Button
              variant="default"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              بروزرسانی مسیرها
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/70 border-border">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">مسیرهای فعال</p>
              <CardTitle className="text-2xl">{routes.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                تعداد مسیرهایی که برای شما برنامه ریزی شده است
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/70 border-border">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">کل ایستگاه ها</p>
              <CardTitle className="text-2xl">{totalStops}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                مجموع مشتریانی که امروز باید پوشش دهید
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/70 border-border">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">مسیرهای در انتظار</p>
              <CardTitle className="text-2xl">{activeRoutes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                مسیرهایی که هنوز در حال اجرا هستند
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin ml-2" />
            در حال بارگذاری مسیرهای شما...
          </div>
        ) : routes.length ? (
          <div className="space-y-6 mb-10">
            {routes.map((route) => (
              <Card key={route.id} className="border-border">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">{route.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {profile?.company || "مسیر اختصاصی"}
                    </p>
                  </div>
                  <Badge className="capitalize">
                    {route.status || "در انتظار"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <div>
                        <p>شروع</p>
                        <p className="font-medium text-foreground">
                          {route.departure}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation2 className="h-4 w-4 text-primary" />
                      <div>
                        <p>پایان</p>
                        <p className="font-medium text-foreground">
                          {route.arrival}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p>مقاصد</p>
                        <p className="font-medium text-foreground">
                          {route.stops?.length ?? 0} توقف
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                      لیست ایستگاه ها
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {route.stops?.length ? (
                        route.stops.map((stop) => (
                          <div
                            key={`${route.id}-${stop.id}`}
                            className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card/60 p-4 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                {stop.order}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">
                                  {formatStopLabel(stop)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {stop.address || "بدون آدرس ثبت شده"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                              {stop.latitude !== null && stop.longitude !== null ? (
                                <a
                                  href={`https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  مشاهده روی نقشه ({stop.latitude}, {stop.longitude})
                                </a>
                              ) : (
                                <span>مختصات ثبت نشده</span>
                              )}
                              <span>
                                Service: {stop.serviceTime ?? "نامشخص"}
                              </span>
                              <span>
                                Window: {stop.customerTimeWindow ?? "--"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          مسیری برای این راننده ثبت نشده است.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mb-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              مسیری برای شما ثبت نشده است
            </p>
            <p className="text-sm text-muted-foreground">
              به محض اختصاص مسیر، لیست مسیرها در این بخش نمایش داده خواهد شد.
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">نمایش نقشه</p>
              <h2 className="text-xl font-semibold">مسیریابی زنده</h2>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                در حال بارگذاری نقشه...
              </div>
            }
          >
            {/* <div className="h-[420px] rounded-xl overflow-hidden border border-border bg-muted/30">
              <VRPMap />
            </div> */}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

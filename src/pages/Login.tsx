import { FormEvent, useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient"; // ✅ new import
import {
  USERS_TABLE,
  persistDriverSession,
  clearDriverSession,
} from "@/lib/driverSession";
import { fetchDriverRoutesWithCustomerDetails } from "@/lib/driverRoutes";
import delinexLogo from "@/assets/delinex-logo2.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "خطا در ورود");
        return;
      }

      if (!data.session) {
        toast.error("ورود ناموفق. لطفاً دوباره تلاش کنید.");
        return;
      }

      const signedInEmail = data.user?.email ?? email;
      if (!signedInEmail) {
        toast.error("ایمیل کاربر یافت نشد");
        return;
      }

      const { data: userProfile, error: userProfileError } = await supabase
        .from(USERS_TABLE)
        .select("role, company")
        .eq("email", signedInEmail)
        .maybeSingle();

      if (userProfileError) {
        console.error("Failed to fetch user profile", userProfileError);
        toast.error("امکان دریافت مشخصات کاربر وجود ندارد");
      }

      const normalizedRole = (userProfile?.role ?? "").toLowerCase();

      if (normalizedRole === "driver") {
        if (!userProfile?.company) {
          toast.error("شرکت مرتبط با راننده یافت نشد");
          return;
        }

        let formattedRoutes;
        try {
          formattedRoutes = await fetchDriverRoutesWithCustomerDetails(
            signedInEmail,
            userProfile.company
          );
        } catch (routeError) {
          console.error("Failed to build driver routes", routeError);
          toast.error("امکان دریافت مسیرهای راننده وجود ندارد");
          return;
        }

        const driverProfilePayload = {
          email: signedInEmail,
          company: userProfile.company,
        };

        persistDriverSession(driverProfilePayload, formattedRoutes);

        toast.success("ورود موفق!");
        navigate("/driver-dashboard", {
          state: {
            driverRoutes: formattedRoutes,
            driverProfile: driverProfilePayload,
          },
          replace: true,
        });
        return;
      }

      clearDriverSession();
      toast.success("ورود موفق!");
      navigate("/upload-customer");
    } catch (err) {
      console.error(err);
      toast.error("خطای غیرمنتظره. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
          // emailRedirectTo: "http://localhost:3000" // if you want email confirmation redirect
        },
      });

      if (error) {
        toast.error(error.message || "خطا در ثبت‌نام");
        return;
      }

      // depending on your GOTRUE_MAILER_AUTOCONFIRM, user may need to confirm email
      if (data.user && !data.session) {
        toast.success("ثبت‌نام موفق! لطفاً ایمیل خود را تأیید کنید.");
      } else {
        toast.success("ثبت‌نام موفق!");
        navigate("/upload-customer");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطای غیرمنتظره در ثبت‌نام.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            {/* <div className="bg-primary rounded-xl p-3 mb-4">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div> */}
            <img
              src={delinexLogo}
              alt="Delinex Logo"
              className="h-12 w-auto object-contain mx-auto drop-shadow"
            />
            <h1 className="text-2xl font-bold text-primary">Delinex</h1>
          </div>

          <Tabs defaultValue="login" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">ورود</TabsTrigger>
              <TabsTrigger value="signup">ثبت نام</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">ورود به سیستم</h2>
                <p className="text-sm text-muted-foreground">
                  لطفاً اطلاعات خود را وارد کنید
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="رمز عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading ? "در حال ورود..." : "ورود"}
                </Button>

                <div className="text-center">
                  <Link to="#" className="text-sm text-primary hover:underline">
                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">ثبت نام</h2>
                <p className="text-sm text-muted-foreground">
                  حساب کاربری جدید ایجاد کنید
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="نام کامل خود را وارد کنید"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">ایمیل</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">رمز عبور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="رمز عبور را انتخاب کنید"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading ? "در حال ثبت نام..." : "ثبت نام"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;

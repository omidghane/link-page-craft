import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ورود موفق!");
    navigate("/upload-customer");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ثبت‌نام موفق!");
    navigate("/upload-customer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary rounded-xl p-3 mb-4">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Delinex</h1>
          </div>

          <Tabs defaultValue="login" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">ورود</TabsTrigger>
              <TabsTrigger value="signup">ثبت نام</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">ورود به سیستم</h2>
                <p className="text-sm text-muted-foreground">لطفاً اطلاعات خود را به Delinex امید</p>
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

                <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                  ورود
                </Button>

                <div className="text-center">
                  <Link to="#" className="text-sm text-primary hover:underline">
                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">ثبت نام</h2>
                <p className="text-sm text-muted-foreground">حساب کاربری جدید ایجاد کنید</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="نام کامل خود را وارد کنید"
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
                    required
                    className="text-right"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                  ثبت نام
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

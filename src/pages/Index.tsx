import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Gauge, DollarSign, Zap, CheckCircle } from "lucide-react";
import worldMap from "@/assets/world-map.png";
import parkingGarage from "@/assets/parking-garage.png";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-primary">Delinex:</span> لوجستیک هوشمند با مسیرهای بهینه با قدرت هوش مصنوعی
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                فرایند تحویل شما را خودکار کنید، زمان بخش، پول بخش، پول و دوره و پول در تخریب و پوشش و بوش در تخریب، شخص بخش های کاش می ماند.
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary-hover px-8 text-center font-normal text-lg mx-0">
                  شروع کنید
                </Button>
              </Link>
            </div>
            
            <div className="relative animate-fade-in">
              <img src={worldMap} alt="Global logistics network" className="rounded-2xl shadow-2xl w-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ویژگی‌های کلیدی Delinex</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Gauge} title="بهینه‌سازی مسیر با هوش مصنوعی" description="با قرارگیری بهترین مسیرهای تحویل براکی کمترین سوخت و زمان را مصرف کنید." />
            <FeatureCard icon={Clock} title="ردیابی لحظه" description="دسترسی لحظه‌ای به محموله های خود برای مدیریت و برنامه‌ریزی بهتر." />
            <FeatureCard icon={TrendingUp} title="تجزیه و تحلیل عملکرد" description="داشبورد تحلیلی پیشرفته برای درک بهتر عملکرد و بهبود مداوم." />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img src={parkingGarage} alt="Delivery operations" className="rounded-2xl shadow-xl w-full" />
              </div>
              
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl font-bold">مزایای استفاده از Delinex</h2>
                <p className="text-muted-foreground leading-relaxed">
                  بیش از یک ابزار، لوجستیک هوشمند می‌سواند یا کارشد استارت و برنامه شما برنامه Delinex مستانه برنامه کارساستاری استاری است.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">کاهش هزینه‌های عملیاتی</h3>
                      <p className="text-sm text-muted-foreground">هزینه‌های سوخت و زمان سرویس‌دهی با مسیریابی بهینه</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">افزایش سرعت تحویل</h3>
                      <p className="text-sm text-muted-foreground">تحویل سریع‌تر با مسیرهای بهینه و بهبود رضایت مشتریان</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">مدیریت ساده‌تر و هوشمندتر</h3>
                      <p className="text-sm text-muted-foreground">ابزار مدیریتی جامع برای کنترل کامل فرایند لجستیک</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">آنچه مشتریان ما می‌گویند</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <TestimonialCard name="مسعود فلاحی" role="مدیر عامل شرکت حمل‌ونقل بیز" content="سیستم ردیابی تسریع شده و ادامی، استفاده مشتری، بهره Delinex استفاده کرد، رسپونش نتیجه مشکل Delinex استارتگاه استانه است. ابزار ضروری برای هر کسب و کاری در این صنعت" />
            <TestimonialCard name="فاطمه کریمی" role="مدیر لجستیک و پخش" content="قبل از استفاده از Delinex، کارها پراکنده و پر از نواقص بود. حالا با سیستم یکپارچه آنها، همه چیز تحت کنترل است." />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">آماده‌اید تا لجستیک خود را متحول کنید؟</h2>
            <p className="text-lg mb-8 opacity-90">
              لطفاً تحت در سیستام، ثابت Delinex به
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                اکنون شروع کنید
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Index;
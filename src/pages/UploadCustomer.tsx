import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import delinexLogo from "@/assets/delinex-logo.png";

const UploadCustomer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    depotLatitude: "",
    depotLongitude: "",
    startTime: "08:00",
    finishTime: "20:00",
    maxCapacity: "",
    numVehicles: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("لطفاً یک فایل اکسل انتخاب کنید");
      return;
    }

    if (!formData.depotLatitude || !formData.depotLongitude || !formData.maxCapacity) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    localStorage.setItem(
      "depotLocation",
      JSON.stringify({
        latitude: parseFloat(formData.depotLatitude),
        longitude: parseFloat(formData.depotLongitude),
      })
    );

    // Process the upload
    toast.success("اطلاعات مشتری با موفقیت بارگذاری شد!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-lg shadow-2xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={delinexLogo} alt="Delinex Logo" className="h-24 mx-auto mb-2" />
            <p className="text-muted-foreground italic">Next Generation of Logistics</p>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">بارگذاری فایل اکسل مشتریان</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Excel File Upload */}
            <div className="space-y-2">
              <Label htmlFor="excel-file" className="text-base font-semibold">
                فایل اکسل:
              </Label>
              <div className="flex items-center gap-3">
                <label htmlFor="excel-file" className="cursor-pointer">
                  <div className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors border border-input">
                    انتخاب فایل...
                  </div>
                  <input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-muted-foreground flex-1 px-4 py-2 border border-input rounded-md bg-background">
                  {file ? file.name : "فایلی انتخاب نشده است"}
                </span>
              </div>
            </div>

            {/* Depot Latitude */}
            <div className="space-y-2">
              <Label htmlFor="depotLatitude" className="text-base font-semibold">
                عرض جغرافیایی انبار:
              </Label>
              <Input
                id="depotLatitude"
                name="depotLatitude"
                type="number"
                step="any"
                value={formData.depotLatitude}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            {/* Depot Longitude */}
            <div className="space-y-2">
              <Label htmlFor="depotLongitude" className="text-base font-semibold">
                طول جغرافیایی انبار:
              </Label>
              <Input
                id="depotLongitude"
                name="depotLongitude"
                type="number"
                step="any"
                value={formData.depotLongitude}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-base font-semibold">
                زمان شروع:
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            {/* Finish Time */}
            <div className="space-y-2">
              <Label htmlFor="finishTime" className="text-base font-semibold">
                زمان پایان:
              </Label>
              <Input
                id="finishTime"
                name="finishTime"
                type="time"
                value={formData.finishTime}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            {/* Maximum Capacity per Vehicle */}
            <div className="space-y-2">
              <Label htmlFor="maxCapacity" className="text-base font-semibold">
                حداکثر ظرفیت هر خودرو:
              </Label>
              <Input
                id="maxCapacity"
                name="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            {/* Number of Vehicles */}
            <div className="space-y-2">
              <Label htmlFor="numVehicles" className="text-base font-semibold">
                تعداد خودروها (اختیاری):
              </Label>
              <Input
                id="numVehicles"
                name="numVehicles"
                type="number"
                value={formData.numVehicles}
                onChange={handleInputChange}
                placeholder="برای حالت خودکار خالی بگذارید"
                className="h-12"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              <Upload className="ml-2 h-5 w-5" />
              بارگذاری
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadCustomer;
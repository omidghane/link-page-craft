import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import delinexLogo from "@/assets/delinex-logo.jpg";
import { api } from "@/lib/api";
import { Console } from "console";

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

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("لطفاً یک فایل اکسل انتخاب کنید");
      return;
    }

    try {
      const data = await parseExcelFile(file);
      console.log(data);
      localStorage.setItem("uploadedExcelData", JSON.stringify(data));
      navigate("/excel-preview");
    } catch (error) {
      toast.error("خطا در خواندن فایل اکسل");
    }
  }; 

  const handleRunModel = async () => {
    if (!file) {
      toast.error("لطفاً یک فایل اکسل انتخاب کنید");
      return;
    }

    if (!formData.depotLatitude || !formData.depotLongitude || !formData.maxCapacity) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      const data = await parseExcelFile(file);
      console.log(data);
      localStorage.setItem("uploadedExcelData", JSON.stringify(data));
      
      localStorage.setItem(
        "depotLocation",
        JSON.stringify({
          latitude: parseFloat(formData.depotLatitude),
          longitude: parseFloat(formData.depotLongitude),
        })
      );

      const params = {
        depotLatitude: parseFloat(formData.depotLatitude),
        depotLongitude: parseFloat(formData.depotLongitude),
        startTime: formData.startTime,
        finishTime: formData.finishTime,
        maxCapacity: Number(formData.maxCapacity),
        ...(formData.numVehicles
          ? { numVehicles: Number(formData.numVehicles) }
          : {}),
      };
      console.log("Request Params:", params);
      const res = await api.post("/api/map/seed", params);
      
      const { df, vehicles } = res.data;
      
      localStorage.setItem("seedDf", JSON.stringify(df));
      localStorage.setItem("seedVehicles", JSON.stringify(vehicles));
      console.log("API Response:", df);

      toast.success("اطلاعات مشتری با موفقیت بارگذاری شد!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("خطا در پردازش فایل اکسل");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-lg shadow-2xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={delinexLogo} alt="Delinex Logo" className="h-24 mx-auto mb-2" />
            {/* <p className="text-muted-foreground italic">Next Generation of Logistics</p> */}
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">بارگذاری فایل اکسل مشتریان</h2>

          <div className="space-y-6">
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                onClick={handlePreview}
                variant="outline"
                className="h-14 text-lg font-semibold"
                size="lg"
              >
                <Eye className="ml-2 h-5 w-5" />
                پیش‌نمایش فایل
              </Button>
              <Button
                type="button"
                onClick={handleRunModel}
                className="h-14 text-lg font-semibold"
                size="lg"
              >
                <Play className="ml-2 h-5 w-5" />
                اجرای مدل
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCustomer;
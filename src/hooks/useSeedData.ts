// hooks/useSeedData.ts
import { set } from "date-fns";
import { useEffect, useState } from "react";

export const useSeedData = () => {
  const [rows, setRows] = useState<any[] | null>(null);
  const [vehs, setVehs] = useState<any[] | null>(null);
  const [uploadedExcelData, setUploadedExcelData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1) اول از localStorage بخوان
        const storedDf = localStorage.getItem("seedDf");
        const uploadedExcelData = localStorage.getItem("uploadedExcelData");
        const storedVehicles = localStorage.getItem("seedVehicles");

        if (storedDf && storedVehicles && uploadedExcelData) {
          setRows(JSON.parse(storedDf));
          setVehs(JSON.parse(storedVehicles));
          setUploadedExcelData(JSON.parse(uploadedExcelData));
          setLoading(false);
          return;
        }

        // 2) اگر چیزی در localStorage نبود، می‌توانی:
        //    - یا ارور بدهی که اول باید فایل را آپلود کنند
        //    - یا fallback: API را صدا بزنی
        // من هر دو حالت را نشان می‌دهم:

        // ❌ حالت فقط ارور:
        setError("No seed data found. Please upload customers file first.");
        setLoading(false);

        // ✅ اگر می‌خواهی fallback کنی، این بخش را باز کن:
        /*
        const res = await api.get("/api/map/seed");
        const { df, vehicles } = res.data;
        setRows(df);
        setVehs(vehicles);
        localStorage.setItem("seedDf", JSON.stringify(df));
        localStorage.setItem("seedVehicles", JSON.stringify(vehicles));
        setLoading(false);
        */
      } catch (err) {
        console.error(err);
        setError("Failed to load seed data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { rows, vehs, uploadedExcelData, loading, error };
};

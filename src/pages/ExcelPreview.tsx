import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import delinexLogo from "@/assets/delinex-logo2.jpg";

const ExcelPreview = () => {
  const navigate = useNavigate();
  const [excelData, setExcelData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("uploadedExcelData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.length > 0) {
        setHeaders(Object.keys(parsedData[0]));
        setExcelData(parsedData);
      }
    } else {
      navigate("/upload-customer");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={delinexLogo}
              alt="Delinex Logo"
              className="h-12 w-auto object-contain mx-auto drop-shadow"
            />
            <h1 className="text-3xl font-bold">پیش‌نمایش فایل اکسل</h1>
          </div>
          <Button onClick={() => navigate("/upload-customer")} variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            بازگشت
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg shadow-xl border border-border overflow-hidden">
          <ScrollArea className="h-[calc(100vh-200px)] w-full">
            <div className="w-max min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="font-bold text-center whitespace-nowrap px-4 min-w-[150px]">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header, cellIndex) => (
                        <TableCell key={cellIndex} className="text-center whitespace-nowrap px-4 min-w-[150px]">
                          {row[header] !== null && row[header] !== undefined ? String(row[header]) : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-4 justify-center">
          <div className="bg-card px-6 py-3 rounded-lg border border-border">
            <span className="text-muted-foreground ml-2">تعداد سطرها:</span>
            <span className="font-bold text-lg">{excelData.length}</span>
          </div>
          <div className="bg-card px-6 py-3 rounded-lg border border-border">
            <span className="text-muted-foreground ml-2">تعداد ستون‌ها:</span>
            <span className="font-bold text-lg">{headers.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;

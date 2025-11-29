"use client";

import { useState, useEffect, useMemo } from "react";
// 1. Import pdfjs to configure the worker
import { Document, Page, pdfjs } from "react-pdf";
import * as XLSX from "xlsx";

// 2. Import standard styles for react-pdf so text selection works
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 3. Configure the worker (CRITICAL STEP)
// This points to the worker file hosted on a CDN matching your installed version
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  `pdfjs-dist/build/pdf.worker.min.mjs`,
  import.meta.url,
).toString();

type Props = {
  file: File;
};

export const FilePreview = ({ file }: Props) => {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [numPages, setNumPages] = useState<number>();
  
  // Use CreateObjectURL for PDF to avoid memory issues and ensure loading
  const fileUrl = useMemo(() => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  const mime = file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();

  const isPDF = mime === "application/pdf" || ext === "pdf";
  const isExcel =
    mime.includes("sheet") ||
    mime.includes("excel") ||
    ext === "xlsx" ||
    ext === "xls" || 
    ext === "csv";

  // --- Parse Excel file ---
  useEffect(() => {
    if (!isExcel) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Parse data
      const json = XLSX.utils.sheet_to_json(sheet);
      
      if (json.length > 0) {
        // Extract headers from the first row to ensure column alignment
        const headers = Object.keys(json[0] as object);
        setExcelHeaders(headers);
        setExcelData(json);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file, isExcel]);

  if (isPDF && fileUrl) {
    return (
      <div className="w-full h-screen overflow-auto border p-2 bg-gray-100 flex justify-center">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex flex-col gap-4"
          loading={<p>Loading PDF...</p>}
          error={<p className="text-red-500">Failed to load PDF.</p>}
        >
          {Array.from(new Array(numPages), (_, i) => (
            <Page 
              key={i} 
              pageNumber={i + 1} 
              // Set a width to prevent massive rendering on large screens
              width={600} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
            />
          ))}
        </Document>
      </div>
    );
  }

  if (isExcel) {
    return (
      <div className="overflow-auto max-h-screen border mt-2">
        <table className="border-collapse w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {excelHeaders.map((header) => (
                <th key={header} className="border p-2 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {excelData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {/* 4. Fix: Map over HEADERS, not values, to handle empty cells correctly */}
                {excelHeaders.map((header, j) => (
                  <td key={`${i}-${j}`} className="border p-2 whitespace-nowrap">
                    {/* Access property safely */}
                    {String(row[header] ?? "")} 
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded text-red-500 bg-red-50">
      ❌ Unsupported file type: {file.name}
    </div>
  );
};
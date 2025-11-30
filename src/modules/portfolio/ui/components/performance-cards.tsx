"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AllocationItem, MoverItem, PerformerItem } from "@/lib/portfolio-types";

// --- COLORS ---
const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", 
  "#14b8a6", "#d946ef", "#eab308", "#64748b", "#a855f7", 
  "#fb7185", "#22c55e", "#0ea5e9", "#f43f5e", "#a3a3a3"
];

// --- 1. PIE CHART ---
export const AllocationChart = ({ data }: { data: AllocationItem[] }) => {
  if (data.length === 0) return <div className="text-muted-foreground text-sm">No data</div>;
  
  // 1. Calculate Total Value to compute percentages
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Sort by value desc
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          // 2. Updated Formatter to show Percentage
          formatter={(value: number) => {
            const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
            return [
              `$${value.toFixed(2)} (${percent.toFixed(2)}%)`, 
              "Market Value"
            ];
          }}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "8px" }}
          itemStyle={{ color: "#f9fafb" }} 
          labelStyle={{ color: "#e5e7eb", fontWeight: "bold" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ... (Rest of the file remains exactly the same: MoversList, TopPerformersList)
export const MoversList = ({ 
  title, 
  items, 
  type 
}: { 
  title: string; 
  items: MoverItem[]; 
  type: "gainers" | "losers" 
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No stocks moved significantly.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{item.symbol}</span>
                <span className="text-xs text-muted-foreground">${item.price.toFixed(2)}</span>
              </div>
              <div className={`flex items-center text-sm font-medium ${type === 'gainers' ? 'text-green-500' : 'text-red-500'}`}>
                {type === 'gainers' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(item.changePct).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TopPerformersList = ({ 
  items 
}: { 
  items: PerformerItem[] 
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
         <p className="text-sm text-muted-foreground italic">
           No profitable positions yet.
         </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.symbol} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm font-mono w-4">#{idx + 1}</span>
            <span className="font-bold">{item.symbol}</span>
          </div>
          <div className="text-right">
             <div className="text-sm font-medium text-green-500">
               +{item.returnPct.toFixed(2)}%
             </div>
             <div className="text-xs text-muted-foreground">
               +${item.totalPL.toFixed(2)}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
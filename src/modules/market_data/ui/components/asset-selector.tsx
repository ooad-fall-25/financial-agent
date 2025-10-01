"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the possible categories the user can select
export type AssetCategory = "stocks" | "crypto";

interface AssetSelectorProps {
  // A function to call when the user selects a new category
  onValueChange: (value: AssetCategory) => void;
  // The currently selected value
  defaultValue: AssetCategory;
}

export function AssetSelector({ onValueChange, defaultValue }: AssetSelectorProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an asset class" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Asset Classes</SelectLabel>
          <SelectItem value="stocks">Stocks</SelectItem>
          <SelectItem value="crypto">Cryptocurrencies</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
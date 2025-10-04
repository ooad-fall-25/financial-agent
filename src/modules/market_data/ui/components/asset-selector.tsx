// components/asset-selector.tsx (NEW - WITH THE FIX)

"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type AssetCategory = "stocks" | "crypto";

// --- STEP 1: Add the 'value' prop to the interface ---
export interface AssetSelectorProps {
  defaultValue?: AssetCategory; // Can keep this for uncontrolled usage if needed
  value?: AssetCategory; // <-- THE FIX IS HERE: Add the 'value' prop
  onValueChange: (value: AssetCategory) => void;
}

// --- STEP 2: Accept the new 'value' prop ---
export const AssetSelector = ({ defaultValue, value, onValueChange }: AssetSelectorProps) => {
  return (
    <ToggleGroup
      type="single"
      // --- STEP 3: Pass BOTH value and defaultValue down ---
      // The ToggleGroup component knows to prioritize 'value' for controlled behavior.
      defaultValue={defaultValue}
      value={value} // <-- THE FIX IS HERE: Use the 'value' prop
      onValueChange={(value) => {
        // This ensures it doesn't fire with an empty value when deselecting
        if (value) onValueChange(value as AssetCategory);
      }}
    >
      <ToggleGroupItem value="stocks">Stocks</ToggleGroupItem>
      <ToggleGroupItem value="crypto">Crypto</ToggleGroupItem>
    </ToggleGroup>
  );
};
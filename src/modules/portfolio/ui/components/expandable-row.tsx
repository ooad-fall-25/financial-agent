// Renders the extra rows for any asset extending BaseAsset

import React from "react";
import { BaseAsset } from "@/lib/asset-types";
import { AssetHelpers } from "@/lib/asset-helpers";
import { TableHeader, TableRow } from "@/components/ui/table";

interface ExpandableRowProps {
  asset: BaseAsset;
}

export function ExpandableRow({ asset }: ExpandableRowProps) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={7} className="p-2">
        <div className="flex flex-col gap-1">
          <div>{AssetHelpers.formatOpen(asset)}</div>
          <div>{AssetHelpers.formatHigh(asset)}</div>
          <div>{AssetHelpers.formatLow(asset)}</div>
          <div>{AssetHelpers.formatClose(asset)}</div>
          <div>{AssetHelpers.formatVolume(asset)}</div>
          <div>{AssetHelpers.formatPreviousClose(asset)}</div>
        </div>
      </td>
    </tr>
  );
}
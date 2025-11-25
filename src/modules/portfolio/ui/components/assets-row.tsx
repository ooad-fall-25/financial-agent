// Renders rows depending on if its watchlist or holdings
import React, { useState } from "react";
import { WatchlistAsset, HoldingsAsset } from "@/lib/asset-types";
import { AssetHelpers } from "@/lib/asset-helpers"
import { ExpandableRow } from "./expandable-row"

interface AssetsRowProps<T extends WatchlistAsset | HoldingsAsset> {
  asset: T;
  type: "watchlist" | "holding";
}

const AssetsRow = <T extends WatchlistAsset | HoldingsAsset>({
  asset,
  type,
}: AssetsRowProps<T>) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <>
      <tr
        onClick={toggleExpand}
        className="cursor-pointer hover:bg-gray-100"
      >
        <td>{AssetHelpers.formatTickerSymbol(asset)}</td>
        <td>{AssetHelpers.formatCompanyName(asset)}</td>
        <td>{AssetHelpers.formatPriceWithCurrency(asset)}</td>
        <td>{AssetHelpers.formatSector(asset)}</td>

        {type === "holding" && (
          <>
            <td>{AssetHelpers.formatQuantity(asset as HoldingsAsset)}</td>
            <td>{AssetHelpers.formatAverageCost(asset as HoldingsAsset)}</td>
            <td>{AssetHelpers.formatCostBasis(asset as HoldingsAsset)}</td>
            <td>{AssetHelpers.formatMarketValue(asset as HoldingsAsset)}</td>
            <td>{AssetHelpers.formatGainLossPercent(asset as HoldingsAsset)}</td>
            <td>{AssetHelpers.formatUnrealizedGainLoss(asset as HoldingsAsset)}</td>
          </>
        )}

        {type === "watchlist" && (
          <>
            <td>{AssetHelpers.formatPriceChange(asset as WatchlistAsset)}</td>
            <td>{AssetHelpers.formatPriceChangePercent(asset as WatchlistAsset)}</td>
            <td>{AssetHelpers.formatMarketCap(asset as WatchlistAsset)}</td>
            <td>{AssetHelpers.formatPeRatio(asset as WatchlistAsset)}</td>
            <td>{AssetHelpers.format52WeekRange(asset as WatchlistAsset)}</td>
            
          </>
        )}

      </tr>

      {expanded && <ExpandableRow asset={asset} type={type} />}
    </>
  );
};

export default AssetsRow;

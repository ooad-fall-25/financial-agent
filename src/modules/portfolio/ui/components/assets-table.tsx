// Renders the table depending on what type of row component it contains (either watchlist rows or holdings rows)
import { useTRPC } from "@/trpc/client";
import React from "react";

interface AssetsTableProps<T extends BaseAsset> {
    assets: T[];
    type: "watchlist" | "holdings"; // determines which helpers/columns to show
    onRowClick?: (asset: T) => void; // optional callback when row is clicked
    highlightedColumn?: keyof T; // optional column highlight
    sortableColumns?: (keyof T)[];
}

interface Column<T> {
    header: string;
    render: (asset: T) => React.ReactNode;
}

export const HoldingsTable = ({ assets, onRowClick }: { assets: HoldingsAsset[], onRowClick?: (asset: HoldingsAsset) => void }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Cost Basis</th>
                    <th>Market Value</th>
                    <th>Gain / Loss %</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset, idx) => (
                    <tr key={idx} onClick={() => onRowClick?.(asset)}>
                        <td>{asset.tickerSymbol}</td>
                        <td>{asset.companyName}</td>
                        <td>{asset.currency}{asset.currentPrice?.toFixed(2)}</td>
                        <td>{asset.quantity}</td>
                        <td>{asset.costBasis.toFixed(2)}</td>
                        <td>{getMarketValue(asset)?.toFixed(2)}</td>
                        <td>{getGainLossPercent(asset)?.toFixed(2)}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export const WatchlistTable = ({ assets, onRowClick }: { assets: WatchlistAsset[], onRowClick?: (asset: WatchlistAsset) => void }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Price</th>
                    <th>Price Change</th>
                    <th>Price Change %</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset, idx) => (
                    <tr key={idx} onClick={() => onRowClick?.(asset)}>
                        <td>{asset.tickerSymbol}</td>
                        <td>{asset.companyName}</td>
                        <td>{asset.currency}{asset.currentPrice?.toFixed(2)}</td>
                        <td>{getPriceChange(asset)?.toFixed(2)}</td>
                        <td>{getPriceChangePercent(asset)?.toFixed(2)}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export const HoldingsTable = (props: { assets: HoldingsAsset[] }) => {
    return <AssetsTable assets={props.assets} type="holdings" />;
};

export const WatchlistTable = (props: { assets: WatchlistAsset[] }) => {
    return <AssetsTable assets={props.assets} type="watchlist" />;
};
// Helper functions to dynamically calculate certain columns in both holdings and watchlist
import { BaseAsset, WatchlistAsset, HoldingsAsset } from "@/lib/asset-types";

export class AssetHelpers {

    // ======= Base helpers ==========================================================

    // Ticker symbol
    static getTickerSymbol(asset: BaseAsset): string | undefined {
        return asset.tickerSymbol;
    }
    static formatTickerSymbol(asset: BaseAsset): string {
        return this.getTickerSymbol(asset) ?? "-";
    }

    // Company name
    static getCompanyName(asset: BaseAsset): string | undefined {
        return asset.companyName;
    }
    static formatCompanyName(asset: BaseAsset): string {
        return this.getCompanyName(asset) ?? "-";
    }

    // Sector
    static getSector(asset: BaseAsset): string | undefined {
        return asset.sector;
    }
    static formatSector(asset: BaseAsset): string {
        return this.getSector(asset) ?? "-";
    }

    // Format price & currency (e.g. $175.25 USD) (maybe add converted currency here too if got time)
    static getCurrentPrice(asset: BaseAsset): number | undefined {
        return asset.currentPrice;
    }
    static getCurrency(asset: BaseAsset): string | undefined {
        return asset.currency;
    }
    static formatPriceWithCurrency(asset: BaseAsset): string {
        const price = this.getCurrentPrice(asset);
        const currency = this.getCurrency(asset);
        return price !== undefined && currency ? `${price.toFixed(2)} ${currency}` : "-";
    }

    // ======= Expandable row helpers ==========================================================

    // Open
    static getOpen(asset: WatchlistAsset): number | undefined {
        return asset.open;
    }
    static formatOpen(asset: WatchlistAsset): string {
        const open = this.getOpen(asset);
        return open !== undefined ? open.toFixed(2) : "-";
    }

    // High
    static getHigh(asset: WatchlistAsset): number | undefined {
        return asset.high;
    }
    static formatHigh(asset: WatchlistAsset): string {
        const high = this.getHigh(asset);
        return high !== undefined ? high.toFixed(2) : "-";
    }

    // Low
    static getLow(asset: WatchlistAsset): number | undefined {
        return asset.low;
    }
    static formatLow(asset: WatchlistAsset): string {
        const low = this.getLow(asset);
        return low !== undefined ? low.toFixed(2) : "-";
    }

    // Close
    static getClose(asset: WatchlistAsset): number | undefined {
        return asset.close;
    }
    static formatClose(asset: WatchlistAsset): string {
        const close = this.getClose(asset);
        return close !== undefined ? close.toFixed(2) : "-";
    }

    // Volume
    static getVolume(asset: WatchlistAsset): number | undefined {
        return asset.volume;
    }
    static formatVolume(asset: WatchlistAsset): string {
        const volume = this.getVolume(asset);
        return volume !== undefined ? volume.toLocaleString() : "-";
    }

    // Previous close
    static getPreviousClose(asset: WatchlistAsset): number | undefined {
        return asset.previousClose;
    }
    static formatPreviousClose(asset: WatchlistAsset): string {
        const prevClose = this.getPreviousClose(asset);
        return prevClose !== undefined ? prevClose.toFixed(2) : "-";
    }

    // ======= Holdings helpers ==========================================================

    // Quantity
    static getQuantity(asset: HoldingsAsset): number {
        return asset.quantity;
    }
    static formatQuantity(asset: HoldingsAsset): string {
        return this.getQuantity(asset).toString();
    }

    // averageCost (user input)
    static getAverageCost(asset: HoldingsAsset): number {
        return asset.averageCost;
    }
    static formatAverageCost(asset: HoldingsAsset): string {
        return this.getAverageCost(asset).toFixed(2);
    }

    // costBasis (quantity x averageCost)
    static getCostBasis(asset: HoldingsAsset): number {
        return this.getQuantity(asset) * this.getAverageCost(asset);
    }
    static formatCostBasis(asset: HoldingsAsset): string {
        return this.getCostBasis(asset).toFixed(2);
    }

    // Market value = currentPrice x quantity
    static getMarketValue(asset: HoldingsAsset): number | undefined {
        const price = asset.currentPrice;
        return price !== undefined ? price * this.getQuantity(asset) : undefined;
    }
    static formatMarketValue(asset: HoldingsAsset): string {
        return this.getMarketValue(asset)?.toFixed(2) ?? "-";
    }

    // Unrealized gain/loss = marketValue - costBasis
    static getUnrealizedGainLoss(asset: HoldingsAsset): number | undefined {
        const marketValue = this.getMarketValue(asset);
        return marketValue !== undefined ? marketValue - this.getCostBasis(asset) : undefined;
    }
    static formatUnrealizedGainLoss(asset: HoldingsAsset): string {
        return this.getUnrealizedGainLoss(asset)?.toFixed(2) ?? "-";
    }

    // Gain/loss percent = ((currentPrice - averageCost) / averageCost) x 100
    static getGainLossPercent(asset: HoldingsAsset): number | undefined {
        const price = asset.currentPrice;
        return price !== undefined
        ? ((price - this.getAverageCost(asset)) / this.getAverageCost(asset)) * 100
        : undefined;
    }
    static formatGainLossPercent(asset: HoldingsAsset): string {
        const percent = this.getGainLossPercent(asset);
        return percent !== undefined ? `${percent.toFixed(2)}%` : "-";
    }

    // ======= Watchlist helpers ==========================================================

    // marketcap
    static getMarketCap(asset: WatchlistAsset): number | undefined {
        return asset.marketCap;
    }
    static formatMarketCap(asset: WatchlistAsset): string {
        return this.getMarketCap(asset)?.toFixed(2) ?? "-";
    }

    // peRatio
    static getPeRatio(asset: WatchlistAsset): number | undefined {
        return asset.peRatio;
    }
    static formatPeRatio(asset: WatchlistAsset): string {
        return this.getPeRatio(asset)?.toFixed(2) ?? "-";
    }

    // Price change = currentPrice - previousClose
    static getPriceChange(asset: WatchlistAsset): number | undefined {
        const price = asset.currentPrice;
        const prev = asset.previousClose;
        return price !== undefined && prev !== undefined ? price - prev : undefined;
    }
    static formatPriceChange(asset: WatchlistAsset): string {
        return this.getPriceChange(asset)?.toFixed(2) ?? "-";
    }

    // Price change % = (priceChange / previousClose) x 100
    static getPriceChangePercent(asset: WatchlistAsset): number | undefined {
        const change = this.getPriceChange(asset);
        const prev = asset.previousClose;
        return change !== undefined && prev !== undefined ? (change / prev) * 100 : undefined;
    }
    static formatPriceChangePercent(asset: WatchlistAsset): string {
        const percent = this.getPriceChangePercent(asset);
        return percent !== undefined ? `${percent.toFixed(2)}%` : "-";
    }

    // 52-week range
    // Returns the tuple directly
    static get52WeekRange(asset: WatchlistAsset): [number, number] | undefined {
        return asset.fiftyTwoWeekRange;
    }
    // Format for display in table
    static format52WeekRange(asset: WatchlistAsset): string {
        const range = this.get52WeekRange(asset);
        return range ? `${range[0].toFixed(2)} - ${range[1].toFixed(2)}` : "-";
    }

}
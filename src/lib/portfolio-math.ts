import { HoldingItem, PortfolioStats } from "@/lib/portfolio-types";

export function calculatePortfolioStats(holdings: HoldingItem[]): PortfolioStats {
  let totalValue = 0;
  let totalCost = 0;
  let previousTotalValue = 0;

  const allocation: { name: string; value: number; symbol: string }[] = [];
  
  // 1. Calculate Aggregates
  holdings.forEach((h) => {
    const marketValue = h.quantity * h.marketData.price;
    const costBasis = h.quantity * h.avgCost;
    const prevMarketValue = h.quantity * h.marketData.prevClose;

    totalValue += marketValue;
    totalCost += costBasis;
    previousTotalValue += prevMarketValue;

    if (marketValue > 0) {
      allocation.push({
        name: h.symbol, 
        value: marketValue,
        symbol: h.symbol
      });
    }
  });

  // 2. Calculate Top Level Metrics
  const totalUnrealizedPL = totalValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalUnrealizedPL / totalCost) * 100 : 0;
  
  const dailyValueChange = totalValue - previousTotalValue;
  const dailyReturnPct = previousTotalValue > 0 
    ? (dailyValueChange / previousTotalValue) * 100 
    : 0;

  // 3. Prepare Lists for Sorting
  const dailyMovers = holdings.map(h => {
    const change = h.marketData.prevClose > 0 
      ? (h.marketData.price - h.marketData.prevClose) / h.marketData.prevClose 
      : 0;
    return {
      symbol: h.symbol,
      changePct: change * 100,
      price: h.marketData.price
    };
  });

  const allTimePerformers = holdings.map(h => {
    const costBasis = h.quantity * h.avgCost;
    const marketValue = h.quantity * h.marketData.price;
    const ret = costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0;
    return {
      symbol: h.symbol,
      returnPct: ret,
      totalPL: marketValue - costBasis
    };
  });

  // 4. Sort and Slice
  dailyMovers.sort((a, b) => b.changePct - a.changePct);
  
  const count = holdings.length;
  let topCount = 3;
  if (count <= 5) topCount = 2;
  if (count <= 3) topCount = 1;
  if (count <= 1) topCount = 0;

  const topGainers = count > 1 ? dailyMovers.slice(0, topCount).filter(x => x.changePct > 0) : [];
  const topLosers = count > 1 ? dailyMovers.slice(-topCount).reverse().filter(x => x.changePct < 0) : [];

  // Filter for positive returns & take top 5
  allTimePerformers.sort((a, b) => b.returnPct - a.returnPct);
  const topPerformers = allTimePerformers
    .filter(item => item.returnPct > 0) 
    .slice(0, 5);

  return {
    totalValue,
    totalCost,
    totalUnrealizedPL,
    totalReturnPct,
    dailyValueChange,
    dailyReturnPct,
    allocation,
    topGainers,
    topLosers,
    topPerformers
  };
}
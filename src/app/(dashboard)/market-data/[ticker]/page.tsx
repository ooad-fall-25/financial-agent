// This file is for the URL: /market-data/AAPL, /market-data/OPEN, etc.

// The view component itself is a client component, but this page can remain a Server Component.
import { YahooStockView } from '@/modules/market_data/ui/views/yahoo-stock-aggregation-view';

// Define the shape of the props that Next.js will pass to this page.
type StockDetailPageProps = { params: Promise<{ ticker: string }> };

// This is the main component for the dynamic [ticker] route.
export default async function StockDetailPage({ params }: StockDetailPageProps) {
  // await params (Next may provide a thenable)
  const resolvedParams = await params
  const decodedTicker = decodeURIComponent(resolvedParams.ticker);
  return <YahooStockView ticker={decodedTicker} />;
}
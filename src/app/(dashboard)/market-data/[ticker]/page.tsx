// This file is for the URL: /market-data/AAPL, /market-data/OPEN, etc.

// The view component itself is a client component, but this page can remain a Server Component.
import { YahooStockView } from '@/modules/markets/ui/views/yahoo-stock-aggregation-view';

// Define the shape of the props that Next.js will pass to this page.
type StockDetailPageProps = {
  params: {
    ticker: string; // 'ticker' matches the folder name '[ticker]'
  };
};

// This is the main component for the dynamic [ticker] route.
export default function StockDetailPage({ params }: StockDetailPageProps) {
  // Extract the ticker from the URL and pass it as a prop to your view.
  return <YahooStockView ticker={params.ticker} />;
}
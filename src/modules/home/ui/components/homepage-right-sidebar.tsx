import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// TODO: Replace with your actual TRPC data fetching
// Added companyName to the data objects


const trendingData = [
    { symbol: 'TSLA', companyName: 'Tesla, Inc.', price: '183.01', change: '-1.89', percentChange: '-1.02%' },
    { symbol: 'AAPL', companyName: 'Apple Inc.', price: '208.14', change: '+0.65', percentChange: '+0.31%' },
    { symbol: 'NVDA', companyName: 'NVIDIA Corporation', price: '127.08', change: '+2.11', percentChange: '+1.69%' },
    { symbol: 'GME', companyName: 'GameStop Corp.', price: '23.93', change: '-1.22', percentChange: '-4.85%' },
    { symbol: 'bruh', companyName: 'GameStop Corp.', price: '23.93', change: '-1.22', percentChange: '-4.85%' },
    { symbol: 'a', companyName: 'GameStop Corp.', price: '23.93', change: '-1.22', percentChange: '-4.85%' },

];

const portfolioData = [
    { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: '179.22', change: '+1.88', percentChange: '+1.06%' },
    { symbol: 'MSFT', companyName: 'Microsoft Corporation', price: '447.67', change: '-2.11', percentChange: '-0.47%' },
];

export function RightSidebar() {
  const trpc = useTRPC();
  const { 
    data: activesData, 
    isLoading, 
    isError 
  } = useQuery({
    ...trpc.HomeData.fetchMarketScreener.queryOptions({ screenerType: 'most_actives' }),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 bg-card rounded-lg border">
        <p>Failed to load data.</p>
      </div>
    );
  }
  
  if (!activesData || activesData.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border">
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trending Tickers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Trending Tickers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activesData.map((item) => (
              <div key={item.symbol} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div>
                  <div className="font-bold">{item.symbol}</div>
                  {/* Assuming companyName is an object based on the previous error fix */}
                  <div className="text-xs text-muted-foreground">{item.companyName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.price.toFixed(2)}</div>
                  {/* MODIFIED: Added new formatting for percentChange */}
                  <div className={`text-xs ${item.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {item.percentChange > 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">My Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioData.map((item) => (
              <div key={item.symbol} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div>
                  <div className="font-bold">{item.symbol}</div>
                  <div className="text-xs text-muted-foreground">{item.companyName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.price}</div>
                  {/* MODIFIED: Also applied the new formatting here for consistency */}
                  <div className={`text-xs ${item.change.startsWith("-") ? 'text-red-500' : 'text-green-500'}`}>
                    {item.percentChange}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
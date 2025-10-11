import { Card, CardContent } from "@/components/ui/card";

// TODO: Replace with your actual TRPC data fetching
const latestNewsData = [
  { id: 4, title: 'Crude Oil Prices Fluctuate Amid Supply Concerns', source: 'WSJ', time: '6h ago' },
  { id: 5, title: 'New IPOs to Watch in the Coming Quarter', source: 'MarketWatch', time: '8h ago' },
  { id: 6, title: 'Evaluating Green Energy Policies on the Market', source: 'Financial Times', time: '10h ago' },
  { id: 7, title: 'Cryptocurrency Regulation: What to Expect Next', source: 'CoinDesk', time: '11h ago' },
  { id: 8, title: 'Housing Market Shows Signs of Cooling Down', source: 'Reuters', time: '13h ago' },
];

export function LatestNews() {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {latestNewsData.map((item) => (
          <div key={item.id} className="border-b pb-3 last:border-b-0">
            <h3 className="font-semibold leading-tight hover:underline cursor-pointer">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{item.source} • {item.time}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
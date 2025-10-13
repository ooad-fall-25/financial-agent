import { Card, CardContent } from "@/components/ui/card";

// --- SCENARIO 1: User has pinned news ---
// TODO: Replace with your actual TRPC data fetching
const pinnedNewsData = [
  { id: 9, title: 'Why Treasury Bonds Are Attracting Renewed Interest', source: 'Bloomberg', time: '15h ago' },
  { id: 10, title: 'Understanding the Latest Earnings Reports', source: 'The Motley Fool', time: '1d ago' },
  { id: 11, title: 'Federal Reserve Hints at Future Interest Rate Adjustments', source: 'The Wall Street Journal', time: '8h ago' },
  { id: 12, title: 'Tech Stocks Experience Volatility Amid New Regulations', source: 'Reuters', time: '12h ago' },
  { id: 13, title: 'Global Supply Chain Disruptions Continue to Impact Retail Sector', source: 'CNBC', time: '2h ago' },
  { id: 14, title: 'Emerging Markets Show Surprising Growth in Q3', source: 'Financial Times', time: '18h ago' },
  { id: 15, title: 'Crude Oil Prices Fluctuate After OPEC+ Announcement', source: 'Associated Press', time: '5h ago' },
  { id: 16, title: 'Is the Housing Market Finally Cooling Down?', source: 'Forbes', time: '1d ago' },
  { id: 17, title: 'Major Automaker Unveils Ambitious Electric Vehicle Strategy', source: 'MarketWatch', time: '22h ago' }
];

// --- SCENARIO 2: User has no pinned news (uncomment to test) ---
// const pinnedNewsData = [];

export function PinnedNews() {
  if (!pinnedNewsData || pinnedNewsData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No news pinned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {pinnedNewsData.map((item) => (
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
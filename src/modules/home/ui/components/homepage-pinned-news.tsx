import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link'; // Import the Link component

const pinnedNewsData = [
  { id: 9, title: 'Why Treasury Bonds Are Attracting Renewed Interest', source: 'Bloomberg', time: '15h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 10, title: 'Understanding the Latest Earnings Reports', source: 'The Motley Fool', time: '1d ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 11, title: 'Federal Reserve Hints at Future Interest Rate Adjustments', source: 'The Wall Street Journal', time: '8h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 12, title: 'Tech Stocks Experience Volatility Amid New Regulations', source: 'Reuters', time: '12h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 13, title: 'Global Supply Chain Disruptions Continue to Impact Retail Sector', source: 'CNBC', time: '2h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 14, title: 'Emerging Markets Show Surprising Growth in Q3', source: 'Financial Times', time: '18h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 15, title: 'Crude Oil Prices Fluctuate After OPEC+ Announcement', source: 'Associated Press', time: '5h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 16, title: 'Is the Housing Market Finally Cooling Down?', source: 'Forbes', time: '1d ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
  { id: 17, title: 'Major Automaker Unveils Ambitious Electric Vehicle Strategy', source: 'MarketWatch', time: '22h ago', url: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' }
];

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
      <CardContent className="p-4 space-y-2">
        {pinnedNewsData.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="block outline-none focus:outline-none" 
          >
            <div
              className="group overflow-hidden rounded-lg p-3
                         transition-all duration-300 ease-in-out hover:bg-muted/50"
            >
              <div className="transition-transform duration-300 ease-in-out group-hover:scale-[1.03]">
                <h3 className="font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{item.source} • {item.time}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
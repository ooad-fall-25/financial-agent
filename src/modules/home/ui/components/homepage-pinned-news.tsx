import { Card, CardContent } from "@/components/ui/card";

// --- SCENARIO 1: User has pinned news ---
// TODO: Replace with your actual TRPC data fetching
const pinnedNewsData = [
  { id: 9, title: 'Why Treasury Bonds Are Attracting Renewed Interest', source: 'Bloomberg', time: '15h ago' },
  { id: 10, title: 'Understanding the Latest Earnings Reports', source: 'The Motley Fool', time: '1d ago' },
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
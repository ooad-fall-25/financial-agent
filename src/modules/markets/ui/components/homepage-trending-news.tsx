import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// TODO: Replace with your actual TRPC data fetching
const topStory = {
  id: 1,
  title: 'Global Markets Rally on Positive Inflation Data',
  source: 'Reuters',
  time: '2h ago',
};
const subStories = [
  { id: 2, title: 'Tech Stocks Surge as AI Optimism Continues', source: 'Bloomberg', time: '3h ago' },
  { id: 3, title: 'Federal Reserve Hints at Pausing Interest Rate Hikes', source: 'Associated Press', time: '5h ago' },
];

export function TrendingNews() {
  return (
    <div className="space-y-6">
      {/* Top Story with Big Picture */}
      <Card>
        <div className="w-full h-64 bg-muted rounded-t-lg">
          {/* Replace this div with: <Image src="/path/to/image.jpg" alt="Top story" layout="fill" objectFit="cover" /> */}
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{topStory.title}</CardTitle>
          <CardDescription>{topStory.source} • {topStory.time}</CardDescription>
        </CardHeader>
      </Card>

      {/* Two Smaller Stories Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subStories.map((story) => (
          <Card key={story.id}>
            <div className="w-full h-32 bg-muted rounded-t-lg">
              {/* Image placeholder */}
            </div>
            <CardHeader>
              <CardTitle className="text-md leading-tight">{story.title}</CardTitle>
              <CardDescription className="text-xs pt-2">{story.source} • {story.time}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
// This file acts as the entry point for the "/markets" URL.
// Its only job is to render your main discovery view.

import YahooDiscoveryView from '@/modules/market_data/ui/views/yahoo-discovery-view'; // Adjust path if needed

// This is the main component for the /markets route.
// By making it the default export, you tell Next.js to render this.
export default function MarketsPage() {
  return (
    // You can add any page-specific layout here if you want,
    // but simply rendering the view is perfect.
    <YahooDiscoveryView />
  );
}
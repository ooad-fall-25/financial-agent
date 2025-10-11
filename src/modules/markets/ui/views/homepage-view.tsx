"use client";

import { TrendingNews } from "../components/homepage-trending-news";
import { RightSidebar } from "../components/homepage-right-sidebar";
import { LatestNews } from "../components/homepage-latest-news";
import { PinnedNews } from "../components/homepage-pinned-news";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      {/* 
        MAIN LAYOUT: 5-column grid on large screens.
        - News Area: Spans the first 4 columns.
        - Right Sidebar: Spans the last 1 column.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Main Content Area (4/5 of the page) */}
        <main className="lg:col-span-4">
          {/* 
            NESTED GRID for news sections (2:1:1 ratio)
            This internal grid is also 4 columns wide.
          */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* 1. Trending Latest News (2/5 of the news area) */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Trending</h2>
              <TrendingNews />
            </div>

            {/* 2. Latest News (1/5 of the news area) */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Latest News</h2>
              <LatestNews />
            </div>

            {/* 3. Pinned News (1/5 of the news area) */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Pinned News</h2>
              <PinnedNews />
            </div>

          </div>
        </main>

        {/* Right Sidebar (1/5 of the page) */}
        <aside className="lg:col-span-1">
          <RightSidebar />
        </aside>
        
      </div>
    </div>
  );
}
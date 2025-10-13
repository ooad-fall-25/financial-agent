"use client";

import { TrendingNews } from "../components/homepage-trending-news";
import { RightSidebar } from "../components/homepage-right-sidebar";
import { LatestNews } from "../components/homepage-latest-news";
import { PinnedNews } from "../components/homepage-pinned-news";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      {/* 
        MAIN LAYOUT: Switched to a 12-column grid for precise alignment.
        - Main Content: 9 columns (lg:col-span-9)
        - Right Sidebar: 3 columns (lg:col-span-3)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden">
        
        {/* Main Content Area (9/12 of the page) */}
        <main className="lg:col-span-9 h-full overflow-y-auto pr-4 no-scrollbar">
          
          {/* TOP ROW: Contains Trending and Pinned News */}
          {/* This nested grid also uses a 9-column system to match its parent. */}
          <div className="grid grid-cols-1 md:grid-cols-9 gap-8">
            
            {/* 1. Trending News (6/9 of the main area, maintaining 2:1 ratio) */}
            <div className="md:col-span-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">Trending</h2>
              <div className="border-t border-gray-200 pt-4">
                <TrendingNews />
              </div>
            </div>

            {/* 2. Pinned News (3/9 of the main area) */}
            {/* This section now has a width equivalent to 3 columns of the main 12-column grid. */}
            <div className="md:col-span-3 space-y-4">
              <h2 className="text-xl font-bold mb-4">Pinned News</h2>
              <div className="border-t border-gray-200 pt-4">
                <PinnedNews />
              </div>
            </div>
          </div>

          {/* SPACER: Adds visual separation */}
          <div className="my-8"></div>

          {/* 3. Latest News (Full width of the main content area) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Latest News</h2>
            <div className="border-t border-gray-200 pt-4">
              <LatestNews />
            </div>
          </div>
          
        </main>

        {/* Right Sidebar (3/12 of the page) */}
        {/* This now spans 3 columns, making it the same width as the Pinned News section. */}
        <aside className="lg:col-span-3 h-full overflow-y-auto border-l border-gray-200 pl-8 no-scrollbar">
          <RightSidebar />
        </aside>
        
      </div>
    </div>
  );
}
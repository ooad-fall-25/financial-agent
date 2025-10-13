// "use client";

// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useTRPC } from "@/trpc/client";
// import { useQuery } from "@tanstack/react-query";

// export function TrendingNews() {
//   const trpc = useTRPC();
//   const { 
//     data: news, 
//     isLoading, 
//     isError 
//   } = useQuery({
//       ...trpc.HomeData.fetchStockNews.queryOptions({}),
//       refetchOnWindowFocus: false, 
//     });

    
//   if (isLoading) {
//     // ... skeleton code ...
//     return <div>Loading...</div>;
//   }

//   if (isError || !news || news.length < 3) {
//     return <Card className="p-4"><p className="text-red-500">Could not load trending news.</p></Card>;
//   }

//   const topStory = news[0];
//   const subStories = news.slice(1, 3);
//   const topStoryImage = topStory.images.find(img => img.size === 'large');
  
//   return (
//     <div className="space-y-6">
//       {/* Top Story with Big Picture */}
//       <Card>
//         <a href={topStory.url} target="_blank" rel="noopener noreferrer">
//           {/* FIXED: Added 'overflow-hidden' to the parent div to clip the image */}
//           <div className="relative w-full aspect-video bg-muted rounded-t-lg overflow-hidden">
//             {topStoryImage && (
//                <img 
//                   src={topStoryImage.url} 
//                   alt={topStory.headline} 
//                   // The image itself no longer needs rounded corners, as the parent clips it
//                   className="w-full h-full object-cover"
//                />
//             )}
//           </div>
//           <CardHeader className="pt-4">
//             <CardTitle className="text-2xl hover:underline text-center">{topStory.headline}</CardTitle>
//             <CardDescription className="text-center pt-2">{topStory.source} • {new Date(topStory.created_at).toLocaleDateString()}</CardDescription>
//           </CardHeader>
//         </a>
//       </Card>

//       {/* Two Smaller Stories Side-by-Side */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//         {subStories.map((story) => {
//           const storyImage = story.images.find(img => img.size === 'large');
//           return (
//             <Card key={story.id}>
//               <a href={story.url} target="_blank" rel="noopener noreferrer">
//                 {/* FIXED: Also added 'overflow-hidden' here for consistency */}
//                 <div className="relative w-full aspect-video bg-muted rounded-t-lg overflow-hidden">
//                   {storyImage && (
//                       <img 
//                         src={storyImage.url} 
//                         alt={story.headline} 
//                         className="w-full h-full object-cover"
//                       />
//                   )}
//                 </div>
//                 <CardHeader className="pt-4">
//                   <CardTitle className="text-md leading-tight hover:underline">{story.headline}</CardTitle>
//                   <CardDescription className="text-xs pt-2">{story.source} • {new Date(story.created_at).toLocaleDateString()}</CardDescription>
//                 </CardHeader>
//               </a>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from 'next/image'; // Switched to Next.js Image for better performance

export function TrendingNews() {
  const trpc = useTRPC();
  const { 
    data: news, 
    isLoading, 
    isError 
  } = useQuery({
      ...trpc.HomeData.fetchYahooFinanceNews.queryOptions({ limit: 3 }),
      refetchOnWindowFocus: false, 
    });

    
  if (isLoading) {
    // A simple loading placeholder
    return <div>Loading Trending News...</div>;
  }

  const validNews = (news || []).filter(item => item && item.url && item.img && item.title);

  if (isError || validNews.length < 3) {
    return <Card className="p-4"><p className="text-red-500">Could not load trending news.</p></Card>;
  }

  const topStory = validNews[0];
  const subStories = validNews.slice(1, 3);
  
  return (
    <div className="space-y-6">
      {/* Top Story with Big Picture */}
      <a 
        href={topStory.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block outline-none focus:outline-none" 
      >
        <Card className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
          <div className="relative w-full aspect-video bg-muted">
            <Image 
                src={topStory.img} 
                alt={topStory.title} 
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <CardHeader className="pt-4">
            <CardTitle className="text-2xl text-center">{topStory.title}</CardTitle>
            <CardDescription className="text-center pt-2">{topStory.source} • {topStory.ago}</CardDescription>
          </CardHeader>
        </Card>
      </a>

      {/* Two Smaller Stories Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subStories.map((story) => (
          <a 
            key={story.title} 
            href={story.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block h-full outline-none focus:outline-none" 
          >
            <Card className="group h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
              <div className="relative w-full aspect-video bg-muted">
                <Image 
                  src={story.img} 
                  alt={story.title} 
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-md leading-tight">{story.title}</CardTitle>
                <CardDescription className="text-xs pt-2">{story.source} • {story.ago}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
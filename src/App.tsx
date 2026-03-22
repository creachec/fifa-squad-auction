import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MusicProvider, useMusic } from "./contexts/MusicContext";
import ReactPlayer from 'react-player';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// A hidden global player that reads the muted state from Context
const GlobalMusic = () => {
  const { isMuted } = useMusic();
  return (
    <div className="fixed -bottom-96 -left-96 w-1 h-1 overflow-hidden opacity-0 pointer-events-none">
      <ReactPlayer
        url="https://www.youtube.com/embed/videoseries?list=PLCSTyTNJVXhAlk3Mhm87LFZE68tryVLfC"
        playing={!isMuted}
        loop={true}
        muted={false}
        volume={0.15} // Lower volume
        width="100px" // Render size to prevent Youtube blocking
        height="100px"
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
              controls: 0,
              listType: 'playlist',
              list: 'PLCSTyTNJVXhAlk3Mhm87LFZE68tryVLfC',
              // @ts-ignore
              index: Math.floor(Math.random() * 20)
            }
          }
        }}
      />
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <MusicProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalMusic />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MusicProvider>
  </LanguageProvider>
);

export default App;

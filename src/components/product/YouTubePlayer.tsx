import { useState } from "react";
import { Play, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const YouTubePlayer = ({ videoUrl, title = "Product Video", autoplay = false, className }: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(true);

  const videoId = getYouTubeId(videoUrl);
  
  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const openFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden group", className)}>
      {!isPlaying ? (
        <>
          {/* Thumbnail with play button */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to mqdefault if maxresdefault not available
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play button */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Play video"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </button>
          
          {/* Video label */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="bg-primary px-2 py-1 rounded text-xs font-medium text-primary-foreground">
              VIDEO
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">
              {title}
            </span>
          </div>

          {/* External link button */}
          <button
            onClick={openFullscreen}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Open in YouTube"
          >
            <ExternalLink size={16} />
          </button>
        </>
      ) : (
        <>
          {/* YouTube iframe */}
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={openFullscreen}
            >
              <Maximize size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default YouTubePlayer;

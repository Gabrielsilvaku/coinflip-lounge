import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(20);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/casino-music.mp3" type="audio/mpeg" />
      </audio>

      <div className="fixed bottom-6 left-6 z-50">
        <div className="flex items-end gap-3">
          {showControls && (
            <Card className="bg-card-glass border-2 border-primary/40 p-4 shadow-neon-cyan animate-fade-in relative">
              <Button
                onClick={() => setShowControls(false)}
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 bg-transparent border border-primary text-primary hover:bg-primary/10"
              >
                <X size={14} />
              </Button>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMute}
                    size="icon"
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </Button>
                  
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                  
                  <span className="text-xs text-foreground w-8">{volume}%</span>
                </div>
              </div>
            </Card>
          )}
          
          <Button
            onClick={() => setShowControls(!showControls)}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon-cyan"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>
    </>
  );
};

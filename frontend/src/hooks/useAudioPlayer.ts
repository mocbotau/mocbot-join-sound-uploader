import { useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface PlayingAudio {
  id: string;
  element: HTMLAudioElement;
}

export const useAudioPlayer = () => {
  const [playingAudio, setPlayingAudio] = useState<PlayingAudio | null>(null);

  const onPlayPauseAudio = async (soundId: string) => {
    if (playingAudio) {
      playingAudio.element.pause();
      playingAudio.element.currentTime = 0;
      setPlayingAudio(null);

      // don't play same sound again if we just paused it
      if (playingAudio.id === soundId) return;
    }

    try {
      const blob = await apiService.fetchSoundBlob(soundId);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      await audio.play();

      setPlayingAudio({ id: soundId, element: audio });

      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(url);
        toast.error("Failed to play audio");
      };
    } catch (error) {
      console.error("Failed to play audio:", error);
      toast.error("Failed to play audio");
    }
  };

  const stopAudio = () => {
    if (playingAudio) {
      playingAudio.element.pause();
      playingAudio.element.currentTime = 0;
      setPlayingAudio(null);
    }
  };

  const isPlaying = (soundId: string) => {
    return playingAudio?.id === soundId;
  };

  const cleanupDeletedSound = (soundId: string) => {
    if (playingAudio?.id === soundId) {
      stopAudio();
    }
  };

  return {
    onPlayPauseAudio,
    isPlaying,
    cleanupDeletedSound,
  };
};

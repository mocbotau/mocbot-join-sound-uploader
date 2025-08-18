import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

import "react-h5-audio-player/lib/styles.css";
import Navbar from "@/components/Navbar";
import { SoundList } from "@/components/SoundList";
import { ModeSelector } from "@/components/ModeSelector";
import { AlertCard } from "@/components/AlertCard";
import { UploadSection } from "@/components/UploadSection";

import { useAuth } from "@/hooks/useAuth";
import { useSounds } from "@/hooks/useSounds";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const MAX_SOUNDS = 5;

export default function App() {
  const { user, isAuthenticated, token } = useAuth();
  const {
    sounds,
    settings,
    isLoading,
    uploadSounds,
    setActiveSound,
    changeMode,
    deleteSound,
  } = useSounds(user, token);

  const { onPlayPauseAudio, isPlaying, cleanupDeletedSound } = useAudioPlayer();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  const handleUpload = async (files: File[]) => {
    await uploadSounds(files);
    setSelectedFile(null);
    setUploadVisible(false);
  };

  const handleDelete = async (soundId: string) => {
    cleanupDeletedSound(soundId);
    await deleteSound(soundId);
  };

  const showMaxSoundsAlert = sounds.length >= MAX_SOUNDS;
  const showNoActiveSoundAlert =
    !isLoading &&
    sounds.length > 0 &&
    settings?.mode === "single" &&
    !settings?.active_sound_id;

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="mt-16 p-5 max-w-4xl mx-auto w-full font-serif">
        {isAuthenticated && (
          <>
            <h1 className="text-4xl mb-6 font-sans">
              Hi, <span className="text-primary">{user?.name}!</span>
            </h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-2xl font-sans">
                  My Join Sounds
                </CardTitle>
                <ModeSelector
                  settings={settings}
                  soundCount={sounds.length}
                  onModeChange={changeMode}
                />
              </CardHeader>
              <CardContent>
                <AlertCard
                  show={showMaxSoundsAlert}
                  title="Heads up!"
                  description={`You can only add up to ${MAX_SOUNDS} join sounds. Remove any existing sounds to upload new ones.`}
                />

                <AlertCard
                  show={showNoActiveSoundAlert}
                  title="Heads up!"
                  description="You currently do not have an active sound. Click on a sound to activate it!"
                />

                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-[80%] rounded-full" />
                    <Skeleton className="h-6 w-[80%] rounded-full" />
                    <Skeleton className="h-6 w-[80%] rounded-full" />
                  </div>
                ) : (
                  <div
                    className="mb-4 transition-all duration-700 [transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1)] overflow-hidden"
                    style={{
                      maxHeight:
                        sounds.length === 0
                          ? "80px"
                          : `${Math.min(sounds.length * 60 + 20, 400)}px`,
                      opacity: 1,
                    }}
                  >
                    <SoundList
                      sounds={sounds}
                      settings={settings}
                      isPlaying={isPlaying}
                      onSetActive={setActiveSound}
                      onPlay={onPlayPauseAudio}
                      onDelete={handleDelete}
                    />
                  </div>
                )}

                {!isLoading && sounds.length < MAX_SOUNDS && (
                  <UploadSection
                    uploadVisible={uploadVisible}
                    maxSounds={MAX_SOUNDS}
                    onToggleUpload={setUploadVisible}
                    onUpload={handleUpload}
                    selectedFile={selectedFile}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

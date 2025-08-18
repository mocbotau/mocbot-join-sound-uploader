import { Button } from "@/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FaPause, FaPlay, FaTrash } from "react-icons/fa";
import type { Sound } from "@/types";
import type { APISetting } from "@/types/api";

interface SoundListProps {
  sounds: Sound[];
  settings: APISetting | null;
  isPlaying: (soundId: string) => boolean;
  onSetActive: (soundId: string) => void;
  onPlay: (soundId: string) => void;
  onDelete: (soundId: string) => void;
}

export const SoundList = ({
  sounds,
  settings,
  isPlaying,
  onSetActive,
  onPlay,
  onDelete,
}: SoundListProps) => {
  if (sounds.length === 0) {
    return (
      <div className="text-gray-300 py-4">No join sounds uploaded yet.</div>
    );
  }

  return (
    <ul className="space-y-3">
      {sounds.map((sound) => (
        <li
          key={sound.id}
          className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full justify-between transition-all duration-500 ease-in-out"
        >
          <span
            className={`${
              sound.active && settings?.mode === "single"
                ? "font-bold"
                : "text-gray-500"
            } ${
              settings?.mode === "single"
                ? "hover:text-primary transition duration-150 ease-in-out cursor-pointer"
                : "text-white font-bold"
            }`}
            onClick={() => onSetActive(sound.id)}
          >
            {sound.name}
            {sound.active && settings?.mode === "single" && (
              <span className="ml-2 text-primary font-sans">(Active)</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:text-primary"
              onClick={() => onPlay(sound.id)}
            >
              <div>{isPlaying(sound.id) ? <FaPause /> : <FaPlay />}</div>
            </Button>
            <ConfirmDialog
              dialogTrigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-primary"
                >
                  <FaTrash />
                </Button>
              }
              onConfirm={() => onDelete(sound.id)}
              toDelete={sound.name}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
